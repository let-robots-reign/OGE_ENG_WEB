import Link from "next/link";
import type { ReactNode } from "react";

interface AuthSplitLayoutProps {
  children: ReactNode;
  rightPanel: ReactNode;
}

export function AuthSplitLayout({
  children,
  rightPanel,
}: AuthSplitLayoutProps) {
  return (
    <div className="bg-bg fixed inset-0 z-50 grid grid-cols-1 lg:grid-cols-2">
      {/* Left — independently scrollable so the right panel stays viewport-height */}
      <div className="flex min-h-full flex-col overflow-y-auto px-5 pt-8 pb-14 sm:px-8 lg:px-14">
        {/* Logo — in-flow so form content never overlaps it */}
        <Link
          href="/"
          className="text-ink flex shrink-0 items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em]"
        >
          <div className="bg-ink text-on-ink font-display grid h-[30px] w-[30px] place-items-center rounded-[9px] text-[19px] leading-none italic">
            A
          </div>
          ОГЭ Английский
        </Link>

        <div className="mx-auto flex w-full max-w-[504px] flex-1 flex-col justify-center py-10">
          {children}
        </div>

        <div className="text-ink-3 mx-auto flex w-full max-w-[504px] justify-between text-[13px]">
          <span>© 2026 ОГЭ Английский</span>
          {/*<a href="#" className="hover:text-ink transition-colors">Помощь</a>*/}
        </div>
      </div>

      {/* Right — decorative panel */}
      {rightPanel}
    </div>
  );
}
