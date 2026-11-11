export default function SqlBanner({ sqlInfo, onFechar }) {
  if (!sqlInfo) return null;

  return (
    <div className="sql-banner">
      <div className="sql-banner-header">
        <span className="sql-banner-tag">⚡ Comando SQL</span>
        <span className="sql-banner-msg">{sqlInfo.mensagem}</span>
        <button className="sql-banner-close" onClick={onFechar}>✕</button>
      </div>
      <pre className="sql-banner-code">
        <code>{sqlInfo.sql_executado}</code>
      </pre>
    </div>
  );
}
