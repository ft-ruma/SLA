import { cookies } from "next/headers";
import { LANG_COOKIE, isLang, splitLangPath } from "@/lib/i18n";
import { LanguageChoice } from "./LanguageChoice";

// The front page of the site: every first visit starts by choosing a language.
// ?next= is a path without a language (e.g. /register/coach from an old QR
// code); after choosing, the visitor continues there in their language.
export default async function FrontPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // only same-site paths, so the link cannot send people to another website
  const safe = next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
  const chosen = (await cookies()).get(LANG_COOKIE)?.value;
  return <LanguageChoice next={splitLangPath(safe).rest} current={isLang(chosen) ? chosen : null} />;
}
