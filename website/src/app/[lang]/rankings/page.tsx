import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Notice } from "@/components/bits";
import { Container, PageHero } from "@/components/PageHero";
import { ResultTable } from "@/components/ResultTable";
import { RANKINGS } from "@/content";
import { getEvent } from "@/lib/events";
import { fill, formatDate, getDict, isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/page";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ event?: string; gender?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  return pageMeta(lang, "/rankings", t.rankingsTitle, t.rankingsIntro);
}

export default async function RankingsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const q = await searchParams;

  const events = [...new Set(RANKINGS.map((r) => r.event))];
  const event = events.includes(q.event ?? "") ? q.event! : events[0];
  const gender = q.gender === "F" ? "F" : q.gender === "M" ? "M" : RANKINGS.find((r) => r.event === event)?.gender ?? "M";
  const list = RANKINGS.find((r) => r.event === event && r.gender === gender);
  const rows = (list?.rows ?? []).filter((r) => r.wind === undefined || r.wind <= 2.0).sort((a, b) =>
    getEvent(event).measurement === "TIME" ? a.mark - b.mark : b.mark - a.mark);

  const chip = (active: boolean) =>
    `px-3 py-1.5 text-sm font-semibold transition ${active ? "bg-night text-white" : "text-ink ring-1 ring-line hover:bg-black/5"}`;
  const href = (e: string, g: string) => `/${lang}/rankings?event=${encodeURIComponent(e)}&gender=${g}`;

  return (
    <>
      <PageHero kicker={t.navCompete} title={t.rankingsTitle} intro={t.rankingsIntro} />
      <Container className="flex flex-col gap-6 py-12">
        <nav aria-label={t.event} className="flex flex-wrap gap-2">
          {events.map((e) => <Link key={e} href={href(e, gender)} aria-current={e === event ? "page" : undefined} className={chip(e === event)}>{getEvent(e).name[lang]}</Link>)}
        </nav>
        <nav aria-label={t.gender} className="flex gap-2">
          {(["M", "F"] as const).map((g) => <Link key={g} href={href(event, g)} aria-current={g === gender ? "page" : undefined} className={chip(g === gender)}>{g === "M" ? t.men : t.women}</Link>)}
        </nav>
        <Card className="p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold">{getEvent(event).name[lang]} · {gender === "M" ? t.men : t.women}</h2>
            {list && <span className="text-sm font-semibold text-muted">{fill(t.season, { year: list.season })}</span>}
          </div>
          {rows.length ? (
            <ResultTable event={event} rows={rows} t={t}
              extra={{ heading: `${t.competition} · ${t.date}`, cell: (i) => `${rows[i].competition} · ${formatDate(lang, rows[i].date, { day: "numeric", month: "short" })}` }} />
          ) : <p className="text-muted">{t.noRanking}</p>}
        </Card>
        <Notice>{t.rankingsRule}</Notice>
      </Container>
    </>
  );
}
