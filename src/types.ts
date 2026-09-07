export type Language = 'es' | 'en';
export type GameType = 'word' | 'phrase';
export type GameMode = 'daily' | 'free' | 'duel';
export type TileState = 'correct' | 'present' | 'absent' | 'empty' | 'filled';
export type LetterState = 'correct' | 'present' | 'absent' | 'unused';
export type ModalKind = 'help' | 'stats' | 'duel' | 'result' | null;

export interface Evaluation {
  letter: string;
  state: TileState;
}

export interface GameState {
  lang: Language;
  gameType: GameType;
  mode: GameMode;
  len: number;
  target: string;
  guesses: string[];
  evaluations: TileState[][];
  current: string;
  finished: boolean;
  won: boolean;
  revealing: boolean;
}

export interface DuelState {
  active: boolean;
  isHost: boolean;
  peer: unknown;
  conn: unknown;
  opponentAttempts: number;
  opponentFinished: boolean;
  opponentWon: boolean;
  started: boolean;
  roomCode: string;
  status: 'idle' | 'waiting' | 'connecting' | 'playing' | 'done';
}

export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  distribution: Record<string, number>;
}

export interface DailyProgress {
  guesses: string[];
  evaluations: TileState[][];
  finished: boolean;
  won: boolean;
  date: string;
}

export interface Config {
  lang: Language;
  len: number;
  gameType: GameType;
  mode: GameMode;
}

export interface PhraseState {
  phrase: string;
  revealedLetters: Set<string>;
  guessedWords: string[];
  finished: boolean;
  won: boolean;
}

export interface ToastMessage {
  id: number;
  text: string;
  duration?: number;
}
