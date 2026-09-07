import type { Language, TileState } from '../types';

const KEY_ROWS: Record<Language, string[]> = {
  es: ['QWERTYUIOP', 'ASDFGHJKLÑ', '↵ZXCVBNM⌫'],
  en: ['QWERTYUIOP', 'ASDFGHJKL', '↵ZXCVBNM⌫'],
};

interface Props {
  lang: Language;
  letterMap: Record<string, TileState>;
  onKey: (key: string) => void;
  disabled?: boolean;
}

export function Keyboard({ lang, letterMap, onKey, disabled }: Props) {
  const rows = KEY_ROWS[lang];

  return (
    <div className="keyboard" aria-label="Teclado virtual">
      {rows.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.split('').map((k, ki) => {
            const isEnter = k === '↵';
            const isBack = k === '⌫';
            const keyLabel = isEnter ? 'Enter' : isBack ? '⌫' : k;
            const state = letterMap[k];
            const classes = [
              'key',
              isEnter || isBack ? 'key-wide' : '',
              state ?? '',
            ].filter(Boolean).join(' ');

            return (
              <button
                key={ki}
                type="button"
                className={classes}
                onClick={() => onKey(isEnter ? 'Enter' : isBack ? 'Backspace' : k)}
                disabled={disabled}
                aria-label={isEnter ? 'Confirmar' : isBack ? 'Borrar' : k}
              >
                {keyLabel}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
