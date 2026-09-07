import type { DuelState, Language } from '../../types';

interface Props {
  won: boolean;
  target: string;
  attempts: number;
  lang: Language;
  mode: string;
  duel: DuelState;
  onNewGame: () => void;
  onRematch?: () => void;
  onStats: () => void;
}

export function ResultModal({ won, target, attempts, lang, mode, duel, onNewGame, onRematch, onStats }: Props) {
  const es = lang === 'es';

  const duelResult = () => {
    if (!duel.active || !duel.opponentFinished) return null;
    if (won && !duel.opponentWon) return es ? 'Ganaste el duelo 🏆' : 'You won the duel 🏆';
    if (!won && duel.opponentWon) return es ? 'Tu oponente ganó 😞' : 'Your opponent won 😞';
    if (won && duel.opponentWon) {
      if (attempts < duel.opponentAttempts) return es ? 'Ganaste (menos intentos) 🏆' : 'You won (fewer guesses) 🏆';
      if (attempts > duel.opponentAttempts) return es ? 'Tu oponente ganó (menos intentos)' : 'Opponent won (fewer guesses)';
      return es ? 'Empate 🤝' : 'Tie 🤝';
    }
    return null;
  };

  const dr = duelResult();

  return (
    <div className="result-modal">
      <div className={`result-icon ${won ? 'win' : 'lose'}`}>
        {won ? '🎉' : '😔'}
      </div>

      <h2 className={won ? 'result-win' : 'result-lose'}>
        {won
          ? (es ? '¡Excelente!' : 'Excellent!')
          : (es ? '¡Sigue intentando!' : 'Keep trying!')}
      </h2>

      {!won && (
        <p className="result-word">
          {es ? 'La palabra era:' : 'The word was:'}
          <strong> {target}</strong>
        </p>
      )}

      <p className="result-attempts">
        {won
          ? (es ? `Adivinaste en ${attempts} intento${attempts !== 1 ? 's' : ''}` : `Solved in ${attempts} guess${attempts !== 1 ? 'es' : ''}`)
          : (es ? 'No lo adivinaste esta vez' : 'Better luck next time')}
      </p>

      {dr && <p className="result-duel">{dr}</p>}

      {duel.active && !duel.opponentFinished && (
        <p className="result-waiting">
          {es ? '⏳ Esperando a tu oponente…' : '⏳ Waiting for opponent…'}
        </p>
      )}

      <div className="result-actions">
        {mode !== 'daily' && (
          <button className="btn-primary" onClick={onNewGame}>
            {es ? 'Nueva partida' : 'New game'}
          </button>
        )}

        {duel.active && duel.isHost && onRematch && (
          <button className="btn-primary" onClick={onRematch}>
            {es ? '⚔️ Revancha' : '⚔️ Rematch'}
          </button>
        )}

        <button className="btn-secondary" onClick={onStats}>
          {es ? '📊 Ver estadísticas' : '📊 Statistics'}
        </button>
      </div>
    </div>
  );
}
