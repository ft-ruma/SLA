import { COMPETITIONS } from "@/content";
import type { Competition } from "@/content/types";
import { todayInColombo } from "./i18n";

export type CompetitionStatus = "live" | "upcoming" | "completed";

export function statusOf(c: Competition, today = todayInColombo()): CompetitionStatus {
  if (today < c.start) return "upcoming";
  if (today > c.end) return "completed";
  return "live";
}

export function entriesOpen(c: Competition, today = todayInColombo()) {
  return !!c.entryDeadline && today <= c.entryDeadline;
}

/** Whole days from today until the competition starts. */
export function daysUntil(c: Competition, today = todayInColombo()) {
  return Math.round((Date.parse(c.start) - Date.parse(today)) / 86_400_000);
}

export function getCompetition(id: string) {
  return COMPETITIONS.find((c) => c.id === id);
}

export function calendar(today = todayInColombo()) {
  const sorted = [...COMPETITIONS].sort((a, b) => a.start.localeCompare(b.start));
  return {
    live: sorted.filter((c) => statusOf(c, today) === "live"),
    upcoming: sorted.filter((c) => statusOf(c, today) === "upcoming"),
    past: sorted.filter((c) => statusOf(c, today) === "completed").reverse(),
  };
}
