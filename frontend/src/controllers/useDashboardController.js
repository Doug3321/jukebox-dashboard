/**
 * Controller: orquestra estado + chamadas ao service.
 * A View só consome o que este hook expõe (dados, filtros e ações).
 */
import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";

export function useDashboardController() {
  const [filtros, setFiltros] = useState({
    genero: "",
    limitTop: 10,
    ordenarGeneros: "total_musicas",
  });

  const [dados, setDados] = useState({
    resumo: null,
    topMusicas: [],
    generos: [],
    artistas: [],
    improprio: [],
    faixas: [],
    listaGeneros: [],
    cantores: [],
  });

  // Estado do Cantor selecionado
  const [cantorSelecionado, setCantorSelecionado] = useState("");
  const [cantorDetalhe, setCantorDetalhe] = useState(null);
  const [carregandoCantor, setCarregandoCantor] = useState(false);

  // Estados de Modais CRUD
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalAtualizarAberto, setModalAtualizarAberto] = useState(false);
  const [itemParaAtualizar, setItemParaAtualizar] = useState(null);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [musicaParaDeletar, setMusicaParaDeletar] = useState(null);

  // Banner com query SQL executada
  const [sqlInfo, setSqlInfo] = useState(null);

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
      dashboardService.getCantoresLista(150),
    ]);

    const [
      resumo,
      topMusicas,
      generos,
      artistas,
      improprio,
      faixas,
      listaGeneros,
      cantores,
    ] = res.map((r) => r.data);

    setDados({
      resumo,
      topMusicas,
      generos,
      artistas,
      improprio,
      faixas,
      listaGeneros,
      cantores: cantores || [],
    });

    setUsandoMock(res.some((r) => r.mock));
    setLoading(false);
  }, [filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Carregar detalhes do cantor quando selecionado
  useEffect(() => {
    if (!cantorSelecionado) {
      setCantorDetalhe(null);
      return;
    }

    async function buscarCantor() {
      setCarregandoCantor(true);
      const res = await dashboardService.getCantorDetalhe(cantorSelecionado);
      setCantorDetalhe(res.data);
      setCarregandoCantor(false);
    }

    buscarCantor();
  }, [cantorSelecionado]);

  const atualizarFiltro = (campo, valor) =>
    setFiltros((f) => ({ ...f, [campo]: valor }));

  // =========================================================================
  // Handlers de Ações CRUD
  // =========================================================================

  const handleSalvarNovaMusica = async (formulario) => {
    const res = await dashboardService.criarMusica(formulario);
    setModalCriarAberto(false);
    setSqlInfo({
      mensagem: res.mensagem,
      sql_executado: res.sql_executado,
    });
    // Recarregar os dados do dashboard e do cantor caso coincida
    await carregar();
    if (cantorSelecionado && cantorSelecionado.toLowerCase() === formulario.artista.toLowerCase()) {
      const cRes = await dashboardService.getCantorDetalhe(cantorSelecionado);
      setCantorDetalhe(cRes.data);
    }
  };

  const handleSalvarAtualizar = async (dadosAtualizacao) => {
    const res = await dashboardService.atualizarItem(dadosAtualizacao);
    setModalAtualizarAberto(false);
    setItemParaAtualizar(null);
    setSqlInfo({
      mensagem: res.mensagem,
      sql_executado: res.sql_executado,
    });
    await carregar();
    if (cantorSelecionado) {
      const cRes = await dashboardService.getCantorDetalhe(cantorSelecionado);
      setCantorDetalhe(cRes.data);
    }
  };

  const handleConfirmarDeletar = async (idMusica) => {
    const res = await dashboardService.deletarMusica(idMusica);
    setModalDeletarAberto(false);
    setMusicaParaDeletar(null);
    setSqlInfo({
      mensagem: res.mensagem,
      sql_executado: res.sql_executado,
    });
    await carregar();
    if (cantorSelecionado) {
      const cRes = await dashboardService.getCantorDetalhe(cantorSelecionado);
      setCantorDetalhe(cRes.data);
    }
  };

  const abrirAtualizarMusica = (musica) => {
    setItemParaAtualizar({
      tipo: "musica",
      identificador: musica.id_musica,
      titulo_musica: musica.titulo_musica,
      novoNome: musica.titulo_musica,
    });
    setModalAtualizarAberto(true);
  };

  const abrirAtualizarGenerico = () => {
    setItemParaAtualizar(null);
    setModalAtualizarAberto(true);
  };

  const abrirDeletar = (musica) => {
    setMusicaParaDeletar(musica);
    setModalDeletarAberto(true);
  };

  return {
    dados,
    filtros,
    loading,
    usandoMock,
    atualizarFiltro,
    recarregar: carregar,

    // Cantor
    cantorSelecionado,
    setCantorSelecionado,
    cantorDetalhe,
    carregandoCantor,

    // CRUD
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
    fecharSqlBanner: () => setSqlInfo(null),
  };
}
