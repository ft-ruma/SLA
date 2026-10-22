import { Container, PageHero } from "@/components/PageHero";
import { pageLang, pageMeta, type LangParams } from "@/lib/page";
import { portal } from "@/lib/portal";

export async function generateMetadata({ params }: LangParams) {
  const { lang, t } = await pageLang(params);
  return pageMeta(lang, "/coaches", t.coachesTitle, t.coachesIntro);
}

export default async function CoachesPage({ params }: LangParams) {
  const { lang, t } = await pageLang(params);
  return (
    <>
      <PageHero kicker={t.navCommunity} title={t.coachesTitle} intro={t.coachesIntro} />
      <Container className="py-12">
        <div className="max-w-2xl">
          <p className="text-lg text-ink/85">{t.coachesSoon}</p>
          <a href={portal.coach(lang)} className="mt-6 inline-block text-sm font-bold tracking-wide text-accent uppercase hover:underline">{t.registerCoach}</a>
        </div>
      </Container>
    </>
  );
}
