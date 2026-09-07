interface Props {
  title: string;
  onHelp: () => void;
  onStats: () => void;
}

export function Header({ title, onHelp, onStats }: Props) {
  return (
    <header className="header">
      <div className="header-left" />
      <h1 className="header-title">{title}</h1>
      <div className="header-right">
        <button className="icon-btn" onClick={onHelp} aria-label="Ayuda / Help" title="Ayuda">
          ?
        </button>
        <button className="icon-btn" onClick={onStats} aria-label="Estadísticas" title="Estadísticas">
          📊
        </button>
      </div>
    </header>
  );
}
