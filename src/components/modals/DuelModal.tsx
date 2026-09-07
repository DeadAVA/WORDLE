import { useState } from 'react';
import type { DuelState, Language } from '../../types';

interface Props {
  lang: Language;
  len: number;
  duel: DuelState;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onClose: () => void;
}

export function DuelModal({ lang, len: _len, duel, onCreateRoom, onJoinRoom, onClose }: Props) {
  const [joinCode, setJoinCode] = useState('');
  const es = lang === 'es';

  if (duel.status === 'waiting') {
    return (
      <div className="duel-modal">
        <h2>⚔️ {es ? 'Modo 1v1' : '1v1 Mode'}</h2>
        <p>{es ? 'Comparte este código con tu oponente:' : 'Share this code with your opponent:'}</p>
        <div className="duel-code">{duel.roomCode}</div>
        <p className="duel-waiting">{es ? 'Esperando conexión…' : 'Waiting for opponent…'}</p>
        <button className="btn-secondary" onClick={onClose}>{es ? 'Cancelar' : 'Cancel'}</button>
      </div>
    );
  }

  if (duel.status === 'connecting') {
    return (
      <div className="duel-modal">
        <h2>⚔️ {es ? 'Conectando…' : 'Connecting…'}</h2>
        <div className="duel-spinner" />
        <button className="btn-secondary" onClick={onClose}>{es ? 'Cancelar' : 'Cancel'}</button>
      </div>
    );
  }

  return (
    <div className="duel-modal">
      <h2>⚔️ {es ? 'Modo 1v1' : '1v1 Mode'}</h2>
      <p>
        {es
          ? 'Compite en tiempo real. El host elige la palabra; ambos juegan simultáneamente.'
          : 'Compete in real time. Host picks the word; both play simultaneously.'}
      </p>

      <div className="duel-options">
        <div className="duel-option">
          <h3>{es ? 'Crear sala' : 'Create room'}</h3>
          <p>{es ? 'Genera un código y espera al oponente.' : 'Generate a code and wait for your opponent.'}</p>
          <button className="btn-primary" onClick={onCreateRoom}>
            {es ? 'Crear sala' : 'Create room'}
          </button>
        </div>

        <div className="duel-divider">{es ? 'o' : 'or'}</div>

        <div className="duel-option">
          <h3>{es ? 'Unirse' : 'Join room'}</h3>
          <p>{es ? 'Ingresa el código de la sala.' : 'Enter the room code.'}</p>
          <input
            type="text"
            className="duel-input"
            placeholder={es ? 'Código de sala' : 'Room code'}
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            maxLength={8}
          />
          <button
            className="btn-primary"
            onClick={() => onJoinRoom(joinCode)}
            disabled={joinCode.length < 4}
          >
            {es ? 'Unirse' : 'Join'}
          </button>
        </div>
      </div>

      <p className="duel-note">
        {es
          ? '⚠️ Requiere conexión a internet (PeerJS).'
          : '⚠️ Requires internet connection (PeerJS).'}
      </p>
    </div>
  );
}
