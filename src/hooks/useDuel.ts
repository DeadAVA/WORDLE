import { useCallback, useRef, useState } from 'react';
import type { DuelState } from '../types';
import { generateRoomCode, randomWord } from '../utils/gameLogic';

type DuelMessage =
  | { type: 'start'; word: string; lang: string; len: number }
  | { type: 'progress'; attempts: number }
  | { type: 'done'; won: boolean; attempts: number }
  | { type: 'rematch'; word: string; lang: string; len: number };

const initDuel = (): DuelState => ({
  active: false, isHost: false, peer: null, conn: null,
  opponentAttempts: 0, opponentFinished: false, opponentWon: false,
  started: false, roomCode: '', status: 'idle',
});

export interface UseDuelReturn {
  duel: DuelState;
  createRoom: (lang: string, len: number, onStart: (word: string, lang: string, len: number) => void, onProgress: (attempts: number) => void, onOpponentDone: (won: boolean, attempts: number) => void, onToast: (msg: string) => void) => Promise<string>;
  joinRoom: (code: string, onStart: (word: string, lang: string, len: number) => void, onProgress: (attempts: number) => void, onOpponentDone: (won: boolean, attempts: number) => void, onToast: (msg: string) => void) => Promise<void>;
  sendProgress: (attempts: number) => void;
  sendDone: (won: boolean, attempts: number) => void;
  requestRematch: (lang: string, len: number, onStart: (word: string, lang: string, len: number) => void) => void;
  closeDuel: () => void;
}

function peerConfig() {
  const { hostname, protocol } = window.location;
  if (protocol === 'https:') {
    return { host: hostname, port: 443, path: '/peerjs', secure: true, debug: 0 };
  }
  // local dev: PeerJS server exposed directly on port 9000
  return { host: hostname, port: 9000, path: '/peerjs', secure: false, debug: 0 };
}

export function useDuel(): UseDuelReturn {
  const [duel, setDuel] = useState<DuelState>(initDuel);
  const connRef = useRef<unknown>(null);

  const closeDuel = useCallback(() => {
    const d = duel;
    if (d.conn) (d.conn as { close: () => void }).close();
    if (d.peer) (d.peer as { destroy: () => void }).destroy();
    setDuel(initDuel());
    connRef.current = null;
  }, [duel]);

  const setupConn = useCallback((
    conn: unknown,
    onProgress: (attempts: number) => void,
    onOpponentDone: (won: boolean, attempts: number) => void,
    onStart?: (word: string, lang: string, len: number) => void,
  ) => {
    const c = conn as {
      on: (evt: string, cb: (...args: unknown[]) => void) => void;
      send: (data: unknown) => void;
    };
    connRef.current = conn;

    c.on('data', (raw: unknown) => {
      const msg = raw as DuelMessage;
      if (msg.type === 'start' && onStart) {
        onStart(msg.word, msg.lang, msg.len);
        setDuel(prev => ({ ...prev, started: true, status: 'playing' }));
      } else if (msg.type === 'progress') {
        setDuel(prev => ({ ...prev, opponentAttempts: msg.attempts }));
        onProgress(msg.attempts);
      } else if (msg.type === 'done') {
        setDuel(prev => ({ ...prev, opponentFinished: true, opponentWon: msg.won, opponentAttempts: msg.attempts }));
        onOpponentDone(msg.won, msg.attempts);
      } else if (msg.type === 'rematch' && onStart) {
        onStart(msg.word, msg.lang, msg.len);
        setDuel(prev => ({
          ...prev, started: true, status: 'playing',
          opponentAttempts: 0, opponentFinished: false, opponentWon: false,
        }));
      }
    });

    c.on('close', () => {
      setDuel(prev => ({ ...prev, status: 'done' }));
    });
  }, []);

  const createRoom = useCallback(async (
    lang: string,
    len: number,
    onStart: (word: string, lang: string, len: number) => void,
    onProgress: (attempts: number) => void,
    onOpponentDone: (won: boolean, attempts: number) => void,
    onToast: (msg: string) => void,
  ): Promise<string> => {
    const { Peer } = await import('peerjs');
    const code = generateRoomCode();
    const peer = new Peer(code, peerConfig());

    setDuel(prev => ({ ...prev, active: true, isHost: true, peer, roomCode: code, status: 'waiting' }));

    return new Promise((resolve, reject) => {
      peer.on('open', () => resolve(code));
      peer.on('connection', (conn: unknown) => {
        const c = conn as { on: (e: string, cb: (...a: unknown[]) => void) => void; send: (d: unknown) => void };
        setupConn(conn, onProgress, onOpponentDone, undefined);
        c.on('open', () => {
          const word = randomWord(lang as 'es' | 'en', len);
          c.send({ type: 'start', word, lang, len });
          onStart(word, lang, len);
          setDuel(prev => ({ ...prev, conn, started: true, status: 'playing' }));
        });
      });
      peer.on('error', (err: unknown) => {
        onToast(`Error: ${(err as Error).message}`);
        reject(err);
      });
    });
  }, [setupConn]);

  const joinRoom = useCallback(async (
    code: string,
    onStart: (word: string, lang: string, len: number) => void,
    onProgress: (attempts: number) => void,
    onOpponentDone: (won: boolean, attempts: number) => void,
    onToast: (msg: string) => void,
  ): Promise<void> => {
    const { Peer } = await import('peerjs');
    const peer = new Peer(peerConfig());

    setDuel(prev => ({ ...prev, active: true, isHost: false, peer, roomCode: code, status: 'connecting' }));

    return new Promise((resolve, reject) => {
      peer.on('open', () => {
        const conn = peer.connect(code, { reliable: true });
        setupConn(conn, onProgress, onOpponentDone, onStart);
        setDuel(prev => ({ ...prev, conn, status: 'connecting' }));
        (conn as { on: (e: string, cb: () => void) => void }).on('open', () => resolve());
      });
      peer.on('error', (err: unknown) => {
        onToast(`Error: ${(err as Error).message}`);
        reject(err);
      });
    });
  }, [setupConn]);

  const sendProgress = useCallback((attempts: number) => {
    const conn = connRef.current as { send?: (d: unknown) => void } | null;
    conn?.send?.({ type: 'progress', attempts });
  }, []);

  const sendDone = useCallback((won: boolean, attempts: number) => {
    const conn = connRef.current as { send?: (d: unknown) => void } | null;
    conn?.send?.({ type: 'done', won, attempts });
    setDuel(prev => ({ ...prev, status: 'done' }));
  }, []);

  const requestRematch = useCallback((
    lang: string,
    len: number,
    onStart: (word: string, lang: string, len: number) => void,
  ) => {
    if (!duel.isHost) return;
    const word = randomWord(lang as 'es' | 'en', len);
    const conn = connRef.current as { send?: (d: unknown) => void } | null;
    conn?.send?.({ type: 'rematch', word, lang, len });
    onStart(word, lang, len);
    setDuel(prev => ({
      ...prev, started: true, status: 'playing',
      opponentAttempts: 0, opponentFinished: false, opponentWon: false,
    }));
  }, [duel.isHost]);

  return { duel, createRoom, joinRoom, sendProgress, sendDone, requestRematch, closeDuel };
}
