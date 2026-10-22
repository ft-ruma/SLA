"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LANG_COOKIE, LANG_NAMES, LANGS, type Lang } from "@/lib/langs";
import type { NavGroup, NavItem } from "./nav";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function MainNav({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="hidden h-full items-stretch lg:flex">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={isActive(pathname, i.href) ? "page" : undefined}
          className="relative flex items-center px-3 text-[0.8rem] font-bold tracking-[0.12em] text-ink/80 uppercase transition hover:text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition hover:after:scale-x-100 aria-[current=page]:text-ink aria-[current=page]:after:scale-x-100">
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

export function LanguageLinks({ lang, label, tone = "bar" }: { lang: Lang; label: string; tone?: "bar" | "menu" | "dark" }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(si|ta|en)(?=\/|$)/, "");
  const cls = tone === "dark"
    ? "px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wider text-white/45 uppercase hover:text-white aria-[current=true]:text-white"
    : tone === "menu"
      ? "px-3 py-2 text-sm font-bold tracking-wider uppercase text-ink/50 hover:text-ink aria-[current=true]:text-ink"
      : "px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wider text-ink/45 uppercase transition hover:text-ink aria-[current=true]:text-ink";
  return (
    <nav aria-label={label} className="flex items-center gap-0.5">
      {LANGS.map((l) => (
        <Link key={l} href={`/${l}${rest}`} lang={l} hrefLang={l} aria-current={l === lang ? "true" : undefined}
          onClick={() => { document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`; }}
          className={cls}>
          {tone === "bar" ? ({ si: "SI", ta: "TA", en: "EN" } as const)[l] : LANG_NAMES[l]}
        </Link>
      ))}
    </nav>
  );
}

export function MenuPanel({ groups, menu, close, footer }: {
  groups: NavGroup[];
  more?: string;
  menu: string;
  close: string;
  footer: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="site-menu"
        className="grid size-11 place-items-center self-center text-ink">
        {open ? <X className="size-6" strokeWidth={1.75} aria-hidden /> : <Menu className="size-6" strokeWidth={1.75} aria-hidden />}
        <span className="sr-only">{open ? close : menu}</span>
      </button>

      {open && (
        <div id="site-menu" className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 overflow-y-auto bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-8 sm:grid-cols-3 sm:px-8 sm:py-12">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="label mb-5 text-ink">{g.title}</p>
                <ul className="flex flex-col">
                  {g.items.map((i) => (
                    <li key={i.href}>
                      <Link href={i.href} aria-current={isActive(pathname, i.href) ? "page" : undefined}
                        className="block border-b border-line py-3 text-lg font-semibold text-ink hover:text-accent aria-[current=page]:text-accent">
                        {i.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">{footer}</div>
        </div>
      )}
    </>
  );
}
