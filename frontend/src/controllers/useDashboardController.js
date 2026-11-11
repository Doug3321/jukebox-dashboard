/**
 * Controller: orquestra estado + chamadas ao service.
 * A View só consome o que este hook expõe (dados, filtros e ações).
 */
import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";

export function useDashboardController() {
  const [filtros, setFiltros] = useState({ genero: "", limitTop: 10, ordenarGeneros: "total_musicas" });
  const [dados, setDados] = useState({
    resumo: null, topMusicas: [], generos: [], artistas: [],
    improprio: [], faixas: [], listaGeneros: [],
  });
  const [loading, setLoading] = useState(true);
  const [usandoMock, setUsandoMock] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const { genero, limitTop, ordenarGeneros } = filtros;
    const res = await Promise.all([
      dashboardService.getResumo(genero),
      dashboardService.getTopMusicas(limitTop, genero),
      dashboardService.getGeneros(12, ordenarGeneros),
      dashboardService.getArtistas(10, genero),
      dashboardService.getImproprio(genero),
      dashboardService.getFaixasPopularidade(genero),
      dashboardService.getListaGeneros(),
    ]);
    const [resumo, topMusicas, generos, artistas, improprio, faixas, listaGeneros] = res.map((r) => r.data);
    setDados({ resumo, topMusicas, generos, artistas, improprio, faixas, listaGeneros });
    setUsandoMock(res.some((r) => r.mock));
    setLoading(false);
  }, [filtros]);

  useEffect(() => { carregar(); }, [carregar]);

  const atualizarFiltro = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor }));

  return { dados, filtros, loading, usandoMock, atualizarFiltro, recarregar: carregar };
}
