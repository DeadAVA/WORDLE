import type { Language } from '../types';

const PHRASE_MAX_GUESSES = 5;

interface Props {
  phrase: string;
  revealedLetters: Set<string>;
  guessedWords: string[];
  current: string;
  lang: Language;
  finished: boolean;
  won: boolean;
}

export function PhraseGame({ phrase, revealedLetters, guessedWords, current, lang, finished, won }: Props) {
  const remaining = PHRASE_MAX_GUESSES - guessedWords.length;

  return (
    <div className="phrase-game">
      <div className="phrase-puzzle" aria-label="Frase a adivinar">
        {phrase.split('').map((ch, i) => {
          if (ch === ' ') return <span key={i} className="phrase-space" />;
          const revealed = revealedLetters.has(ch) || finished;
          return (
            <span key={i} className={`phrase-letter ${revealed ? 'revealed' : ''}`}>
              {revealed ? ch : '_'}
            </span>
          );
        })}
      </div>

      <div className="phrase-meta">
        {!finished ? (
          <span>
            {lang === 'es'
              ? `Intentos restantes: ${remaining}`
              : `Attempts left: ${remaining}`}
          </span>
        ) : (
          <span className={won ? 'result-win' : 'result-lose'}>
            {won
              ? (lang === 'es' ? '¡Correcto! 🎉' : 'Correct! 🎉')
              : (lang === 'es' ? `La frase era: ${phrase}` : `The phrase was: ${phrase}`)}
          </span>
        )}
      </div>

      <div className="phrase-guesses">
        <div className="phrase-guesses-label">
          {lang === 'es' ? 'Palabras usadas:' : 'Used words:'}
        </div>
        <div className="phrase-guesses-list">
          {guessedWords.map((word, i) => (
            <div key={i} className="phrase-guess-word">
              {word.split('').map((l, li) => {
                const inPhrase = phrase.replace(/ /g, '').includes(l);
                return (
                  <span key={li} className={`phrase-guess-letter ${inPhrase ? 'in-phrase' : 'not-in-phrase'}`}>
                    {l}
                  </span>
                );
              })}
            </div>
          ))}
          {current && !finished && (
            <div className="phrase-guess-word current">
              {current.split('').map((l, li) => (
                <span key={li} className="phrase-guess-letter typing">{l}</span>
              ))}
              {Array.from({ length: 5 - current.length }, (_, i) => (
                <span key={`empty-${i}`} className="phrase-guess-letter empty">_</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
