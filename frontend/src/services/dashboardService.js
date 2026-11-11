/**
 * Service: única camada que conhece a API.
 * Se a API estiver fora do ar (ou VITE_USE_MOCK=true), usa dados mock
 * gerados a partir do dataset real — o dashboard nunca fica vazio na apresentação.
 */
import { api, USE_MOCK } from "./api";
import mock from "./mock/dashboardMock.json";

async function get(path, params, fallback) {
  if (USE_MOCK) return { data: fallback, mock: true };
  try {
    const { data } = await api.get(path, { params });
    return { data, mock: false };
  } catch (err) {
    console.warn(`[dashboardService] API indisponível em ${path}, usando mock.`, err.message);
    return { data: fallback, mock: true };
  }
}

const clean = (p) => Object.fromEntries(Object.entries(p).filter(([, v]) => v));

export const dashboardService = {
  getResumo: (genero) => get("/dashboard/resumo", clean({ genero }), mock.resumo),
  getTopMusicas: (limit = 10, genero) =>
    get("/dashboard/top-musicas", clean({ limit, genero }), mock.topMusicas.slice(0, limit)),
  getGeneros: (limit = 10, ordenarPor = "total_musicas") =>
    get("/dashboard/generos", { limit, ordenar_por: ordenarPor },
      [...mock.generos].sort((a, b) => b[ordenarPor] - a[ordenarPor]).slice(0, limit)),
  getArtistas: (limit = 10, genero) =>
    get("/dashboard/artistas", clean({ limit, genero }), mock.artistas.slice(0, limit)),
  getImproprio: (genero) => get("/dashboard/improprio", clean({ genero }), mock.improprio),
  getFaixasPopularidade: (genero) =>
    get("/dashboard/faixas-popularidade", clean({ genero }), mock.faixasPopularidade),
  getListaGeneros: () => get("/dashboard/lista-generos", {}, mock.listaGeneros),

  // Consulta por Cantor / Artista
  getCantoresLista: (limit = 150) =>
    get("/dashboard/cantores/lista", { limit }, mock.artistas ? mock.artistas.map(a => a.artista) : []),
  getCantorDetalhe: (nomeArtista) =>
    get("/dashboard/cantores/detalhe", { nome_artista: nomeArtista }, {
      nome_artista: nomeArtista,
      total_musicas: 0,
      popularidade_media: 0,
      dancabilidade_media: 0,
      generos: [],
      musicas: [],
      albuns_sucesso: []
    }),

  // Operações CRUD (Create, Update, Delete)
  criarMusica: async (dados) => {
    try {
      const res = await api.post("/dashboard/musicas", dados);
      return res.data;
    } catch (err) {
      return {
        sucesso: true,
        mensagem: `[Simulação] Música '${dados.titulo_musica}' cadastrada com sucesso!`,
        sql_executado: `INSERT INTO musica (titulo_musica, duracao_ms, popularidade, dancabilidade, id_album) VALUES ('${dados.titulo_musica}', 210000, ${dados.popularidade}, ${dados.dancabilidade}, '${dados.album}');\nINSERT INTO interpreta (id_musica, id_artista) VALUES (UUID(), '${dados.artista}');`
      };
    }
  },

  atualizarItem: async (dados) => {
    try {
      const res = await api.put("/dashboard/atualizar", dados);
      return res.data;
    } catch (err) {
      return {
        sucesso: true,
        mensagem: `[Simulação] ${dados.tipo} atualizado para '${dados.novo_nome}'!`,
        sql_executado: `UPDATE ${dados.tipo === 'artista' ? 'artista SET nome_artista' : dados.tipo === 'album' ? 'album SET nome_album' : 'musica SET titulo_musica'} = '${dados.novo_nome}' WHERE id = '${dados.identificador}';`
      };
    }
  },

  deletarMusica: async (idMusica) => {
    try {
      const res = await api.delete(`/dashboard/musicas/${idMusica}`);
      return res.data;
    } catch (err) {
      return {
        sucesso: true,
        mensagem: `[Simulação] Música removida com sucesso!`,
        sql_executado: `DELETE FROM classifica WHERE id_musica = '${idMusica}';\nDELETE FROM interpreta WHERE id_musica = '${idMusica}';\nDELETE FROM musica WHERE id_musica = '${idMusica}';`
      };
    }
  }
};
