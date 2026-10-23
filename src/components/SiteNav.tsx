"use client";

import { ClipboardList, Medal, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { splitLangPath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useT } from "./LangProvider";

/**
 * Public header links: athlete registration, the coach portal and the SLA ID
 * check, each to its own page. Hidden on the language screen and in admin.
 */
export function SiteNav() {
  const { t, path } = useT();
  const pathname = usePathname() ?? "/";
  const { lang, rest } = splitLangPath(pathname);
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  if (!lang) return null;

  const links = [
    { href: "/register/athlete", label: t("navAthleteReg"), icon: <Medal />, active: rest.startsWith("/register/athlete") },
    { href: "/coach", label: t("navCoachPortal"), icon: <ClipboardList />,
      active: rest.startsWith("/coach") || rest.startsWith("/register/coach") },
    { href: "/verify", label: t("navVerify"), icon: <Search />, active: rest.startsWith("/verify") },
  ];
  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
        {links.map((l) => (
          <Link key={l.href} href={path(l.href)} aria-current={l.active ? "page" : undefined}
            className={cn(
              "relative rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-gold",
              l.active ? "text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold" : "text-white/85",
            )}>
            {l.label}
          </Link>
        ))}
      </nav>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav"
        className="grid size-10 place-items-center rounded-xl border border-white/25 bg-white/10 lg:hidden">
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        <span className="sr-only">{t("navMenu")}</span>
      </button>
      {open && (
        <nav id="mobile-nav" aria-label="Main"
          className="site-menu absolute inset-x-0 top-16 z-40 border-t border-white/10 bg-brand px-4 pt-2 pb-4 shadow-xl lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={path(l.href)} aria-current={l.active ? "page" : undefined}
                  className={cn("flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium [&_svg]:size-5 [&_svg]:text-gold",
                    l.active ? "bg-white/15" : "hover:bg-white/10")}>
                  {l.icon} {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
