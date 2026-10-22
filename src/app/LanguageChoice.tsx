import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LANG_LABELS, LANGS, localePath, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// The first screen: the visitor has not read anything yet, so every line
// here is shown in all three languages. Each choice is a plain link to the
// same page in that language (/en, /si, /ta), so it works before scripts load.
const CONTINUE: Record<Lang, string> = {
  en: "Continue in English",
  si: "සිංහලෙන් ඉදිරියට යන්න",
  ta: "தமிழில் தொடரவும்",
};

const WELCOME: Record<Lang, string> = {
  en: "Welcome to the Sri Lanka Athletics national register",
  si: "ශ්‍රී ලංකා මලල ක්‍රීඩා ජාතික ලේඛනයට සාදරයෙන් පිළිගනිමු",
  ta: "இலங்கை மெய்வல்லுநர் தேசிய பதிவேட்டுக்கு வரவேற்கிறோம்",
};

const SAMPLE: Record<Lang, string> = { en: "Aa", si: "අආ", ta: "அஆ" };

export function LanguageChoice({ next, current }: { next: string; current: Lang | null }) {
  return (
    <div className="track-lanes flex flex-1 flex-col bg-brand text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="text-center">
          <Image src="/brand/sla-logo.png" alt="Sri Lanka Athletics" width={447} height={447} priority
            className="mx-auto mb-6 size-32 rounded-3xl shadow-2xl shadow-black/30 ring-4 ring-gold/80 sm:size-40" />
          <h1 className="text-2xl font-bold text-balance sm:text-4xl">Choose your language</h1>
          <p className="mt-2 text-xl font-semibold text-gold sm:text-2xl" lang="si">භාෂාව තෝරන්න</p>
          <p className="mt-1 text-xl font-semibold text-gold sm:text-2xl" lang="ta">மொழியைத் தெரிவு செய்யவும்</p>
        </div>

        <nav aria-label="Language / භාෂාව / மொழி"
          className="mx-auto mt-10 grid w-full max-w-md gap-4 md:max-w-none md:grid-cols-3">
          {LANGS.map((l) => (
            <Link
              key={l}
              href={localePath(l, next)}
              lang={l}
              hrefLang={l}
              aria-current={current === l ? "true" : undefined}
              className={cn(
                "group relative flex min-h-24 items-center gap-4 rounded-3xl bg-white p-5 text-left text-brand-deep shadow-xl shadow-black/20 transition",
                "hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-gold active:translate-y-0",
                "md:min-h-56 md:flex-col md:items-center md:justify-center md:text-center",
                current === l && "ring-4 ring-gold",
              )}
            >
              <span aria-hidden
                className={cn("grid size-14 shrink-0 place-items-center rounded-2xl bg-brand font-bold text-gold md:size-16",
                  l === "ta" ? "text-lg md:text-xl" : "text-2xl md:text-3xl")}>
                {SAMPLE[l]}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1 md:flex-none">
                <span className="text-2xl font-bold md:text-3xl">{LANG_LABELS[l]}</span>
                <span className="text-sm text-brand-deep/70 md:text-base">{WELCOME[l]}</span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary md:justify-center">
                  {CONTINUE[l]}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </span>
              {current === l && (
                <Check className="absolute top-3 right-3 size-5 text-emerald-600" aria-hidden />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
