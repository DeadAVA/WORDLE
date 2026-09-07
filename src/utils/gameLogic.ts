import type { Language, TileState } from '../types';
import { getWordList } from '../data/words';
import { getDailyPhrase } from '../data/phrases';

const EPOCH = new Date(2026, 0, 1); // Jan 1 2026 — change to reset daily cycle

export function dayNumber(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - EPOCH.getTime()) / 86400000);
}

function hashSeed(seed: number): number {
  let a = seed >>> 0;
  a = (a + 0x6D2B79F5) | 0;
  let z = Math.imul(a ^ (a >>> 15), 1 | a);
  z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
  return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
}

export function dailyWord(lang: Language, len: number): string {
  const list = getWordList(lang, len);
  if (!list.length) return '';
  const langOffset = lang === 'es' ? 0 : 7919;
  const seed = dayNumber() * 131 + len * 977 + langOffset;
  return list[Math.floor(hashSeed(seed) * list.length)];
}

export function randomWord(lang: Language, len: number): string {
  const list = getWordList(lang, len);
  if (!list.length) return '';
  return list[Math.floor(Math.random() * list.length)];
}

export function dailyPhrase(lang: Language): string {
  return getDailyPhrase(lang, dayNumber());
}

export function normalizeWord(raw: string): string {
  return String(raw)
    .trim()
    .toUpperCase()
    .replaceAll('Ñ', '\x00')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replaceAll('\x00', 'Ñ');
}

export function evaluateGuess(guess: string, target: string): TileState[] {
  const result: TileState[] = new Array(guess.length).fill('absent');
  const remaining: Record<string, number> = {};

  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
    } else {
      remaining[target[i]] = (remaining[target[i]] ?? 0) + 1;
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    if ((remaining[guess[i]] ?? 0) > 0) {
      result[i] = 'present';
      remaining[guess[i]]--;
    }
  }
  return result;
}

export function buildLetterMap(
  guesses: string[],
  evaluations: TileState[][],
): Record<string, TileState> {
  const map: Record<string, TileState> = {};
  const priority: Record<TileState, number> = { correct: 3, present: 2, absent: 1, empty: 0, filled: 0 };
  guesses.forEach((g, gi) => {
    const evals = evaluations[gi];
    if (!evals) return;
    g.split('').forEach((letter, li) => {
      const state = evals[li];
      if ((priority[state] ?? 0) > (priority[map[letter]] ?? 0)) {
        map[letter] = state;
      }
    });
  });
  return map;
}

export function dailyKey(lang: Language, len: number, gameType: 'word' | 'phrase'): string {
  return `${gameType}:${lang}:${len}:${dayNumber()}`;
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Phrase game helpers
export function getPhraseLetters(phrase: string): Set<string> {
  const letters = new Set<string>();
  for (const ch of phrase) {
    if (ch !== ' ') letters.add(ch);
  }
  return letters;
}

export function isPhraseComplete(phrase: string, revealed: Set<string>): boolean {
  for (const ch of phrase) {
    if (ch !== ' ' && !revealed.has(ch)) return false;
  }
  return true;
}
