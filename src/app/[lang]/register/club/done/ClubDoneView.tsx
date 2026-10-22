"use client";

import { CircleCheck, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useT } from "@/components/LangProvider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLUB_DONE_KEY, type ClubDone } from "../ClubRegistration";

export function ClubDoneView() {
  const { t, path } = useT();
  const router = useRouter();
  const [done, setDone] = useState<ClubDone | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CLUB_DONE_KEY);
      if (raw) return setDone(JSON.parse(raw));
    } catch {}
    router.replace(path("/register/club"));
  }, [router, path]);

  if (!done) return null;
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <CircleCheck className="size-14 text-emerald-600" aria-hidden />
      <h1 className="text-2xl font-bold text-balance sm:text-3xl">{t("clubDoneTitle", { name: done.name })}</h1>
      <div className="w-full max-w-sm rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-5">
        <p className="text-sm font-medium text-emerald-900">{t("clubIdLabel")}</p>
        <p data-testid="club-id" className="mt-1 font-mono text-3xl font-bold tracking-wider text-emerald-900">{done.clubId}</p>
      </div>
      <p className="flex max-w-md items-start gap-2 text-left text-sm text-muted-foreground">
        <Clock className="mt-0.5 size-4 shrink-0" aria-hidden /> {t("clubDoneNext")}
      </p>
      <Link href={path("/")} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12")}>{t("backHome")}</Link>
    </div>
  );
}
