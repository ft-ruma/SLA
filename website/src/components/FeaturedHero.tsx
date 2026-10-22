"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NewsItem } from "@/content/types";
import type { Dict } from "@/lib/dict/en";
import type { Lang } from "@/lib/langs";
import { NewsArt } from "./NewsCard";

/** Photo-led carousel on the home page, matching the World Athletics hero. */
export function FeaturedHero({ items, lang, t }: { items: NewsItem[]; lang: Lang; t: Dict }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (items.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % items.length), 7000);
    return () => window.clearInterval(id);
  }, [items.length, paused]);

  const item = items[i];
  if (!item) return null;
  const href = `/${lang}/news/${item.slug}`;

  return (
    <section className="relative overflow-hidden bg-night text-white"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {items.map((n, nI) => (
        <div key={n.slug} className={`absolute inset-0 transition-opacity duration-700 ${nI === i ? "opacity-100" : "opacity-0"}`} aria-hidden={nI !== i}>
          <div className={`absolute inset-0 ${nI === i ? "motion-safe:animate-[ken_14s_ease-out_forwards]" : ""}`}>
            <NewsArt category={n.category} />
          </div>
        </div>
      ))}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/45 to-black/15" aria-hidden />
      <div className="relative mx-auto flex min-h-[24rem] max-w-6xl flex-col justify-end px-4 py-8 sm:min-h-[30rem] sm:px-6 sm:py-12 lg:min-h-[38rem] lg:py-16">
        <p className="text-xs font-bold tracking-[0.18em] text-white/80 uppercase">{t[`newsCat_${item.category}` as keyof Dict]}</p>
        <span aria-hidden className="mt-3 mb-4 h-px w-16 bg-accent" />
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.05]">
          <Link href={href} className="decoration-white/70 underline-offset-4 hover:underline">{item.title[lang]}</Link>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-white/75 text-pretty sm:text-base">{item.summary[lang]}</p>
        <Link href={href} className="mt-5 w-fit text-sm font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white">{t.readMore}</Link>
        {items.length > 1 && (
          <div className="mt-8 flex items-center gap-2" role="tablist" aria-label={t.latestNews}>
            {items.map((n, nI) => (
              <button key={n.slug} type="button" role="tab" aria-selected={nI === i} onClick={() => setI(nI)}
                className="py-3">
                <span className={`relative block h-[3px] overflow-hidden bg-white/30 transition-all ${nI === i ? "w-14" : "w-8 hover:bg-white/55"}`}>
                  {nI === i && (
                    <span key={i} className={`absolute inset-0 origin-left bg-accent ${paused ? "[animation-play-state:paused]" : ""} motion-safe:animate-[tick-fill_7s_linear_forwards]`} />
                  )}
                </span>
                <span className="sr-only">{n.title[lang]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
