import "server-only";
import { cookies, headers } from "next/headers";
import { LANG_COOKIE, LANG_HEADER, isLang, langFromAcceptLanguage, type Lang } from ".";

/**
 * The page's language: the /en, /si or /ta address segment (passed on by the
 * middleware), then the remembered choice, then the browser's preference.
 */
export async function getLang(): Promise<Lang> {
  const h = await headers();
  const fromPath = h.get(LANG_HEADER);
  if (isLang(fromPath)) return fromPath;
  const chosen = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(chosen)) return chosen;
  return langFromAcceptLanguage(h.get("accept-language"));
}
