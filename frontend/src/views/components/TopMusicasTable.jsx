import Card from "../../custom/components/Card";
import { fmtDec, fmtMin } from "../../custom/utils/formatters";

export default function TopMusicasTable({ musicas, limit, onLimitChange }) {
  return (
    <Card
      titulo="🏆 Músicas mais populares"
      subtitulo="Ordenadas por popularidade (Spotify)"
      className="span-2"
      acoes={
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
          {[5, 10, 20, 50].map((n) => <option key={n} value={n}>Top {n}</option>)}
        </select>
      }
    >
      <div className="tabela-wrap">
        <table className="tabela">
          <thead>
            <tr><th>#</th><th>Música</th><th>Artista(s)</th><th>Gênero(s)</th>
              <th>Popularidade</th><th>Dança</th><th>Duração</th></tr>
          </thead>
          <tbody>
            {musicas.map((m, i) => (
              <tr key={m.id_musica}>
                <td className="rank">{i + 1}</td>
                <td>
                  <div className="musica-titulo">{m.titulo_musica}
                    {m.improprio && <span className="tag-e">E</span>}</div>
                  <div className="muted small">{m.nome_album}</div>
                </td>
                <td>{m.artistas.join(", ")}</td>
                <td>{m.generos.slice(0, 3).map((g) => <span key={g} className="chip">{g}</span>)}</td>
                <td>
                  <div className="barra"><div style={{ width: `${m.popularidade}%` }} /></div>
                  <span className="small">{m.popularidade}</span>
                </td>
                <td>{fmtDec(m.dancabilidade, 2)}</td>
                <td>{fmtMin(m.duracao_min)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
