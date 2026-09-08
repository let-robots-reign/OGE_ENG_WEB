import Groq from "groq-sdk";
import { FinishReason, GoogleGenAI, ThinkingLevel } from "@google/genai";
import { env } from "@/env";

let groq: Groq | undefined;
let gemini: GoogleGenAI | undefined;
// Leave room under Nginx's default 60-second idle timeout to save and return
// feedback. A slow primary must leave some of the shared budget for fallback.
export const DIAGNOSTICS_TIMEOUT_MS = 45_000;
const timeout = 30_000;

export type ProviderReceipt = {
  provider: string;
  model: string;
  elapsedMs: number;
};

export type ProviderAttempt = ProviderReceipt & {
  runId?: string;
  outcome: "success" | "failed" | "cooldown";
  status?: number;
  failure?: string;
  retryAfterMs?: number;
};

export type StructuredRequest = {
  name: string;
  prompt: string;
  input: unknown;
  schema: Record<string, unknown>;
  runId?: string;
  batchKey?: string;
  deadline?: number;
  onCompleted?: (receipt: ProviderReceipt) => void;
  onAttempt?: (attempt: ProviderAttempt) => Promise<void>;
};
type Provider = {
  name: string;
  model?: string;
  generate: (
    request: StructuredRequest & { signal: AbortSignal },
  ) => Promise<string>;
};

function completedContent(
  choice:
    | {
        finish_reason?: string | null;
        message?: { content?: string | null };
      }
    | undefined,
) {
  if (choice?.finish_reason !== "stop" || !choice.message?.content?.trim()) {
    throw new Error("Incomplete provider response");
  }
  return choice.message.content;
}

const providers: Provider[] = [
  {
    name: "Gemini",
    model: "gemini-3.6-flash",
    async generate(request) {
      gemini ??= new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const response = await gemini.models.generateContent({
        model: "gemini-3.6-flash",
        contents: JSON.stringify(request.input),
        config: {
          abortSignal: request.signal,
          systemInstruction: request.prompt,
          maxOutputTokens: 6144,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseJsonSchema: request.schema,
          httpOptions: {
            timeout: remainingTimeout(request),
            retryOptions: { attempts: 1 },
          },
        },
      });
      const candidate = response.candidates?.[0];
      const content = candidate?.content?.parts
        ?.filter((part) => !part.thought)
        .map((part) => part.text ?? "")
        .join("");
      if (candidate?.finishReason !== FinishReason.STOP || !content?.trim()) {
        throw new Error("Incomplete provider response");
      }
      return content;
    },
  },
  {
    name: "Groq",
    model: "openai/gpt-oss-120b",
    async generate(request) {
      groq ??= new Groq({ apiKey: env.GROQ_API_KEY, maxRetries: 0, timeout });
      const response = await groq.chat.completions.create(
        {
          model: "openai/gpt-oss-120b",
          temperature: 0.15,
          reasoning_effort: "low",
          max_completion_tokens: 6144,
          stream: false,
          messages: [
            { role: "system", content: request.prompt },
            { role: "user", content: JSON.stringify(request.input) },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: request.name,
              strict: true,
              schema: request.schema,
            },
          },
        },
        { timeout: remainingTimeout(request), signal: request.signal },
      );
      return completedContent(response.choices[0]);
    },
  },
];

