import { redirect } from "next/navigation";
import { localePath } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

// There is no shared registration page: /register is the athletes' one.
// Coaches register from the coach portal (/coach).
export default async function RegisterIndex() {
  redirect(localePath(await getLang(), "/register/athlete"));
}
