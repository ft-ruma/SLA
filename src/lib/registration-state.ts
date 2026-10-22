"use client";

import type { Identity } from "./validation";

// Carries the checked identity from step 1 to the form, and the new SLA ID
// to the done page. sessionStorage only: it dies with the tab, and the server
// re-checks everything anyway. The athlete and coach portals keep separate
// entries, so an identity checked in one portal never opens the other form.

export type Role = "athlete" | "coach";
/** Set when the person already has an SLA ID and is adding this role to it. */
export type ExistingMember = { slaaId: string; maskedName: string; district: string };
export type CheckedIdentity = { identity: Identity; role: Role; checkedAt: number; existing?: ExistingMember };
export type DoneInfo = { slaaId: string; name: string; coachLinks: number; role: Role; addedRole?: boolean };

const identityKeyFor = (role: Role) => `slaa.identity.${role}`;
const doneKeyFor = (role: Role) => `slaa.done.${role}`;
const draftKeyFor = (role: Role) => `slaa.draft.${role}`;
const MAX_AGE_MS = 60 * 60 * 1000;

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked: the flow still works within this page load
  }
}

export function saveCheckedIdentity(v: Omit<CheckedIdentity, "checkedAt">) {
  write(identityKeyFor(v.role), { ...v, checkedAt: Date.now() });
}

export function loadCheckedIdentity(role: Role): CheckedIdentity | null {
  const v = read<CheckedIdentity>(identityKeyFor(role));
  if (!v || v.role !== role || Date.now() - v.checkedAt > MAX_AGE_MS) return null;
  return v;
}

export function clearCheckedIdentity(role: Role) {
  write(identityKeyFor(role), null);
}

export function saveDone(v: DoneInfo) {
  write(doneKeyFor(v.role), v);
}

export function loadDone(role: Role): DoneInfo | null {
  return read<DoneInfo>(doneKeyFor(role));
}

// --- answers in progress ---------------------------------------------------
// Kept per tab (sessionStorage) so a reload, a language change or a slow
// network does not lose what was typed. Cleared on successful registration.
// Tied to the checked identity, so a different person starts with a blank form.

export type Draft<V, C> = { identity: string; values: V; coach: C; savedAt: number };

export function identityKey(identity: Identity) {
  return JSON.stringify(identity);
}

export function saveDraft<V, C>(role: Role, identity: Identity, values: V, extra: C) {
  write(draftKeyFor(role), { identity: identityKey(identity), values, coach: extra, savedAt: Date.now() });
}

export function loadDraft<V, C>(role: Role, identity: Identity): Draft<V, C> | null {
  const d = read<Draft<V, C>>(draftKeyFor(role));
  if (!d || d.identity !== identityKey(identity) || Date.now() - d.savedAt > MAX_AGE_MS * 12) return null;
  return d;
}

export function clearDraft(role: Role) {
  write(draftKeyFor(role), null);
}
