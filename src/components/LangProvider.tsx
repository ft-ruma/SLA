"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";
import {
  LANG_LABELS,
  LANGS,
  categoryName,
  districtName,
  eventName,
  localePath,
  provinceOf,
  splitLangPath,
  t,
  tErr,
  type Lang,
  type MessageKey,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LangContext = createContext<Lang>("en");

/**
 * The root layout is not re-rendered when moving between /en, /si and /ta,
 * so the language in the address wins over the one the layout was built with.
 */
export function LangProvider({ lang: initial, children }: { lang: Lang; children: React.ReactNode }) {
  const lang = splitLangPath(usePathname() ?? "/").lang ?? initial;
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Header logo link and footer note, in the current language. */
export function SiteBrand() {
  const { lang, t } = useT();
  const inLangSite = splitLangPath(usePathname() ?? "/").lang !== null;
  return (
    <Link href={inLangSite ? localePath(lang) : "/"}
      className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-gold">
      <Image src="/brand/sla-lion.png" alt="" width={409} height={245} priority className="h-10 w-auto shrink-0 sm:h-11" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-bold sm:text-base">{t("cardOrg")}</span>
        <span className="truncate text-xs text-gold/90">{t("siteTitle")}</span>
      </span>
    </Link>
  );
}

export function SkipLink() {
  const { t } = useT();
  return (
    <a href="#main"
      className="sr-only z-50 rounded-lg bg-gold px-4 py-2 font-semibold text-brand-deep focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
      {t("skipToContent")}
    </a>
  );
}

export function FooterNote() {
  const { t } = useT();
  return <span className="leading-relaxed text-pretty">{t("footer")}</span>;
}

/** Translation helpers bound to the current language. */
export function useT() {
  const lang = useContext(LangContext);
  return useMemo(
    () => ({
      lang,
      t: (key: MessageKey, vars?: Record<string, string>) => t(lang, key, vars),
      tErr: (message: string | undefined | null) => tErr(lang, message),
      district: (d: string) => districtName(lang, d),
      province: (d: string) => provinceOf(lang, d),
      event: (code: string) => eventName(lang, code),
      category: (c: string) => categoryName(lang, c),
      /** "/register" -> "/si/register" in the current language */
      path: (p: string) => localePath(lang, p),
    }),
    [lang],
  );
}

const SHORT: Record<Lang, string> = { en: "EN", si: "සිං", ta: "த" };

/**
 * All three languages, always visible in the header. Each one links to the
 * same page in that language; form answers are kept in this tab's storage,
 * so changing language mid-form loses nothing.
 */
export function LanguageSwitcher() {
  const { lang, t } = useT();
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/admin")) return null;
  const { rest } = splitLangPath(pathname);
  return (
    <nav aria-label={t("langSwitchLabel")}
      className="flex shrink-0 items-center rounded-xl border border-white/25 bg-white/10 p-1">
      {LANGS.map((l) => (
        <Link
          key={l}
          href={localePath(l, rest)}
          lang={l}
          hrefLang={l}
          aria-current={l === lang ? "true" : undefined}
          title={LANG_LABELS[l]}
          className={cn(
            "grid min-h-9 min-w-10 place-items-center rounded-lg px-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-gold",
            l === lang ? "bg-gold text-brand-deep shadow-sm" : "text-white/90 hover:bg-white/15",
          )}
        >
          <span className="sm:hidden">{SHORT[l]}</span>
          <span className="hidden sm:inline">{LANG_LABELS[l]}</span>
        </Link>
      ))}
    </nav>
  );
}
