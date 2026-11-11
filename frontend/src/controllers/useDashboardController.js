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
  const [backendOffline, setBackendOffline] = useState(false);
  const [usandoMock, setUsandoMock] = useState(() => dashboardService.isMockAtivo());
  const [versaoCatalogo, setVersaoCatalogo] = useState(0);

  const alternarMock = () => {
    const novo = !usandoMock;
    dashboardService.setMockAtivo(novo);
    setUsandoMock(novo);
  };

  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);
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
      rResumo,
      rTopMusicas,
      rGeneros,
      rArtistas,
      rImproprio,
      rFaixas,
      rListaGeneros,
      rCantores,
    ] = res;

    setDados((prev) => {
      const temDadosPrevios = prev.resumo && prev.resumo.total_musicas > 0;
      return {
        resumo: rResumo.erro && temDadosPrevios ? prev.resumo : rResumo.data,
        topMusicas: rTopMusicas.erro && prev.topMusicas.length > 0 ? prev.topMusicas : rTopMusicas.data,
        generos: rGeneros.erro && prev.generos.length > 0 ? prev.generos : rGeneros.data,
        artistas: rArtistas.erro && prev.artistas.length > 0 ? prev.artistas : rArtistas.data,
        improprio: rImproprio.erro && prev.improprio.length > 0 ? prev.improprio : rImproprio.data,
        faixas: rFaixas.erro && prev.faixas.length > 0 ? prev.faixas : rFaixas.data,
        listaGeneros: rListaGeneros.erro && prev.listaGeneros.length > 0 ? prev.listaGeneros : rListaGeneros.data,
        cantores: rCantores.erro && prev.cantores.length > 0 ? prev.cantores : (rCantores.data || []),
      };
    });

    setBackendOffline(res.every((r) => r.erro));
    if (!silencioso) setLoading(false);
  }, [filtros, usandoMock]);

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
    setVersaoCatalogo((v) => v + 1);
    await carregar(true);
    if (cantorSelecionado && cantorSelecionado.toLowerCase() === formulario.artista.toLowerCase()) {
      const cRes = await dashboardService.getCantorDetalhe(cantorSelecionado);
      if (!cRes.erro) setCantorDetalhe(cRes.data);
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

    if (dadosAtualizacao.tipo === "musica") {
      setDados((prev) => ({
        ...prev,
        topMusicas: prev.topMusicas.map((m) =>
          m.id_musica === dadosAtualizacao.identificador
            ? { ...m, titulo_musica: dadosAtualizacao.novo_nome }
            : m
        ),
      }));
      setCantorDetalhe((prev) =>
        prev
          ? {
              ...prev,
              musicas: prev.musicas.map((m) =>
                m.id_musica === dadosAtualizacao.identificador
                  ? { ...m, titulo_musica: dadosAtualizacao.novo_nome }
                  : m
              ),
            }
          : prev
      );
    }

    setVersaoCatalogo((v) => v + 1);
    await carregar(true);
    if (cantorSelecionado) {
      const cRes = await dashboardService.getCantorDetalhe(cantorSelecionado);
      if (!cRes.erro) setCantorDetalhe(cRes.data);
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

    // Atualização otimista imediata na tela (sem zerar dados)
    setDados((prev) => ({
      ...prev,
      resumo: prev.resumo
        ? { ...prev.resumo, total_musicas: Math.max(0, prev.resumo.total_musicas - 1) }
        : prev.resumo,
      topMusicas: prev.topMusicas.filter((m) => m.id_musica !== idMusica),
    }));

    setCantorDetalhe((prev) =>
      prev
        ? {
            ...prev,
            total_musicas: Math.max(0, prev.total_musicas - 1),
            musicas: prev.musicas.filter((m) => m.id_musica !== idMusica),
          }
        : prev
    );

    setVersaoCatalogo((v) => v + 1);
    await carregar(true);
    if (cantorSelecionado) {
      const cRes = await dashboardService.getCantorDetalhe(cantorSelecionado);
      if (!cRes.erro) setCantorDetalhe(cRes.data);
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
    backendOffline,
    usandoMock,
    alternarMock,
    versaoCatalogo,
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
