import { useState, useMemo, useRef, useEffect } from "react";
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
  const [buscaMusica, setBuscaMusica] = useState("");
  const [buscaAlbum, setBuscaAlbum] = useState("");
  
  // Estado do Combobox único de Cantor
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const comboboxRef = useRef(null);

  // Cantores em ordem alfabética A-Z
  const cantoresOrdenados = useMemo(() => {
    return [...cantores].sort((a, b) =>
      a.localeCompare(b, "pt-BR", { sensitivity: "base" })
    );
  }, [cantores]);

  // Lista de cantores filtrada pelo que o usuário digita
  const cantoresFiltrados = useMemo(() => {
    if (!termoPesquisa.trim()) return cantoresOrdenados;
    const t = termoPesquisa.toLowerCase().trim();
    return cantoresOrdenados.filter((c) => c.toLowerCase().includes(t));
  }, [cantoresOrdenados, termoPesquisa]);

  // Sincroniza o texto do input com o cantor selecionado
  useEffect(() => {
    if (cantorSelecionado && !dropdownAberto) {
      setTermoPesquisa(cantorSelecionado);
    }
  }, [cantorSelecionado, dropdownAberto]);

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        setDropdownAberto(false);
        // Se fechou sem escolher, volta para o cantor atual selecionado
        if (cantorSelecionado) {
          setTermoPesquisa(cantorSelecionado);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cantorSelecionado]);

  // Filtragem local das músicas do cantor
  const musicasFiltradas = useMemo(() => {
    if (!cantorDetalhe?.musicas) return [];
    if (!buscaMusica.trim()) return cantorDetalhe.musicas;
    const termo = buscaMusica.toLowerCase().trim();
    return cantorDetalhe.musicas.filter(
      (m) =>
        m.titulo_musica.toLowerCase().includes(termo) ||
        m.nome_album.toLowerCase().includes(termo)
    );
  }, [cantorDetalhe, buscaMusica]);

  // Filtragem local dos álbuns do cantor
  const albunsFiltrados = useMemo(() => {
    if (!cantorDetalhe?.albuns_sucesso) return [];
    if (!buscaAlbum.trim()) return cantorDetalhe.albuns_sucesso;
    const termo = buscaAlbum.toLowerCase().trim();
    return cantorDetalhe.albuns_sucesso.filter((a) =>
      a.nome_album.toLowerCase().includes(termo)
    );
  }, [cantorDetalhe, buscaAlbum]);

  const handleEscolherCantor = (cantor) => {
    setTermoPesquisa(cantor);
    onSelecionarCantor(cantor);
    setDropdownAberto(false);
  };

  const handleLimparCantor = () => {
    setTermoPesquisa("");
    onSelecionarCantor("");
    setDropdownAberto(true);
  };

  return (
    <Card
      titulo="🎤 Consulta por Cantor (Artista)"
      subtitulo="Pesquise ou selecione um cantor em ordem alfabética para visualizar suas músicas e álbuns de sucesso"
      className="span-2"
      acoes={
        /* Combobox Único: Digite ou Escolha da Lista em Ordem Alfabética */
        <div className="combobox-wrapper" ref={comboboxRef}>
          <div className="combobox-input-box">
            <span className="combobox-icon">🔍</span>
            <input
              type="text"
              className="combobox-input"
              placeholder="Pesquisar cantor (A-Z)..."
              value={termoPesquisa}
              onFocus={() => {
                setDropdownAberto(true);
              }}
              onChange={(e) => {
                setTermoPesquisa(e.target.value);
                setDropdownAberto(true);
              }}
            />
            {termoPesquisa && (
              <button
                type="button"
                className="combobox-clear"
                onClick={handleLimparCantor}
                title="Limpar seleção"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              className="combobox-arrow"
              onClick={() => setDropdownAberto(!dropdownAberto)}
              title="Abrir/Fechar lista"
            >
              {dropdownAberto ? "▲" : "▼"}
            </button>
          </div>

          {/* Dropdown único com scroll e ordem alfabética */}
          {dropdownAberto && (
            <div className="combobox-dropdown">
              <div className="combobox-count">
                {cantoresFiltrados.length} cantor(es) encontrado(s) em ordem alfabética
              </div>
              <ul className="combobox-list">
                {cantoresFiltrados.length === 0 ? (
                  <li className="combobox-empty">Nenhum cantor encontrado com esse nome</li>
                ) : (
                  cantoresFiltrados.map((c) => (
                    <li
                      key={c}
                      className={`combobox-item ${c === cantorSelecionado ? "selecionado" : ""}`}
                      onClick={() => handleEscolherCantor(c)}
                    >
                      <span className="combobox-item-icon">🎤</span>
                      <span className="combobox-item-text">{c}</span>
                      {c === cantorSelecionado && <span className="combobox-item-check">✓</span>}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      }
    >
      {!cantorSelecionado ? (
        <div style={{ textAlign: "center", padding: "35px", color: "#9aa0b4" }}>
          <span style={{ fontSize: "42px", display: "block", marginBottom: "10px" }}>🎧</span>
          <p style={{ fontSize: "14px" }}>
            Digite ou selecione um cantor no campo acima para explorar suas faixas, popularidade e álbuns mais ouvidos.
          </p>
        </div>
      ) : carregandoCantor ? (
        <div style={{ textAlign: "center", padding: "35px", color: "#1DB954" }}>
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
              <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap" }}>
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
            {/* Álbuns de Maior Sucesso com Filtro Search */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#FFB547" }}>
                  💿 Álbuns ({albunsFiltrados.length})
                </h4>
              </div>
              <input
                type="text"
                placeholder="🔍 Filtrar álbuns..."
                value={buscaAlbum}
                onChange={(e) => setBuscaAlbum(e.target.value)}
                style={{ width: "100%", marginBottom: "10px", padding: "6px 10px", fontSize: "12px" }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
                {albunsFiltrados.length === 0 ? (
                  <p className="muted small" style={{ textAlign: "center", padding: "15px" }}>
                    Nenhum álbum encontrado.
                  </p>
                ) : (
                  albunsFiltrados.map((alb, idx) => (
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

            {/* Músicas do Cantor com Filtro Search */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1DB954" }}>
                  🎵 Músicas ({musicasFiltradas.length})
                </h4>
              </div>
              <input
                type="text"
                placeholder="🔍 Filtrar músicas por título ou álbum..."
                value={buscaMusica}
                onChange={(e) => setBuscaMusica(e.target.value)}
                style={{ width: "100%", marginBottom: "10px", padding: "6px 10px", fontSize: "12px" }}
              />

              <div className="tabela-wrap" style={{ maxHeight: "360px" }}>
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
                    {musicasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "20px" }} className="muted">
                          Nenhuma música encontrada com o termo "{buscaMusica}".
                        </td>
                      </tr>
                    ) : (
                      musicasFiltradas.map((m, idx) => (
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
                              title="Editar música"
                              onClick={() => onAbrirAtualizarMusica(m)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-acao btn-del"
                              title="Excluir música"
                              onClick={() => onAbrirDeletar(m)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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
