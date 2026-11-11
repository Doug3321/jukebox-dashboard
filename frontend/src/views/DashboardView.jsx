import { useDashboardController } from "../controllers/useDashboardController";
import ArtistasChart from "./components/ArtistasChart";
import CantorSection from "./components/CantorSection";
import GenerosChart from "./components/GenerosChart";
import ImproprioChart from "./components/ImproprioChart";
import ModalAtualizar from "./components/ModalAtualizar";
import ModalCriarMusica from "./components/ModalCriarMusica";
import ModalDeletar from "./components/ModalDeletar";
import PopularidadeChart from "./components/PopularidadeChart";
import ResumoKpis from "./components/ResumoKpis";
import SqlBanner from "./components/SqlBanner";
import TopMusicasTable from "./components/TopMusicasTable";

export default function DashboardView() {
  const {
    dados,
    filtros,
    loading,
    usandoMock,
    atualizarFiltro,

    // Cantor
    cantorSelecionado,
    setCantorSelecionado,
    cantorDetalhe,
    carregandoCantor,

    // Modais
    modalCriarAberto,
    setModalCriarAberto,
    modalAtualizarAberto,
    setModalAtualizarAberto,
    itemParaAtualizar,
    modalDeletarAberto,
    setModalDeletarAberto,
    musicaParaDeletar,

    // Ações
    handleSalvarNovaMusica,
    handleSalvarAtualizar,
    handleConfirmarDeletar,
    abrirAtualizarMusica,
    abrirAtualizarGenerico,
    abrirDeletar,

    // SQL Banner
    sqlInfo,
    fecharSqlBanner,
  } = useDashboardController();

  const selecionarGenero = (g) =>
    atualizarFiltro("genero", filtros.genero === g ? "" : g);

  return (
    <div className="app">
      <header className="topo">
        <div className="marca">
          <span className="logo">🎧</span>
          <div>
            <h1>
              Jukebox <span>Dashboard</span>
            </h1>
            <p className="muted">Catálogo musical • Operações CRUD & Análise de Dados</p>
          </div>
        </div>

        <div className="acoes-topo">
          {/* Botões do CRUD */}
          <button
            className="btn-add-musica"
            onClick={() => setModalCriarAberto(true)}
            title="Inserir nova música no catálogo (INSERT)"
          >
            ➕ Adicionar Música
          </button>
          <button
            className="btn-update-topo"
            onClick={abrirAtualizarGenerico}
            title="Atualizar nome de música, artista ou álbum (UPDATE)"
          >
            ✏️ Atualizar
          </button>

          {/* Filtro de Gênero */}
          <div className="filtros">
            {usandoMock && <span className="badge-mock">Modo offline (mock)</span>}
            <label>
              Gênero
              <select
                value={filtros.genero}
                onChange={(e) => atualizarFiltro("genero", e.target.value)}
              >
                <option value="">Todos</option>
                {dados.listaGeneros.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            {filtros.genero && (
              <button
                className="btn-limpar"
                onClick={() => atualizarFiltro("genero", "")}
              >
                ✕ Limpar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Banner de Feedback SQL (Exibe a Query Executada para o Professor) */}
      <SqlBanner sqlInfo={sqlInfo} onFechar={fecharSqlBanner} />

      {loading && <div className="loading-bar" />}

      <main className={loading ? "carregando" : ""}>
        {/* KPIs Globais */}
        <ResumoKpis resumo={dados.resumo} />

        <div className="grid">
          {/* SEÇÃO PRINCIPAL: Consulta por Cantor (com suas músicas e álbuns de maior sucesso) */}
          <CantorSection
            cantores={dados.cantores}
            cantorSelecionado={cantorSelecionado}
            cantorDetalhe={cantorDetalhe}
            carregandoCantor={carregandoCantor}
            onSelecionarCantor={setCantorSelecionado}
            onAbrirDeletar={abrirDeletar}
            onAbrirAtualizarMusica={abrirAtualizarMusica}
          />

          {/* Tabela de Top Músicas (com botões de Editar e Deletar) */}
          <TopMusicasTable
            musicas={dados.topMusicas}
            limit={filtros.limitTop}
            onLimitChange={(v) => atualizarFiltro("limitTop", v)}
            onAbrirDeletar={abrirDeletar}
            onAbrirAtualizarMusica={abrirAtualizarMusica}
          />

          {/* Gráficos Analíticos */}
          <GenerosChart
            generos={dados.generos}
            ordenarPor={filtros.ordenarGeneros}
            onOrdenarChange={(v) => atualizarFiltro("ordenarGeneros", v)}
            onSelecionar={selecionarGenero}
            generoAtivo={filtros.genero}
          />

          <ArtistasChart artistas={dados.artistas} />

          <ImproprioChart dados={dados.improprio} />

          <PopularidadeChart faixas={dados.faixas} />
        </div>
      </main>

      {/* Modais de CRUD */}
      <ModalCriarMusica
        aberto={modalCriarAberto}
        onFechar={() => setModalCriarAberto(false)}
        onSalvar={handleSalvarNovaMusica}
        listaGeneros={dados.listaGeneros}
        cantores={dados.cantores}
      />

      <ModalAtualizar
        aberto={modalAtualizarAberto}
        onFechar={() => {
          setModalAtualizarAberto(false);
        }}
        onSalvar={handleSalvarAtualizar}
        itemPreDefinido={itemParaAtualizar}
      />

      <ModalDeletar
        aberto={modalDeletarAberto}
        onFechar={() => setModalDeletarAberto(false)}
        onConfirmar={handleConfirmarDeletar}
        musicaParaDeletar={musicaParaDeletar}
      />

      <footer className="rodape muted">
        DCA3604 • Banco de Dados • UFRN 2026.2 — Projeto Jukebox • CRUD & Análise
      </footer>
    </div>
  );
}
