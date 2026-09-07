import type { TileState } from '../types';

const MAX_GUESSES = 6;

interface TileProps {
  letter: string;
  state: TileState;
  flipDelay: number;
  bounce: boolean;
  bounceDelay: number;
}

function Tile({ letter, state, flipDelay, bounce, bounceDelay }: TileProps) {
  const style = {
    '--flip-delay': `${flipDelay}ms`,
    '--bounce-delay': `${bounceDelay}ms`,
  } as React.CSSProperties;

  const classes = ['tile', state !== 'empty' && state !== 'filled' ? 'evaluated' : '', state, bounce ? 'bounce' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} aria-label={letter || 'empty'}>
      <div className="tile-inner">
        <div className="tile-front">{letter}</div>
        <div className="tile-back">{letter}</div>
      </div>
    </div>
  );
}

interface RowProps {
  letters: string[];
  evaluations: TileState[];
  len: number;
  revealing: boolean;
  shake: boolean;
  bounce: boolean;
}

function Row({ letters, evaluations, len, revealing, shake, bounce }: RowProps) {
  const classes = ['board-row', shake ? 'shake' : ''].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {Array.from({ length: len }, (_, i) => {
        const letter = letters[i] ?? '';
        const evalState: TileState =
          evaluations[i] ?? (letter ? 'filled' : 'empty');
        return (
          <Tile
            key={i}
            letter={letter}
            state={revealing && evaluations[i] ? evaluations[i] : evalState}
            flipDelay={revealing ? i * 350 : 0}
            bounce={bounce && evaluations[i] === 'correct'}
            bounceDelay={i * 100}
          />
        );
      })}
    </div>
  );
}

interface Props {
  guesses: string[];
  evaluations: TileState[][];
  current: string;
  len: number;
  revealing: boolean;
  shakeRow: number | null;
  won: boolean;
}

export function Board({ guesses, evaluations, current, len, revealing, shakeRow, won }: Props) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length) {
      return {
        letters: guesses[i].split(''),
        evals: evaluations[i] ?? [],
        isRevealing: revealing && i === guesses.length - 1,
        shake: shakeRow === i,
        bounce: won && i === guesses.length - 1,
      };
    }
    if (i === guesses.length) {
      return {
        letters: current.split(''),
        evals: [],
        isRevealing: false,
        shake: shakeRow === i,
        bounce: false,
      };
    }
    return { letters: [], evals: [], isRevealing: false, shake: false, bounce: false };
  });

  return (
    <div className="board" aria-label="Tablero de juego">
      {rows.map((row, i) => (
        <Row
          key={i}
          letters={row.letters}
          evaluations={row.evals}
          len={len}
          revealing={row.isRevealing}
          shake={row.shake}
          bounce={row.bounce}
        />
      ))}
    </div>
  );
}
