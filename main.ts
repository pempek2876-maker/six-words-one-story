// Six Words, One Story
// Harness: program/v1 — writes exactly one six-word story (gate: 1-60 chars)
// to /output/entry.txt.
// Deterministic: fixed candidate list, fixed scoring, no randomness, no time,
// no network. Candidates are scored against the published judge brief, in the
// brief's own order:
//   1. a complete story in exactly six words (a fragment, slogan or list loses)
//   2. a turn or surprise, or a whole life implied
//   3. every word earns its place — no filler
//   4. reads aloud cleanly, no awkward or ambiguous phrasing
//   5. leaves the unsaid for the reader to fill in

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

const CANDIDATES: string[] = [
  // A — she kept the voicemail, and plays it daily: loss plus ritual.
  "She kept his voicemail. Played daily.",
  // B — the watch and the man stop together.
  "Grandfather's watch stopped. So did he.",
  // C — one word, "finally", carries a whole career at the wire.
  "The bomb defuser's hands finally shook.",
  // D — he came home from orbit; the dog had forgotten him.
  "Astronaut returned. His dog didn't remember.",
  // E — the proposal, answered by the wrong person.
  "He proposed. Her ex texted: 'yes'.",
  // F — a whole life: separated twins, reunited as rivals.
  "Twins separated. Reunited as rival surgeons.",
  // G — the classified-ad form: a wedding that never happened.
  "For sale: wedding dress, never worn.",
  // H — the keeper's last light: image without a turn.
  "The lighthouse keeper's last light faded.",
];

function wordCount(line: string): number {
  return line.split(/\s+/).filter((w) => w.length > 0).length;
}

// Concrete anchors: a specific object or role the story hangs on.
const ANCHORS = new Set([
  "voicemail", "watch", "dog", "twins", "surgeons", "dress", "lighthouse",
  "keeper's", "defuser's", "hands", "astronaut",
]);

// Stakes: words that carry loss, death, love or a life's work.
const STAKES = new Set([
  "kept", "played", "daily", "stopped", "died", "finally", "shook",
  "returned", "remember", "proposed", "yes", "separated", "reunited",
  "rival", "never", "worn", "last", "faded",
]);

function score(line: string): number {
  let s = 0;
  const toks = line.toLowerCase().split(/[^a-z']+/).filter((t) => t.length > 0);

  // Criterion 1 + 2: two sentence beats — a setup and a turn. A single
  // unbroken sentence can imply, but the two-beat shape lands the turn.
  const beats = line.split(/[.!?]/).filter((p) => p.trim().length > 0).length;
  if (beats === 2) s += 3;

  // Criterion 1: a concrete anchor keeps it a story, not a slogan.
  for (const t of toks) if (ANCHORS.has(t)) s += 2;

  // Criterion 2: stakes words are where the turn and the implied life live.
  for (const t of toks) if (STAKES.has(t)) s += 1;

  // Criterion 5: the unsaid — a short final beat leaves the reader room.
  const parts = line.split(/[.!?]/).filter((p) => p.trim().length > 0);
  if (parts.length === 2 && parts[1].trim().split(/\s+/).length <= 3) s += 2;

  // Criteria 3 + 4: no filler and clean to read aloud — brevity inside the
  // gate, and no punctuation pile-ups.
  if (line.length <= 40) s += 2;
  if (line.includes(":") || line.includes("'yes'")) s -= 1;

  // Criterion 5, freshness: the classified-ad opening ("For sale: …") borrows
  // the most famous six-word form ever written; the brief warns that
  // cleverness for its own sake does not count, so the borrowed form pays.
  if (line.startsWith("For sale:")) s -= 2;

  return s;
}

function pick(candidates: string[]): string {
  let best = candidates[0];
  let bestScore = score(best);
  for (const line of candidates.slice(1)) {
    const s = score(line);
    // Higher score wins; tie-break: shorter line, then earlier candidate.
    if (s > bestScore || (s === bestScore && line.length < best.length)) {
      best = line;
      bestScore = s;
    }
  }
  return best;
}

const line = pick(CANDIDATES);

// The gate, asserted in code: exactly six words, 1-60 characters, one line.
if (wordCount(line) !== 6) {
  throw new Error(`chosen story is not six words: ${wordCount(line)}`);
}
if (line.includes("\n") || line.length < 1 || line.length > 60 || line.trim().length === 0) {
  throw new Error(`chosen story fails the gate: ${line.length} chars`);
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", line + "\n", "utf8");

// Verify what was actually written: six words, 1-60 chars, one line.
const written = readFileSync("/output/entry.txt", "utf8");
const body = written.replace(/\n$/, "");
if (body !== line || wordCount(body) !== 6 || body.length < 1 || body.length > 60 || body.includes("\n")) {
  throw new Error(`written entry failed verification: ${body.length} chars`);
}
console.log(`wrote ${line.length} chars, ${wordCount(line)} words to /output/entry.txt`);
console.log(line);
