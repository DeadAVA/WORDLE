import { useEffect, useState } from 'react';
import type { Language } from '../../types';
import { dailyKey, dayNumber } from '../../utils/gameLogic';
import { loadStats } from '../../utils/storage';

interface Props {
  lang: Language;
  len: number;
  gameType: 'word' | 'phrase';
}

function countdown(): string {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const diff = tomorrow.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function StatsModal({ lang, len, gameType }: Props) {
  const es = lang === 'es';
  const key = dailyKey(lang, len, gameType);
  const stats = loadStats(key);
  const [time, setTime] = useState(countdown);

  useEffect(() => {
    const t = setInterval(() => setTime(countdown()), 1000);
    return () => clearInterval(t);
  }, []);

  const maxDist = Math.max(...Object.values(stats.distribution), 1);
  const winPct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  return (
    <div className="stats-modal">
      <h2>{es ? 'Estadísticas' : 'Statistics'}</h2>

      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{stats.played}</span>
          <span className="stat-label">{es ? 'Jugadas' : 'Played'}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{winPct}</span>
          <span className="stat-label">{es ? '% Victorias' : '% Win'}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.currentStreak}</span>
          <span className="stat-label">{es ? 'Racha actual' : 'Current streak'}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.maxStreak}</span>
          <span className="stat-label">{es ? 'Mejor racha' : 'Best streak'}</span>
        </div>
      </div>

      <h3>{es ? 'Distribución de intentos' : 'Guess distribution'}</h3>
      <div className="dist-chart">
        {[1, 2, 3, 4, 5, 6].map(n => {
          const count = stats.distribution[String(n)] ?? 0;
          const width = Math.max((count / maxDist) * 100, count > 0 ? 8 : 3);
          return (
            <div key={n} className="dist-row">
              <span className="dist-label">{n}</span>
              <div className="dist-bar-wrap">
                <div className="dist-bar" style={{ width: `${width}%` }}>
                  {count > 0 && <span>{count}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="stats-next">
        <div>
          <div className="stats-next-label">{es ? 'Próxima palabra en' : 'Next word in'}</div>
          <div className="stats-countdown">{time}</div>
        </div>
        <button
          className="btn-share"
          onClick={() => {
            const text = `Wordle ${dayNumber()} (${len} ${es ? 'letras' : 'letters'})\n${stats.played} ${es ? 'jugadas' : 'played'} · ${winPct}% ${es ? 'victorias' : 'wins'}`;
            navigator.clipboard.writeText(text).catch(() => {});
          }}
        >
          {es ? '📋 Compartir' : '📋 Share'}
        </button>
      </div>
    </div>
  );
}
