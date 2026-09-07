import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { GameState, Language, GameType, GameMode, TileState } from '../types';
import {
  dailyWord, randomWord, dailyPhrase, evaluateGuess,
  buildLetterMap, dailyKey, normalizeWord, isPhraseComplete,
} from '../utils/gameLogic';
import {
  loadConfig, saveConfig, loadDailyProgress, saveDailyProgress, updateStats,
} from '../utils/storage';
import { isAccepted } from '../data/accepted';

const MAX_GUESSES = 6;
const PHRASE_MAX_GUESSES = 5;
const PHRASE_WORD_LEN = 5;

type Action =
  | { type: 'SET_LANG'; lang: Language }
  | { type: 'SET_LEN'; len: number }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_GAME_TYPE'; gameType: GameType }
  | { type: 'SET_TARGET'; target: string }
  | { type: 'TYPE_LETTER'; letter: string }
  | { type: 'DELETE_LETTER' }
  | { type: 'SUBMIT_GUESS'; onToast: (msg: string) => void; onResult: () => void; onDuelProgress?: (attempts: number) => void }
  | { type: 'REVEAL_DONE' }
  | { type: 'RESTORE'; state: GameState }
  | { type: 'RESET' };

function makeInitialState(
  overrides: Partial<GameState> = {},
): GameState {
  const cfg = loadConfig();
  return {
    lang: cfg.lang ?? 'es',
    gameType: cfg.gameType ?? 'word',
    mode: cfg.mode ?? 'daily',
    len: cfg.len ?? 5,
    target: '',
    guesses: [],
    evaluations: [],
    current: '',
    finished: false,
    won: false,
    revealing: false,
    ...overrides,
  };
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_LANG':
      return { ...state, lang: action.lang };
    case 'SET_LEN':
      return { ...state, len: action.len };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_GAME_TYPE':
      return { ...state, gameType: action.gameType };
    case 'SET_TARGET':
      return { ...state, target: action.target };
    case 'TYPE_LETTER': {
      if (state.finished || state.revealing) return state;
      const maxLen = state.gameType === 'phrase' ? PHRASE_WORD_LEN : state.len;
      if (state.current.length >= maxLen) return state;
      return { ...state, current: state.current + action.letter };
    }
    case 'DELETE_LETTER':
      if (state.finished || state.revealing) return state;
      return { ...state, current: state.current.slice(0, -1) };
    case 'SUBMIT_GUESS': {
      const { onToast, onResult, onDuelProgress } = action;
      if (state.finished || state.revealing) return state;

      const maxLen = state.gameType === 'phrase' ? PHRASE_WORD_LEN : state.len;
      if (state.current.length !== maxLen) {
        onToast(state.lang === 'es' ? `Faltan ${maxLen - state.current.length} letra(s)` : `Need ${maxLen - state.current.length} more letter(s)`);
        return state;
      }

      const guess = normalizeWord(state.current);

      if (state.gameType === 'word') {
        if (!isAccepted(guess, state.lang)) {
          onToast(state.lang === 'es' ? 'Palabra no reconocida' : 'Word not found');
          return state;
        }
        const evals = evaluateGuess(guess, state.target);
        const newGuesses = [...state.guesses, guess];
        const newEvals = [...state.evaluations, evals];
        const won = evals.every(e => e === 'correct');
        const maxG = MAX_GUESSES;
        const finished = won || newGuesses.length >= maxG;

        if (finished) {
          const dkKey = dailyKey(state.lang, state.len, 'word');
          updateStats(dkKey, won, newGuesses.length);
          if (state.mode === 'daily') {
            saveDailyProgress(dailyKey(state.lang, state.len, 'word'), {
              guesses: newGuesses, evaluations: newEvals, finished: true, won, date: new Date().toISOString(),
            });
          }
          setTimeout(onResult, 1800);
        } else if (state.mode === 'daily') {
          saveDailyProgress(dailyKey(state.lang, state.len, 'word'), {
            guesses: newGuesses, evaluations: newEvals, finished: false, won: false, date: new Date().toISOString(),
          });
        }

        if (onDuelProgress) onDuelProgress(newGuesses.length);

        return {
          ...state,
          guesses: newGuesses,
          evaluations: newEvals,
          current: '',
          finished,
          won,
          revealing: true,
        };
      }

      // Phrase mode
      if (!isAccepted(guess, state.lang)) {
        onToast(state.lang === 'es' ? 'Palabra no reconocida' : 'Word not found');
        return state;
      }

      const phraseLetters = new Set(state.target.replace(/ /g, '').split(''));
      // Recompute revealed letters from all guesses including the new one
      const revealedAfter = new Set<string>();
      for (const g of [...state.guesses, guess]) {
        for (const l of g.split('')) {
          if (phraseLetters.has(l)) revealedAfter.add(l);
        }
      }
      const newGuessedWords = [...state.guesses, guess];
      const won = isPhraseComplete(state.target, revealedAfter);
      const finished = won || newGuessedWords.length >= PHRASE_MAX_GUESSES;

      if (finished) setTimeout(onResult, 1200);

      return {
        ...state,
        guesses: newGuessedWords,
        current: '',
        finished,
        won,
        revealing: false,
      };
    }
    case 'REVEAL_DONE':
      return { ...state, revealing: false };
    case 'RESTORE':
      return action.state;
    case 'RESET':
      return { ...state, guesses: [], evaluations: [], current: '', finished: false, won: false, revealing: false, target: '' };
    default:
      return state;
  }
}

