import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n";

// Every public page sits under /en, /si or /ta. Any other first segment is
// not a page of this site.
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return children;
}
