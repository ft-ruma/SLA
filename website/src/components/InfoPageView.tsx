import { PAGES, type PageKey } from "@/content";
import { getDict, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/page";
import { Notice } from "./bits";
import { Container, PageHero } from "./PageHero";

export function infoPageMeta(lang: Lang, key: PageKey, path: string) {
  const page = PAGES[key];
  return pageMeta(lang, path, page.title[lang], page.intro[lang]);
}

/** A plain content page: About, Development, Downloads, Privacy and so on. */
export function InfoPageView({ lang, page: key }: { lang: Lang; page: PageKey }) {
  const t = getDict(lang);
  const page = PAGES[key];
  return (
    <>
      <PageHero title={page.title[lang]} intro={page.intro[lang]} />
      <Container className="py-12">
        <div className="flex max-w-3xl flex-col gap-10">
          {page.legalDraft && <Notice>{t.legalDraft}</Notice>}
          {page.sections.map((s) => (
            <section key={s.heading.en}>
              <h2 className="mb-3 text-2xl font-bold text-ink sm:text-3xl">{s.heading[lang]}</h2>
              <p className="text-lg leading-relaxed text-ink/85">{s.body[lang]}</p>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