// Shared per server process, including simultaneous student submissions. SDK
// retries are disabled: bounded provider fallback owns retries and cooldowns.
export function createStructuredGenerator(providerList: Provider[]) {
  let active = 0;
  const waiting: Array<() => void> = [];
  const cooldowns = new Map<string, number>();
  return async function generate<T>(
    request: StructuredRequest,
    parse: (content: string) => T,
  ): Promise<T> {
    request = {
      ...request,
      deadline: Math.min(
        request.deadline ?? Infinity,
        Date.now() + DIAGNOSTICS_TIMEOUT_MS,
      ),
    };
    if (active >= 2) {
      if (waiting.length >= 8)
        throw new Error("Очередь проверок заполнена. Попробуй позднее.");
      await new Promise<void>((resolve, reject) => {
        const resume = () => {
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(
          () => {
            const index = waiting.indexOf(resume);
            if (index >= 0) waiting.splice(index, 1);
            reject(
              new Error("Время ожидания проверки истекло. Попробуй позднее."),
            );
          },
          Math.min(15_000, remainingTimeout(request)),
        );
        waiting.push(resume);
      });
    } else active++;
    try {
      for (const provider of providerList) {
        const identity = {
          provider: provider.name,
          model: provider.model ?? "unknown",
          runId: request.runId,
        };
        const cooldown = (cooldowns.get(provider.name) ?? 0) - Date.now();
        if (cooldown > 0) {
          await recordAttempt(request, {
            ...identity,
            outcome: "cooldown",
            elapsedMs: 0,
            retryAfterMs: cooldown,
          });
          continue;
        }
        const started = Date.now();
        let phase: "request" | "validation" = "request";
        try {
          const content = await generateWithinBudget(provider, request);
          phase = "validation";
          const result = parse(content);
          const receipt = {
            provider: provider.name,
            model: provider.model ?? "unknown",
            elapsedMs: Date.now() - started,
          };
          request.onCompleted?.(receipt);
          await recordAttempt(request, {
            ...identity,
            ...receipt,
            outcome: "success",
          });
          console.info("Diagnostics evaluation completed", {
            runId: request.runId,
            batch: request.batchKey,
            kind: request.name,
            ...receipt,
          });
          return result;
        } catch (error) {
          const status = readStatus(error);
          if (status === 429 || status === 503) {
            cooldowns.set(provider.name, Date.now() + retryDelay(error));
          }
          const failure =
            status === 504
              ? "deadline_exceeded"
              : status === 503
                ? "service_unavailable"
                : status === 429
                  ? "rate_limited"
                  : status === 404
                    ? "model_or_endpoint_not_found"
                    : status === 401 || status === 403
                      ? "access_denied"
                      : status === 400
                        ? "invalid_provider_request"
                        : status
                          ? "provider_http_error"
                          : error instanceof SyntaxError
                            ? "invalid_json"
                            : phase === "validation"
                              ? validationFailure(error)
                              : error instanceof Error &&
                                  error.message ===
                                    "Incomplete provider response"
                                ? "incomplete_response"
                                : "request_failed";
          const attempt: ProviderAttempt = {
            ...identity,
            outcome: "failed",
            elapsedMs: Date.now() - started,
            status,
            failure,
            ...(status === 429 || status === 503
              ? { retryAfterMs: retryDelay(error) }
              : {}),
          };
          await recordAttempt(request, attempt);
          // Do not log provider bodies: they may contain student answers.
          console.warn(
            `Diagnostics ${request.name}: ${provider.name} failed; trying fallback`,
            {
              ...attempt,
              batch: request.batchKey,
            },
          );
        }
      }
      throw new Error(
        "Произошла ошибка во время анализа диагностики. Попробуйте позднее.",
      );
    } finally {
      const next = waiting.shift();
      if (next) next();
      else active--;
    }
  };
}

// Only fixed error labels and operational metadata are recorded. Never persist
// raw provider errors/responses: they can contain keys or student answers.
function validationFailure(error: unknown) {
  const messages: Record<string, string> = {
    "Unexpected translation ID": "unexpected_or_duplicate_id",
    "Missing translation evaluations": "missing_evaluations",
    "Inconsistent translation evaluation": "inconsistent_evaluation",
    "Translation topic does not match task": "topic_not_allowed_for_task",
  };
  return error instanceof Error
    ? (messages[error.message] ?? "invalid_schema")
    : "invalid_schema";
}

async function recordAttempt(
  request: StructuredRequest,
  attempt: ProviderAttempt,
) {
  try {
    await request.onAttempt?.(attempt);
  } catch {
    // Observability failure must not turn a valid answer into another paid call.
    console.warn("Diagnostics attempt recording failed", {
      runId: request.runId,
    });
  }
}

function readStatus(error: unknown) {
  if (typeof error !== "object" || !error) return undefined;
  const status =
    "status" in error ? error.status : "code" in error ? error.code : undefined;
  return typeof status === "number" ? status : undefined;
}
function retryDelay(error: unknown) {
  let value: unknown;
  if (typeof error === "object" && error && "headers" in error) {
    const headers = error.headers;
    if (headers instanceof Headers) value = headers.get("retry-after");
    else if (typeof headers === "object" && headers && "retry-after" in headers)
      value = headers["retry-after"];
  }
  if (typeof value === "string") {
    const seconds = Number(value);
    const delay = Number.isFinite(seconds)
      ? seconds * 1000
      : Date.parse(value) - Date.now();
    if (Number.isFinite(delay) && delay > 0) return delay;
  }
  return 60_000;
}

export const generateStructured = createStructuredGenerator(providers);

async function generateWithinBudget(
  provider: Provider,
  request: StructuredRequest,
) {
  const remaining = remainingTimeout(request);
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // Bound the entire SDK call, including response-body consumption, and
    // abort its network request so timed-out work does not continue in parallel.
    return await Promise.race([
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(deadlineExceeded());
          controller.abort();
        }, remaining);
      }),
      provider.generate({ ...request, signal: controller.signal }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function deadlineExceeded() {
  return Object.assign(
    new Error(
      "Время проверки истекло. Повтори отправку: завершённые части сохранены.",
    ),
    { status: 504 },
  );
}

function remainingTimeout(request: StructuredRequest) {
  const remaining = (request.deadline ?? Date.now() + timeout) - Date.now();
  if (remaining <= 0) throw deadlineExceeded();
  return Math.min(timeout, remaining);
}
