import { ShieldCheck } from "lucide-react";
import { Notice } from "@/components/bits";
import { Container, PageHero } from "@/components/PageHero";
import { VerifyIdForm } from "@/components/VerifyIdForm";
import { pageLang, pageMeta, type LangParams } from "@/lib/page";
import { registryConnected } from "@/lib/registry";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams) {
  const { lang, t } = await pageLang(params);
  return pageMeta(lang, "/athletes", t.athletesTitle, t.athletesIntro);
}

export default async function AthletesPage({ params }: LangParams) {
  const { lang, t } = await pageLang(params);
  return (
    <>
      <PageHero kicker={t.navCommunity} title={t.athletesTitle} intro={t.athletesIntro}>
        <div className="max-w-xl">
          <VerifyIdForm lang={lang} label={t.verifyLabel} button={t.verifyButton} invalid={t.verifyInvalid} />
        </div>
      </PageHero>
      <Container className="grid gap-6 py-12 lg:grid-cols-2">
        {!registryConnected() && <div className="lg:col-span-2"><Notice>{t.notConnected}</Notice></div>}
        <p className="flex gap-3 text-sm text-muted">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          {t.privacyNote}
        </p>
        <p className="flex gap-3 text-sm text-muted">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          {t.minorNote}
        </p>
      </Container>
    </>
  );
}
