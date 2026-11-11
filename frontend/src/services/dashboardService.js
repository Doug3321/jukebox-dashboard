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
};
