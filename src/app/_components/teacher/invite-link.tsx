"use client";

import { useEffect, useState } from "react";
import { inviteUrl } from "./utils";

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

/**
 * The invite-link block: a read-only URL field with a copy button. `size`
 * controls the compact (header) vs large (empty state) layout. Building the URL
 * on the client keeps it origin-correct without server config.
 */
export function InviteLink({
  token,
  size = "sm",
  copyLabel = "Копировать",
}: {
  token: string;
  size?: "sm" | "lg";
  copyLabel?: string;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // window.location is only available on the client.
  useEffect(() => setUrl(inviteUrl(token)), [token]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url || inviteUrl(token));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const codePad = size === "lg" ? "px-3.5 py-3 text-[13px]" : "px-3 py-2.5 text-[12.5px]";
  const btnSize =
    size === "lg" ? "h-[46px] px-5 text-[14.5px]" : "h-[38px] px-3.5 text-[13.5px]";

  return (
    <div className="flex items-center gap-2">
      <code
        className={`text-ink-2 border-line bg-bg min-w-0 flex-1 overflow-hidden rounded-sm border font-mono text-ellipsis whitespace-nowrap ${codePad}`}
      >
        {url || `…/classes/join/${token}`}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className={`bg-ink text-on-ink hover:bg-ink-hover inline-flex shrink-0 items-center gap-1.5 rounded-sm font-medium transition-colors ${btnSize}`}
      >
        <CopyIcon />
        {copied ? "Скопировано" : copyLabel}
      </button>
    </div>
  );
}
