import type { Language } from '../../types';

interface Props {
  lang: Language;
}

export function HelpModal({ lang }: Props) {
  const es = lang === 'es';

  return (
    <div className="help-modal">
      <h2>{es ? 'Cómo jugar' : 'How to play'}</h2>
      <p>
        {es
          ? 'Adivina la palabra en 6 intentos.'
          : 'Guess the word in 6 attempts.'}
      </p>
      <ul>
        <li>
          {es
            ? 'Cada intento debe ser una palabra válida del largo seleccionado.'
            : 'Each guess must be a valid word of the selected length.'}
        </li>
        <li>
          {es
            ? 'El color de las letras cambia para indicar qué tan cerca estás.'
            : 'The color of the tiles will change to show how close you are.'}
        </li>
      </ul>

      <div className="help-examples">
        <div className="help-example">
          <div className="help-tiles">
            <span className="tile evaluated correct">G</span>
            <span className="tile evaluated absent">A</span>
            <span className="tile evaluated absent">T</span>
            <span className="tile evaluated absent">O</span>
            <span className="tile evaluated absent">S</span>
          </div>
          <p>
            <strong>G</strong>{' '}
            {es
              ? 'está en la posición correcta.'
              : 'is in the correct position.'}
          </p>
        </div>
        <div className="help-example">
          <div className="help-tiles">
            <span className="tile evaluated absent">C</span>
            <span className="tile evaluated present">I</span>
            <span className="tile evaluated absent">E</span>
            <span className="tile evaluated absent">L</span>
            <span className="tile evaluated absent">O</span>
          </div>
          <p>
            <strong>I</strong>{' '}
            {es
              ? 'está en la palabra pero en posición incorrecta.'
              : 'is in the word but in the wrong position.'}
          </p>
        </div>
        <div className="help-example">
          <div className="help-tiles">
            <span className="tile evaluated absent">T</span>
            <span className="tile evaluated absent">R</span>
            <span className="tile evaluated absent">O</span>
            <span className="tile evaluated absent">N</span>
            <span className="tile evaluated absent">O</span>
          </div>
          <p>
            {es
              ? 'Ninguna de estas letras está en la palabra.'
              : 'None of these letters are in the word.'}
          </p>
        </div>
      </div>

      <hr />
      <h3>{es ? 'Modos de juego' : 'Game modes'}</h3>
      <dl>
        <dt>{es ? '📅 Del día' : '📅 Daily'}</dt>
        <dd>{es ? 'Una palabra nueva cada día.' : 'A new word every day.'}</dd>

        <dt>{es ? '🎲 Libre' : '🎲 Free'}</dt>
        <dd>{es ? 'Palabra aleatoria, juega infinitas veces.' : 'Random word, play as many times as you want.'}</dd>

        <dt>⚔️ 1v1</dt>
        <dd>{es ? 'Compite contra otro jugador en tiempo real.' : 'Compete against another player in real time.'}</dd>

        <dt>{es ? '🧩 Frase' : '🧩 Phrase'}</dt>
        <dd>
          {es
            ? 'Adivina letras de la frase del día usando palabras de 5 letras.'
            : 'Guess letters of the phrase of the day using 5-letter words.'}
        </dd>
      </dl>
    </div>
  );
}
