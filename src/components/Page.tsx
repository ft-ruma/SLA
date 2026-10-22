"use client";

import { cn } from "@/lib/utils";

// Layout pieces shared by the public pages.

/** Centred page column. Forms read best narrow; admin tables need width. */
export function PageContainer({
  size = "form",
  className,
  children,
}: {
  size?: "form" | "wide";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 sm:py-10",
        size === "form" ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Page title block under the portal banner. */
export function PageTitle({ title, intro, kicker }: { title: string; intro?: React.ReactNode; kicker?: string }) {
  return (
    <div>
      {kicker && (
        <p className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-primary uppercase">
          <span className="h-0.5 w-6 rounded-full bg-gold" aria-hidden />
          {kicker}
        </p>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h1>
      {intro && <p className="mt-2 text-sm text-muted-foreground text-pretty sm:text-base">{intro}</p>}
    </div>
  );
}

/**
 * The main action button area. On phones it sticks to the bottom of the
 * screen (above the iPhone home bar) so it is always within thumb reach;
 * on tablets and up it sits in the page normally.
 */
export function StickyActions({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 border-t bg-background/95 px-4 pt-3 backdrop-blur",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none",
      )}
    >
      {children}
    </div>
  );
}
