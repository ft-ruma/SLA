import Link from "next/link";
import { ArrowLink } from "@/components/bits";
import { CompetitionCard } from "@/components/CompetitionCard";
import { FeaturedHero } from "@/components/FeaturedHero";
import { NewsArt, NewsCard } from "@/components/NewsCard";
import { Container, SectionHeading } from "@/components/PageHero";
import { NEWS, RANKINGS, RECORDS } from "@/content";
import { calendar } from "@/lib/competitions";
import { formatMark, getEvent } from "@/lib/events";
import { pageLang, pageMeta, type LangParams } from "@/lib/page";

export const revalidate = 3600;

export async function generateMetadata({ params }: LangParams) {
  const { lang, t } = await pageLang(params);
  return pageMeta(lang, "", t.siteName);
}

export default async function Home({ params }: LangParams) {
  const { lang, t } = await pageLang(params);
  const { live, upcoming } = calendar();
  const featured = NEWS.slice(0, 4);
  const latest = NEWS.slice(0, 6);
  const split = NEWS[1];
  const leaders = RANKINGS.filter((r) => r.rows.length).slice(0, 6);
  const records = RECORDS.filter((r) => r.category === "senior").slice(0, 4);

  return (
    <>
      {live.map((c) => (
        <Link key={c.id} href={`/${lang}/competitions/${c.id}`}
          className="no-print flex items-center justify-center gap-x-3 gap-y-1 bg-clay px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a10f1a]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.14em] uppercase">
            <span className="live-dot size-1.5 rounded-full bg-white" /> {t.liveNow}
          </span>
          <span className="truncate">{c.name[lang]}</span>
          <span className="underline decoration-white/50 underline-offset-4">{t.followLive}</span>
        </Link>
      ))}

      <FeaturedHero items={featured} lang={lang} t={t} />

      <Container className="py-14 sm:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <p className="label text-ink">{t.latestNews}</p>
          <ArrowLink href={`/${lang}/news`}>{t.allNews}</ArrowLink>
        </div>
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
          {latest.map((n) => <NewsCard key={n.slug} item={n} lang={lang} t={t} variant="card" />)}
        </div>
      </Container>

      {split && (
        <section className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center bg-accent px-6 py-14 text-white sm:px-14 sm:py-20">
            <p className="text-xs font-bold tracking-[0.18em] uppercase">{t[`newsCat_${split.category}` as keyof typeof t]}</p>
            <span aria-hidden className="mt-3 mb-5 h-px w-16 bg-white" />
            <h2 className="max-w-lg text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">{split.title[lang]}</h2>
            <p className="mt-4 max-w-md text-base text-white/85 text-pretty">{split.summary[lang]}</p>
            <Link href={`/${lang}/news/${split.slug}`} className="mt-8 w-fit text-sm font-semibold underline decoration-white/50 underline-offset-4 hover:decoration-white">{t.readMore}</Link>
          </div>
          <div className="relative min-h-72 lg:min-h-full">
            <NewsArt category={split.category} />
          </div>
        </section>
      )}

      <Container className="grid gap-14 py-12 sm:py-16 lg:grid-cols-2">
        <div>
          <SectionHeading title={t.nextMeets} action={<ArrowLink href={`/${lang}/calendar`}>{t.fullCalendar}</ArrowLink>} />
          {upcoming.length ? upcoming.slice(0, 4).map((c) => (
            <CompetitionCard key={c.id} c={c} lang={lang} t={t} />
          )) : <p className="text-muted">{t.noUpcoming}</p>}
        </div>
        <div>
          <SectionHeading title={t.seasonLeaders} intro={t.leadersIntro} action={<ArrowLink href={`/${lang}/rankings`}>{t.allRankings}</ArrowLink>} />
          <ul>
            {leaders.map((r) => {
              const top = r.rows[0];
              return (
                <li key={`${r.event}-${r.gender}`} className="border-b border-line">
                  <Link href={`/${lang}/rankings?event=${r.event}&gender=${r.gender}`}
                    className="group -mx-3 flex items-center justify-between gap-4 px-3 py-3.5 transition hover:bg-[#faf7f4]">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid size-7 shrink-0 place-items-center bg-gold text-xs font-extrabold text-night">1</span>
                      <span className="min-w-0">
                        <span className="block text-[0.68rem] font-bold tracking-[0.12em] text-muted uppercase">
                          {getEvent(r.event).name[lang]} · {r.gender === "M" ? t.men : t.women}
                        </span>
                        <span className="mt-0.5 block truncate font-bold group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{top.athlete}</span>
                      </span>
                    </span>
                    <span className="text-lg font-extrabold tabular">{formatMark(r.event, top.mark)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="label mt-10 mb-4 text-ink">{t.nationalRecords}</p>
          <ul>
            {records.map((r) => (
              <li key={`${r.event}-${r.gender}`} className="flex items-baseline justify-between gap-4 border-b border-line py-3.5">
                <span className="min-w-0">
                  <span className="block text-[0.7rem] font-bold tracking-wider text-muted uppercase">{getEvent(r.event).name[lang]} · {r.gender === "M" ? t.men : t.women}</span>
                  <span className="block truncate font-semibold">{r.athlete}</span>
                </span>
                <span className="font-bold tabular">{formatMark(r.event, r.mark)}</span>
              </li>
            ))}
          </ul>
          <ArrowLink href={`/${lang}/records`} className="mt-5">{t.allRecords}</ArrowLink>
        </div>
      </Container>
    </>
  );
}
