"use client";

import { Camera, LoaderCircle, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "../LangProvider";

const MAX_BYTES = 3 * 1024 * 1024;

/**
 * Optional coach profile photo. Uploaded straight away (like certificates)
 * and only its id is kept in the form; the preview lives in this tab only.
 */
export function ProfilePhoto({ value, onChange, error }: {
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const { t, tErr } = useT();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function upload(file: File) {
    setProblem(null);
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setProblem("The photo must be a JPG or PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setProblem("The file is larger than 3 MB.");
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", "photo");
      const res = await fetch("/api/register/coach/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.id !== "string") {
        setProblem(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setPreview(URL.createObjectURL(file));
      onChange(data.id);
    } catch {
      setProblem("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const shown = problem ?? error;
  return (
    <div className="flex items-center gap-4 rounded-xl border border-dashed bg-muted/20 p-3 sm:p-4" id="photoId">
      <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--coach-ink)]/10 text-[var(--coach-ink)] ring-4 ring-gold/40">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={t("photoPreview")} className="size-full object-cover" />
        ) : value ? (
          <Camera className="size-8" aria-hidden />
        ) : (
          <UserRound className="size-9" aria-hidden />
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-sm font-medium">
          {t("photoTitle")} <span className="font-normal text-muted-foreground">{t("optional")}</span>
        </span>
        <span className="text-xs text-muted-foreground text-pretty">{value ? t("photoAdded") : t("photoHint")}</span>
        <div className="flex flex-wrap gap-2">
          <input ref={input} type="file" className="sr-only" accept="image/jpeg,image/png" aria-label={t("photoTitle")}
            data-testid="photo-input" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}
            className="h-auto min-h-10 gap-2 rounded-xl px-3">
            {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Camera className="size-4" aria-hidden />}
            {busy ? t("qualUploading") : value ? t("photoChange") : t("photoAdd")}
          </Button>
          {value && !busy && (
            <button type="button" onClick={() => { setPreview(null); onChange(""); }}
              className="flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="size-4" aria-hidden /> {t("remove")}
            </button>
          )}
        </div>
        {shown && <p role="alert" className="text-sm text-destructive">{tErr(shown)}</p>}
      </div>
    </div>
  );
}
