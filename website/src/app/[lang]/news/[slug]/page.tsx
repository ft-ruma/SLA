import { notFound } from "next/navigation";
import { ArrowLink } from "@/components/bits";
import { Container, PageHero } from "@/components/PageHero";
import { NEWS } from "@/content";
import type { Dict } from "@/lib/dict/en";
import { formatDate, getDict, isLang, LANGS } from "@/lib/i18n";
import { pageMeta } from "@/lib/page";

type Params = { params: Promise<{ lang: string; slug: string }> };

export const generateStaticParams = () => LANGS.flatMap((lang) => NEWS.map((n) => ({ lang, slug: n.slug })));

async function load(params: Params["params"]) {
  const { lang, slug } = await params;
  const item = NEWS.find((n) => n.slug === slug);
  if (!isLang(lang) || !item) notFound();
  return { lang, t: getDict(lang), item };
}

export async function generateMetadata({ params }: Params) {
  const { lang, item } = await load(params);
  return pageMeta(lang, `/news/${item.slug}`, item.title[lang], item.summary[lang]);
}

export default async function Article({ params }: Params) {
  const { lang, t, item } = await load(params);
  const [first, ...rest] = item.body[lang];
  return (
    <>
      <PageHero
        kicker={`${t[`newsCat_${item.category}` as keyof Dict]} · ${formatDate(lang, item.date)}`}
        title={item.title[lang]}
        intro={item.summary[lang]}
      />
      <Container className="py-12">
        <article className="max-w-2xl">
          {first && <p className="mb-6 text-xl leading-relaxed text-ink/90">{first}</p>}
          {rest.map((p, i) => <p key={i} className="mb-5 text-lg leading-relaxed text-ink/85">{p}</p>)}
        </article>
        <ArrowLink href={`/${lang}/news`} className="mt-6">{t.backToNews}</ArrowLink>
      </Container>
    </>
  );
}
