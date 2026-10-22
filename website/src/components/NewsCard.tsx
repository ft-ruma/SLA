import { Megaphone, Newspaper, ShieldCheck, Sprout } from "lucide-react";
import Link from "next/link";
import type { NewsCategory, NewsItem } from "@/content/types";
import type { Dict } from "@/lib/dict/en";
import { formatDate, type Lang } from "@/lib/i18n";

const ICONS: Record<NewsCategory, React.ElementType> = {
  news: Newspaper, press: Megaphone, development: Sprout, integrity: ShieldCheck,
};

const ART: Record<NewsCategory, string> = {
  news: "from-[#243656] via-[#152033] to-[#0b1020]",
  press: "from-[#5c2a14] via-[#2a140e] to-[#140c09]",
  development: "from-[#146b45] via-[#0d3d28] to-[#071910]",
  integrity: "from-[#1a4a66] via-[#102838] to-[#0a1218]",
};

/** Stand-in photo: a lit track, until SLA has event photography. */
export function NewsArt({ category, size = "lg" }: { category: NewsCategory; size?: "lg" | "md" | "sm" }) {
  const Icon = ICONS[category];
  return (
    <div aria-hidden className={`absolute inset-0 overflow-hidden bg-linear-to-br ${ART[category]}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_28%,rgba(255,255,255,0.22),transparent_52%)]" />
      <svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="white" transform="translate(300 30)">
          <ellipse cx="250" cy="230" rx="250" ry="158" strokeWidth="34" strokeOpacity="0.14" />
          <ellipse cx="250" cy="230" rx="214" ry="132" strokeWidth="1.5" strokeOpacity="0.22" />
          <ellipse cx="250" cy="230" rx="178" ry="106" strokeWidth="1.5" strokeOpacity="0.18" />
          <ellipse cx="250" cy="230" rx="142" ry="80" strokeWidth="1.5" strokeOpacity="0.14" />
          <path d="M250 72 v78" strokeWidth="4" strokeOpacity="0.45" />
          <path d="M236 72 h28" strokeWidth="3" strokeOpacity="0.35" />
        </g>
      </svg>
      <Icon strokeWidth={1.25} className={`absolute text-white/25 ${
        size === "lg" ? "right-10 bottom-10 size-24" : size === "md" ? "right-4 bottom-4 size-12" : "right-3 bottom-3 size-6"
      }`} />
    </div>
  );
}

export function NewsMeta({ item, lang, t }: { item: NewsItem; lang: Lang; t: Dict }) {
  return (
    <p className="text-[0.8rem] text-muted">
      <time dateTime={item.date}>{formatDate(lang, item.date, { day: "numeric", month: "short", year: "numeric" })}</time>
      <span className="mx-1.5 text-ink/30">|</span>
      <span className="cat">{t[`newsCat_${item.category}` as keyof Dict]}</span>
    </p>
  );
}

export function NewsCard({ item, lang, t, variant = "card" }: {
  item: NewsItem;
  lang: Lang;
  t: Dict;
  variant?: "feature" | "card" | "row";
}) {
  const href = `/${lang}/news/${item.slug}`;

  if (variant === "feature") {
    return (
      <Link href={href} className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden text-white sm:min-h-[28rem]">
        <span className="absolute inset-0 transition duration-700 ease-out group-hover:scale-[1.03]">
          <NewsArt category={item.category} size="lg" />
        </span>
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/10" aria-hidden />
        <div className="relative flex flex-col gap-3 p-6 sm:p-12">
          <p className="text-xs font-bold tracking-[0.16em] text-white/85 uppercase">{t[`newsCat_${item.category}` as keyof Dict]}</p>
          <span aria-hidden className="h-px w-16 bg-white/70" />
          <h3 className="max-w-3xl text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">{item.title[lang]}</h3>
          <p className="max-w-xl text-sm text-white/75 text-pretty sm:text-base">{item.summary[lang]}</p>
          <span className="mt-1 text-sm font-medium underline decoration-white/50 underline-offset-4 group-hover:decoration-white">{t.readMore}</span>
        </div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link href={href} className="group block py-1">
        <NewsMeta item={item} lang={lang} t={t} />
        <h3 className="mt-2 text-lg leading-snug font-bold tracking-tight text-ink text-pretty decoration-accent decoration-2 underline-offset-4 group-hover:underline">{item.title[lang]}</h3>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-night">
        <span className="absolute inset-0 transition duration-700 ease-out group-hover:scale-[1.04]">
          <NewsArt category={item.category} size="md" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 pt-4">
        <NewsMeta item={item} lang={lang} t={t} />
        <h3 className="text-xl leading-snug font-bold tracking-tight text-ink text-pretty decoration-accent decoration-2 underline-offset-4 group-hover:underline">{item.title[lang]}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{item.summary[lang]}</p>
      </div>
    </Link>
  );
}
