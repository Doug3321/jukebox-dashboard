export default function Card({ titulo, subtitulo, acoes, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      <header className="card-header">
        <div>
          <h3>{titulo}</h3>
          {subtitulo && <p className="muted">{subtitulo}</p>}
        </div>
        {acoes}
      </header>
      <div className="card-body">{children}</div>
    </section>
  );
}
