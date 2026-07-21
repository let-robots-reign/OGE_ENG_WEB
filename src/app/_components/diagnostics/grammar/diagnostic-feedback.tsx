"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

// The AI returns the feedback with CORRECT[...] / INCORRECT[...] markers.
// Replace INCORRECT first — "INCORRECT" contains the substring "CORRECT",
// so the CORRECT regex would otherwise match inside it.
const processFeedback = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/INCORRECT\[(.*?)\]/g, '<span class="fb-incorrect">$1</span>')
    .replace(/CORRECT\[(.*?)\]/g, '<span class="fb-correct">$1</span>');
};

export function DiagnosticFeedback({ feedback }: { feedback: string }) {
  const processed = processFeedback(feedback);

  return (
    <div className="border-line bg-surface rounded-lg border p-5 sm:p-9">
      <div className="text-ink-2 [&_h2]:font-display [&_h2]:text-ink [&_h3]:text-accent [&_strong]:text-ink [&_hr]:border-line text-[15px] leading-[1.75] whitespace-pre-wrap sm:text-[16px] [&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:text-[23px] [&_h2]:font-medium [&_h2]:tracking-[-0.02em] [&_h2]:whitespace-normal sm:[&_h2]:text-[28px] [&_h3]:mt-7 [&_h3]:mb-2.5 [&_h3]:font-mono [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:tracking-[0.1em] [&_h3]:whitespace-normal [&_h3]:uppercase [&_hr]:my-6 [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2.5 [&_strong]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&>*:first-child]:mt-0">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{processed}</ReactMarkdown>
      </div>
    </div>
  );
}
