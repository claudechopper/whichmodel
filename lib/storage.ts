// Local-only history (last N recommendations). Dexie wrapper around IndexedDB.
// History never leaves the user's browser — privacy by default.

"use client";

import Dexie, { type EntityTable } from "dexie";
import type { HistoryEntry } from "./types";

class WhichModelDB extends Dexie {
  history!: EntityTable<HistoryEntry, "id">;

  constructor() {
    super("whichmodel");
    this.version(1).stores({
      history: "id, createdAt",
    });
  }
}

let _db: WhichModelDB | null = null;

function db(): WhichModelDB {
  if (typeof window === "undefined") {
    throw new Error("storage.ts is client-only — do not import on the server.");
  }
  if (!_db) _db = new WhichModelDB();
  return _db;
}

const MAX_HISTORY = 50;

export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  await db().history.put(entry);
  // Trim oldest beyond MAX_HISTORY.
  const all = await db().history.orderBy("createdAt").toArray();
  if (all.length > MAX_HISTORY) {
    const toDelete = all.slice(0, all.length - MAX_HISTORY);
    await db().history.bulkDelete(toDelete.map((e) => e.id));
  }
}

export async function loadHistory(limit = 10): Promise<HistoryEntry[]> {
  const all = await db().history
    .orderBy("createdAt")
    .reverse()
    .limit(limit)
    .toArray();
  return all;
}

export async function clearHistory(): Promise<void> {
  await db().history.clear();
}