export interface UseGameReturn {
  state: GameState;
  letterMap: Record<string, TileState>;
  revealedLetters: Set<string>;
  setLang: (l: Language) => void;
  setLen: (n: number) => void;
  setMode: (m: GameMode) => void;
  setGameType: (t: GameType) => void;
  typeLetter: (l: string) => void;
  deleteLetter: () => void;
  submitGuess: (opts?: { onDuelProgress?: (n: number) => void }) => void;
  startGame: (overrides?: Partial<{ target: string; mode: GameMode; lang: Language; len: number; gameType: GameType }>) => void;
  onToast: (msg: string) => void;
  setToastHandler: (fn: (msg: string) => void) => void;
  setResultHandler: (fn: () => void) => void;
}

export function useGame(): UseGameReturn {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => makeInitialState());
  const toastRef = useRef<(msg: string) => void>(() => {});
  const resultRef = useRef<() => void>(() => {});
  const revealedLettersRef = useRef<Set<string>>(new Set());

  // Compute revealed letters for phrase mode
  if (state.gameType === 'phrase' && state.target) {
    const phraseLetters = new Set(state.target.replace(/ /g, '').split(''));
    const revealed = new Set<string>();
    for (const g of state.guesses) {
      for (const l of g.split('')) {
        if (phraseLetters.has(l)) revealed.add(l);
      }
    }
    revealedLettersRef.current = revealed;
  }

  const revealedLetters = state.gameType === 'phrase' ? revealedLettersRef.current : new Set<string>();

  // Handle reveal animation end
  useEffect(() => {
    if (!state.revealing) return;
    const t = setTimeout(() => dispatch({ type: 'REVEAL_DONE' }), state.len * 350 + 400);
    return () => clearTimeout(t);
  }, [state.revealing, state.len]);

  const startGame = useCallback((overrides: Partial<{ target: string; mode: GameMode; lang: Language; len: number; gameType: GameType }> = {}) => {
    const lang = overrides.lang ?? state.lang;
    const len = overrides.len ?? state.len;
    const mode = overrides.mode ?? state.mode;
    const gameType = overrides.gameType ?? state.gameType;

    saveConfig({ lang, len, mode, gameType });

    let target = overrides.target ?? '';
    if (!target) {
      if (gameType === 'phrase') {
        target = dailyPhrase(lang);
      } else if (mode === 'daily') {
        target = dailyWord(lang, len);
      } else {
        target = randomWord(lang, len);
      }
    }

    // Try to restore daily progress
    if (mode === 'daily' && gameType === 'word') {
      const dk = dailyKey(lang, len, 'word');
      const saved = loadDailyProgress(dk);
      if (saved?.finished) {
        dispatch({
          type: 'RESTORE', state: {
            lang, gameType, mode, len, target,
            guesses: saved.guesses,
            evaluations: saved.evaluations,
            current: '', finished: true, won: saved.won, revealing: false,
          }
        });
        return;
      }
      if (saved) {
        dispatch({
          type: 'RESTORE', state: {
            lang, gameType, mode, len, target,
            guesses: saved.guesses,
            evaluations: saved.evaluations,
            current: '', finished: false, won: false, revealing: false,
          }
        });
        return;
      }
    }

    dispatch({
      type: 'RESTORE', state: {
        lang, gameType, mode, len, target,
        guesses: [], evaluations: [], current: '',
        finished: false, won: false, revealing: false,
      }
    });
  }, [state.lang, state.len, state.mode, state.gameType]);

  const setLang = useCallback((l: Language) => {
    dispatch({ type: 'SET_LANG', lang: l });
  }, []);

  const setLen = useCallback((n: number) => {
    dispatch({ type: 'SET_LEN', len: n });
  }, []);

  const setMode = useCallback((m: GameMode) => {
    dispatch({ type: 'SET_MODE', mode: m });
  }, []);

  const setGameType = useCallback((t: GameType) => {
    dispatch({ type: 'SET_GAME_TYPE', gameType: t });
  }, []);

  const typeLetter = useCallback((l: string) => {
    dispatch({ type: 'TYPE_LETTER', letter: l });
  }, []);

  const deleteLetter = useCallback(() => {
    dispatch({ type: 'DELETE_LETTER' });
  }, []);

  const submitGuess = useCallback((opts: { onDuelProgress?: (n: number) => void } = {}) => {
    dispatch({
      type: 'SUBMIT_GUESS',
      onToast: toastRef.current,
      onResult: resultRef.current,
      onDuelProgress: opts.onDuelProgress,
    });
  }, []);

  const setToastHandler = useCallback((fn: (msg: string) => void) => {
    toastRef.current = fn;
  }, []);

  const setResultHandler = useCallback((fn: () => void) => {
    resultRef.current = fn;
  }, []);

  const letterMap = buildLetterMap(state.guesses, state.evaluations);

  return {
    state,
    letterMap,
    revealedLetters,
    setLang,
    setLen,
    setMode,
    setGameType,
    typeLetter,
    deleteLetter,
    submitGuess,
    startGame,
    onToast: toastRef.current,
    setToastHandler,
    setResultHandler,
  };
}
