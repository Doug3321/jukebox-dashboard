/**
 * Service: comunicação com a API backend (FastAPI + MySQL).
 * O modo Mock fica desligado por padrão, sendo controlado exclusivamente
 * pelo botão "Usar Mock" presente no rodapé da página.
 */
import { api } from "./api";
import mock from "./mock/dashboardMock.json";

// Mock desativado por padrão
let mockAtivo = typeof window !== "undefined" && localStorage.getItem("jukebox_usar_mock") === "true";

const dadosVazios = {
  resumo: {
    total_musicas: 0,
    total_artistas: 0,
    total_albuns: 0,
    total_generos: 0,
    popularidade_media: 0,
    dancabilidade_media: 0,
    duracao_media_min: 0,
    percentual_improprio: 0,
  },
  topMusicas: [],
  generos: [],
  artistas: [],
  improprio: [],
  faixas: [],
  listaGeneros: [],
  cantores: [],
  cantorDetalhe: (nome) => ({
    nome_artista: nome,
    total_musicas: 0,
    popularidade_media: 0,
    dancabilidade_media: 0,
    generos: [],
    musicas: [],
    albuns_sucesso: [],
  }),
};

async function get(path, params, dadosMock, fallbackVazio) {
  if (mockAtivo) {
    return { data: dadosMock, mock: true };
  }
  try {
    const { data } = await api.get(path, { params });
    return { data, mock: false };
  } catch (err) {
    console.warn(`[dashboardService] Conexão backend/MySQL indisponível em ${path}:`, err.message);
    return { data: fallbackVazio, mock: false, erro: err.message };
  }
}

const clean = (p) => Object.fromEntries(Object.entries(p).filter(([, v]) => v));

export const dashboardService = {
  isMockAtivo: () => mockAtivo,

  setMockAtivo: (ativo) => {
    mockAtivo = !!ativo;
    if (typeof window !== "undefined") {
      localStorage.setItem("jukebox_usar_mock", mockAtivo ? "true" : "false");
    }
  },

  getResumo: (genero) =>
    get("/dashboard/resumo", clean({ genero }), mock.resumo, dadosVazios.resumo),

  getTopMusicas: (limit = 10, genero) =>
    get("/dashboard/top-musicas", clean({ limit, genero }), mock.topMusicas.slice(0, limit), []),

  getGeneros: (limit = 10, ordenarPor = "total_musicas") =>
    get(
      "/dashboard/generos",
      { limit, ordenar_por: ordenarPor },
      [...mock.generos].sort((a, b) => b[ordenarPor] - a[ordenarPor]).slice(0, limit),
      []
    ),

  getArtistas: (limit = 10, genero) =>
    get("/dashboard/artistas", clean({ limit, genero }), mock.artistas.slice(0, limit), []),

  getImproprio: (genero) =>
    get("/dashboard/improprio", clean({ genero }), mock.improprio, []),

  getFaixasPopularidade: (genero) =>
    get("/dashboard/faixas-popularidade", clean({ genero }), mock.faixasPopularidade, []),

  getListaGeneros: () =>
    get("/dashboard/lista-generos", {}, mock.listaGeneros, []),

  // Consulta por Cantor / Artista
  getCantoresLista: (limit = 150) =>
    get(
      "/dashboard/cantores/lista",
      { limit },
      mock.artistas ? mock.artistas.map((a) => a.artista) : [],
      []
    ),

  getCantorDetalhe: (nomeArtista) =>
    get(
      "/dashboard/cantores/detalhe",
      { nome_artista: nomeArtista },
      {
        nome_artista: nomeArtista,
        total_musicas: 0,
        popularidade_media: 0,
        dancabilidade_media: 0,
        generos: [],
        musicas: [],
        albuns_sucesso: [],
      },
      dadosVazios.cantorDetalhe(nomeArtista)
    ),

  // Operações CRUD (Create, Update, Delete)
  criarMusica: async (dados) => {
    if (mockAtivo) {
      return {
        sucesso: true,
        mensagem: `Música '${dados.titulo_musica}' cadastrada com sucesso!`,
        sql_executado: `INSERT INTO musica (titulo_musica, duracao_ms, popularidade, dancabilidade, id_album) VALUES ('${dados.titulo_musica}', 210000, ${dados.popularidade}, ${dados.dancabilidade}, '${dados.album}');\nINSERT INTO interpreta (id_musica, id_artista) VALUES (UUID(), '${dados.artista}');\nINSERT INTO classifica (id_musica, id_genero) VALUES (UUID(), '${dados.genero}');`,
      };
    }
    const res = await api.post("/dashboard/musicas", dados);
    return res.data;
  },

  atualizarItem: async (dados) => {
    if (mockAtivo) {
      return {
        sucesso: true,
        mensagem: `${dados.tipo.charAt(0).toUpperCase() + dados.tipo.slice(1)} atualizado para '${dados.novo_nome}' com sucesso!`,
        sql_executado: `UPDATE ${
          dados.tipo === "artista"
            ? "artista SET nome_artista"
            : dados.tipo === "album"
            ? "album SET nome_album"
            : "musica SET titulo_musica"
        } = '${dados.novo_nome}' WHERE id = '${dados.identificador}';`,
      };
    }
    const res = await api.put("/dashboard/atualizar", dados);
    return res.data;
  },

  deletarMusica: async (idMusica) => {
    if (mockAtivo) {
      return {
        sucesso: true,
        mensagem: `Música removida com sucesso!`,
        sql_executado: `DELETE FROM classifica WHERE id_musica = '${idMusica}';\nDELETE FROM interpreta WHERE id_musica = '${idMusica}';\nDELETE FROM musica WHERE id_musica = '${idMusica}';`,
      };
    }
    const res = await api.delete(`/dashboard/musicas/${idMusica}`);
    return res.data;
  },
};
