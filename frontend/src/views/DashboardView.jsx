import { useDashboardController } from "../controllers/useDashboardController";
import ArtistasChart from "./components/ArtistasChart";
import CantorSection from "./components/CantorSection";
import DancabilidadeChart from "./components/DancabilidadeChart";
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
    backendOffline,
    usandoMock,
    alternarMock,
    versaoCatalogo,
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
    abrirDeletar,

    // SQL Banner
    sqlInfo,
    fecharSqlBanner,
  } = useDashboardController();

  return (
    <div className="app">
      <header className="topo">
        <div className="marca">
          <span className="logo">🎧</span>
          <div>
            <h1>
              Jukebox <span>Dashboard</span>
            </h1>
          </div>
        </div>

        <div className="acoes-topo">
          {/* Botão de Adicionar Nova Música */}
          <button
            className="btn-add-musica"
            onClick={() => setModalCriarAberto(true)}
            title="Adicionar nova música ao catálogo"
          >
            ➕ Adicionar Música
          </button>

          {/* Filtro de Gênero */}
          <div className="filtros">
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

      {backendOffline && !usandoMock && (
        <div className="aviso-offline">
          <span>⚠️ <strong>Aviso:</strong> Backend desconectado na porta 8000. Inicie o servidor com <code>uvicorn app.main:app --port 8000 --reload</code> ou clique em <strong>"⚪ Usar Mock"</strong> no rodapé para visualizar dados simulados.</span>
        </div>
      )}

      {loading && <div className="loading-bar" />}

      <main className={loading ? "carregando" : ""}>
        {/* KPIs Globais */}
        <ResumoKpis resumo={dados.resumo} />

        <div className="grid">
          {/* SEÇÃO PRINCIPAL: Consulta por Cantor e Pesquisa de Músicas */}
          <CantorSection
            cantores={dados.cantores}
            cantorSelecionado={cantorSelecionado}
            cantorDetalhe={cantorDetalhe}
            carregandoCantor={carregandoCantor}
            onSelecionarCantor={setCantorSelecionado}
            onAbrirDeletar={abrirDeletar}
            onAbrirAtualizarMusica={abrirAtualizarMusica}
            versaoCatalogo={versaoCatalogo}
          />

          {/* Tabela de Top Músicas (com botões de Editar e Deletar) */}
          <TopMusicasTable
            musicas={dados.topMusicas}
            limit={filtros.limitTop}
            onLimitChange={(v) => atualizarFiltro("limitTop", v)}
            onAbrirDeletar={abrirDeletar}
            onAbrirAtualizarMusica={abrirAtualizarMusica}
          />

          {/* 4 Gráficos Analíticos em Grade 2x2 Perfeita */}
          <DancabilidadeChart generos={dados.generos} />

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
        onFechar={() => setModalAtualizarAberto(false)}
        onSalvar={handleSalvarAtualizar}
        itemPreDefinido={itemParaAtualizar}
      />

      <ModalDeletar
        aberto={modalDeletarAberto}
        onFechar={() => setModalDeletarAberto(false)}
        onConfirmar={handleConfirmarDeletar}
        musicaParaDeletar={musicaParaDeletar}
      />

      {/* Rodapé e Botão de Ativar / Desativar Mock */}
      <footer className="rodape-container">
        <div className="rodape-mock-controle">
          <button
            type="button"
            className={`btn-mock-toggle ${usandoMock ? "mock-ativo" : "mock-inativo"}`}
            onClick={alternarMock}
            title={
              usandoMock
                ? "Clique para desativar o mock e voltar à conexão com o banco"
                : "Clique para ativar os dados simulados (mock)"
            }
          >
            {usandoMock ? "🟢 Mock Ativado (Clique para Desativar)" : "⚪ Usar Mock"}
          </button>
        </div>
        <div className="rodape muted">
          DCA3604 • Banco de Dados • UFRN 2026.2 — Projeto Jukebox
        </div>
      </footer>
    </div>
  );
}
