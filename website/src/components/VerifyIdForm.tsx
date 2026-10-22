"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isValidSlaaId, normalizeSlaaId } from "@/lib/slaa-id";

export function VerifyIdForm({ lang, label, button, invalid, defaultValue = "" }: {
  lang: string;
  label: string;
  button: string;
  invalid: string;
  defaultValue?: string;
  tone?: "light" | "dark";
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = normalizeSlaaId(value);
    if (!isValidSlaaId(id)) {
      setError(true);
      return;
    }
    setError(false);
    router.push(`/${lang}/athlete/${id}`);
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-full max-w-xl flex-col gap-2">
      <label htmlFor="slaa-id" className="sr-only">{label}</label>
      <div className="flex border border-line">
        <input id="slaa-id" value={value} onChange={(e) => { setValue(e.target.value); setError(false); }}
          placeholder="SL26-000452-8" autoComplete="off" autoCapitalize="characters" spellCheck={false}
          aria-invalid={error} aria-describedby={error ? "slaa-id-error" : undefined}
          className="h-12 min-w-0 flex-1 border-0 bg-white px-4 font-mono tracking-wider uppercase outline-none" />
        <button type="submit" className="inline-flex h-12 items-center gap-2 bg-night px-5 text-sm font-bold text-white hover:bg-black">
          <Search className="size-4" aria-hidden /> {button}
        </button>
      </div>
      {error && <p id="slaa-id-error" role="alert" className="text-sm text-red-700">{invalid}</p>}
    </form>
  );
}
