import { useDashboardController } from "../controllers/useDashboardController";
import ArtistasChart from "./components/ArtistasChart";
import GenerosChart from "./components/GenerosChart";
import ImproprioChart from "./components/ImproprioChart";
import PopularidadeChart from "./components/PopularidadeChart";
import ResumoKpis from "./components/ResumoKpis";
import TopMusicasTable from "./components/TopMusicasTable";

export default function DashboardView() {
  const { dados, filtros, loading, usandoMock, atualizarFiltro } = useDashboardController();

  const selecionarGenero = (g) => atualizarFiltro("genero", filtros.genero === g ? "" : g);

  return (
    <div className="app">
      <header className="topo">
        <div className="marca">
          <span className="logo">🎧</span>
          <div>
            <h1>Jukebox <span>Dashboard</span></h1>
            <p className="muted">Catálogo musical • Spotify Tracks Dataset</p>
          </div>
        </div>

        <div className="filtros">
          {usandoMock && <span className="badge-mock">Modo offline (mock)</span>}
          <label>
            Gênero
            <select value={filtros.genero} onChange={(e) => atualizarFiltro("genero", e.target.value)}>
              <option value="">Todos</option>
              {dados.listaGeneros.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          {filtros.genero && (
            <button className="btn-limpar" onClick={() => atualizarFiltro("genero", "")}>✕ Limpar</button>
          )}
        </div>
      </header>

      {loading && <div className="loading-bar" />}

      <main className={loading ? "carregando" : ""}>
        <ResumoKpis resumo={dados.resumo} />

        <div className="grid">
          <TopMusicasTable musicas={dados.topMusicas} limit={filtros.limitTop}
            onLimitChange={(v) => atualizarFiltro("limitTop", v)} />
          <GenerosChart generos={dados.generos} ordenarPor={filtros.ordenarGeneros}
            onOrdenarChange={(v) => atualizarFiltro("ordenarGeneros", v)}
            onSelecionar={selecionarGenero} generoAtivo={filtros.genero} />
          <ArtistasChart artistas={dados.artistas} />
          <ImproprioChart dados={dados.improprio} />
          <PopularidadeChart faixas={dados.faixas} />
        </div>
      </main>

      <footer className="rodape muted">DCA3604 • Banco de Dados • UFRN 2026.2 — Projeto Jukebox</footer>
    </div>
  );
}
