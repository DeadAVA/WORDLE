import type { GameMode, GameType, Language } from '../types';

interface Props {
  lang: Language;
  len: number;
  mode: GameMode;
  gameType: GameType;
  onLang: (l: Language) => void;
  onLen: (n: number) => void;
  onMode: (m: GameMode) => void;
  onGameType: (t: GameType) => void;
  onStart: () => void;
  disabled?: boolean;
}

const LENS = [4, 5, 6, 7, 8] as const;

export function Controls({
  lang, len, mode, gameType, onLang, onLen, onMode, onGameType, onStart, disabled,
}: Props) {
  const isPhrase = gameType === 'phrase';

  function seg<T extends string>(
    values: { value: T; label: string }[],
    current: T,
    onChange: (v: T) => void,
    extra = '',
  ) {
    return (
      <div className={`seg ${extra}`} role="group">
        {values.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={current === value ? 'active' : ''}
            onClick={() => { onChange(value); }}
            disabled={disabled}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="controls">
      {seg<GameType>(
        [{ value: 'word', label: 'Palabra' }, { value: 'phrase', label: 'Frase' }],
        gameType, onGameType,
      )}

      {seg<Language>(
        [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }],
        lang, onLang,
      )}

      {!isPhrase && (
        <select
          className="len-select"
          value={len}
          onChange={e => onLen(Number(e.target.value))}
          disabled={disabled}
          aria-label="Longitud de palabra"
        >
          {LENS.map(l => (
            <option key={l} value={l}>
              {l} {lang === 'es' ? 'letras' : 'letters'}
            </option>
          ))}
        </select>
      )}

      {!isPhrase && seg<GameMode>(
        [
          { value: 'daily', label: lang === 'es' ? 'Del día' : 'Daily' },
          { value: 'free', label: lang === 'es' ? 'Libre' : 'Free' },
          { value: 'duel', label: '⚔️ 1v1' },
        ],
        mode, onMode,
      )}

      <button
        type="button"
        className="btn-new-game"
        onClick={onStart}
        disabled={disabled}
      >
        {lang === 'es' ? 'Nueva partida' : 'New game'}
      </button>
    </div>
  );
}
