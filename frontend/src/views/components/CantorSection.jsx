import Card from "../../custom/components/Card";
import { fmtDec, fmtMin } from "../../custom/utils/formatters";

export default function CantorSection({
  cantores,
  cantorSelecionado,
  cantorDetalhe,
  carregandoCantor,
  onSelecionarCantor,
  onAbrirDeletar,
  onAbrirAtualizarMusica
}) {
  return (
    <Card
      titulo="🎤 Consulta por Cantor (Artista)"
      subtitulo="Selecione um cantor para visualizar suas músicas e álbuns de maior sucesso"
      className="span-2"
      acoes={
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <label style={{ fontSize: "12px", color: "#9aa0b4" }}>Escolher Cantor:</label>
          <select
            value={cantorSelecionado}
            onChange={(e) => onSelecionarCantor(e.target.value)}
            style={{ minWidth: "220px", fontWeight: "600", color: "#1DB954" }}
          >
            <option value="">-- Selecione um Cantor --</option>
            {cantores.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {!cantorSelecionado ? (
        <div style={{ textAlign: "center", padding: "30px", color: "#9aa0b4" }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>🎧</span>
          <p>Selecione um cantor no menu acima para carregar suas estatísticas, discografia e faixas.</p>
        </div>
      ) : carregandoCantor ? (
        <div style={{ textAlign: "center", padding: "30px", color: "#1DB954" }}>
          Carregando dados de <strong>{cantorSelecionado}</strong>...
        </div>
      ) : cantorDetalhe ? (
        <div>
          {/* Card Resumo do Cantor */}
          <div className="cantor-perfil">
            <div className="cantor-avatar">🎤</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#fff" }}>
                {cantorDetalhe.nome_artista}
              </h2>
              <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
                <span className="badge-stat">
                  <strong>{cantorDetalhe.total_musicas}</strong> músicas no catálogo
                </span>
                <span className="badge-stat">
                  Popularidade Média: <strong>{fmtDec(cantorDetalhe.popularidade_media, 1)}</strong>
                </span>
                <span className="badge-stat">
                  Dançabilidade Média: <strong>{fmtDec(cantorDetalhe.dancabilidade_media, 3)}</strong>
                </span>
              </div>
              <div style={{ marginTop: "10px" }}>
                {cantorDetalhe.generos.map((g) => (
                  <span key={g} className="chip">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", marginTop: "20px" }}>
            {/* Álbuns de Maior Sucesso */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px", color: "#FFB547" }}>
                💿 Álbuns de Maior Sucesso
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
                {cantorDetalhe.albuns_sucesso.length === 0 ? (
                  <p className="muted small">Nenhum álbum registrado.</p>
                ) : (
                  cantorDetalhe.albuns_sucesso.map((alb, idx) => (
                    <div key={alb.nome_album + idx} className="album-card">
                      <div className="album-rank">#{idx + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", fontSize: "13px" }}>{alb.nome_album}</div>
                        <div className="muted small">
                          {alb.total_musicas} faixa(s) • Pop. Média: <strong>{alb.popularidade_media}</strong>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Músicas do Cantor */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px", color: "#1DB954" }}>
                🎵 Músicas de {cantorDetalhe.nome_artista} ({cantorDetalhe.musicas.length})
              </h4>
              <div className="tabela-wrap" style={{ maxHeight: "380px" }}>
                <table className="tabela">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Título</th>
                      <th>Álbum</th>
                      <th>Pop.</th>
                      <th>Duração</th>
                      <th style={{ textAlign: "right" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cantorDetalhe.musicas.map((m, idx) => (
                      <tr key={m.id_musica}>
                        <td className="rank">{idx + 1}</td>
                        <td>
                          <div className="musica-titulo">
                            {m.titulo_musica}
                            {m.improprio && <span className="tag-e">E</span>}
                          </div>
                        </td>
                        <td className="muted small">{m.nome_album}</td>
                        <td>
                          <span style={{ fontWeight: "700", color: "#2EC5FF" }}>{m.popularidade}</span>
                        </td>
                        <td>{fmtMin(m.duracao_min)}</td>
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <button
                            className="btn-acao btn-edit"
                            title="Editar nome desta música"
                            onClick={() => onAbrirAtualizarMusica(m)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-acao btn-del"
                            title="Deletar esta música (DELETE real)"
                            onClick={() => onAbrirDeletar(m)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
