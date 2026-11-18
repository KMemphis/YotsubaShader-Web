import { Easing, interpolate, useCurrentFrame } from 'remotion';
import timingJson from './timing.json';
import timingEs from './timing.es.json';
import timing2En from './timing.ep02.json';
import timing2Es from './timing.ep02.es.json';
import { CUES_ES, TEXT_ES } from './i18n.es';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** Seconds kept after the last word for the end card. */
export const TAIL = 3.2;

export type Word = { w: string; start: number; end: number };
export type Sentence = { text: string; start: number; end: number; words: Word[] };
export type SceneTiming = { id: string; start: number; end: number; sentences: Sentence[] };

type Timing = { duration: number; leadIn: number; scenes: SceneTiming[] };
export type Lang = 'en' | 'es';
export type EpId = 'ep01' | 'ep02';
const TIMINGS: Record<EpId, Record<Lang, Timing>> = {
  ep01: { en: timingJson as Timing, es: timingEs as Timing },
  ep02: { en: timing2En as Timing, es: timing2Es as Timing },
};
/** The timing of the language being rendered (swapped in place by setLang, so every module sees it). */
export const timing: Timing = { ...TIMINGS.ep01.en };
let LANG: Lang = 'en';
export const setLang = (l: Lang, ep: EpId = 'ep01') => { LANG = l; Object.assign(timing, TIMINGS[ep][l]); };
export const getLang = () => LANG;
export const framesFor = (l: Lang, ep: EpId = 'ep01') => Math.ceil((TIMINGS[ep][l].duration + TAIL) * FPS);
export const TOTAL_FRAMES = framesFor('en');

/** On-screen text: the English string is the key; other languages look it up (missing ones fall back, with a warning). */
export const T = (en: string): string => {
  if (LANG === 'en') return en;
  const v = TEXT_ES[en];
  if (v === undefined) console.warn('[i18n] missing translation:', en);
  return v ?? en;
};

export const scene = (id: string): SceneTiming => {
  const s = timing.scenes.find((x) => x.id === id);
  if (!s) throw new Error('unknown scene ' + id);
  return s;
};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
/** Thousands separator per language: commas in English, thin spaces in Spanish (no dot/comma ambiguity). */
export const fmt = (n: number): string => (LANG === 'en' ? n.toLocaleString('en-US') : n.toLocaleString('en-US').replace(/,/g, '\u202f'));

/** The phrase to look for in the current language's narration. */
const localCue = (id: string, phrase: string) => (LANG === 'en' ? phrase : CUES_ES[id]?.[phrase] ?? phrase);

/**
 * Time (seconds from the start of the video) at which the narrator starts saying `phrase`
 * inside scene `id`. nth picks the n-th occurrence. Visuals are keyed to these, so they stay on the voice.
 */
export function cue(id: string, phrase: string, nth = 0): number {
  const words = scene(id).sentences.flatMap((s) => s.words);
  const target = localCue(id, phrase).split(/\s+/).map(norm).filter(Boolean);
  let seen = 0;
  for (let i = 0; i + target.length <= words.length; i++) {
    if (target.every((t, k) => norm(words[i + k].w) === t)) {
      if (seen++ === nth) return words[i].start;
    }
  }
  throw new Error(`cue not found in ${id}: "${phrase}"`);
}
/** End time of the last word of the phrase. */
export function cueEnd(id: string, phrase: string, nth = 0): number {
  const words = scene(id).sentences.flatMap((s) => s.words);
  const target = localCue(id, phrase).split(/\s+/).map(norm).filter(Boolean);
  let seen = 0;
  for (let i = 0; i + target.length <= words.length; i++) {
    if (target.every((t, k) => norm(words[i + k].w) === t)) {
      if (seen++ === nth) return words[i + target.length - 1].end;
    }
  }
  throw new Error(`cue not found in ${id}: "${phrase}"`);
}

/** Current time in seconds from the start of the video. */
export const useT = () => useCurrentFrame() / FPS;

export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const SOFT = Easing.bezier(0.4, 0, 0.2, 1);

/** 0 -> 1 between seconds a and b (eased). */
export const ramp = (t: number, a: number, b: number, easing = EXPO) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

/** 0 -> 1 -> 0: in between a..b, out between c..d. */
export const pulse = (t: number, a: number, b: number, c: number, d: number) => ramp(t, a, b) * (1 - ramp(t, c, d, SOFT));

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Small deterministic pseudo random in [0,1) so renders are repeatable. */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
