export default function KpiCard({ icone, rotulo, valor, detalhe, cor = "#1DB954" }) {
  return (
    <div className="kpi" style={{ "--kpi-cor": cor }}>
      <div className="kpi-icone">{icone}</div>
      <div>
        <p className="kpi-rotulo">{rotulo}</p>
        <p className="kpi-valor">{valor}</p>
        {detalhe && <p className="kpi-detalhe">{detalhe}</p>}
      </div>
    </div>
  );
}
