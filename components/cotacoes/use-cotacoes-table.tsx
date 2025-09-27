import { useState } from "react";
import { useBuscaCotacoes, useCotacoes, podeExecutarAcao } from "@/hooks/use-cotacoes";
import { Id } from "@/convex/_generated/dataModel";
import { SortConfig } from "./table-utils";

interface FiltrosState {
  busca: string;
  status: string;
  incluirHistorico: boolean;
  responsavel: string;
  dataInicio?: number;
  dataFim?: number;
}

interface UseCotacoesTableProps {
  filtros: FiltrosState;
  userRole: string;
  userId?: Id<"users">;
  isFornecedor?: boolean;
}

export const useCotacoesTable = ({ filtros, userRole, userId, isFornecedor = false }: UseCotacoesTableProps) => {
  // Modal states
  const [selectedCotacao, setSelectedCotacao] = useState<Id<"cotacoes"> | null>(null);
  const [respondingCotacao, setRespondingCotacao] = useState<Id<"cotacoes"> | null>(null);
  const [respondingPendencia, setRespondingPendencia] = useState<Id<"pendenciasCadastro"> | null>(null);
  const [approvingCotacao, setApprovingCotacao] = useState<Id<"cotacoes"> | null>(null);
  const [editingCotacao, setEditingCotacao] = useState<Id<"cotacoes"> | null>(null);

  // Sorting and filtering states
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('all');

  const { excluirCotacao, excluirPendencia, concluirPendencia, finalizarCompra, cancelarCotacao, cancelarPendencia } = useCotacoes();

  // Sorting handler
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  // Action handlers
  const handleCardAction = (cotacao: any, action: string) => {
    if (action === "view") {
      setSelectedCotacao(cotacao._id);
    } else if (action === "responder") {
      if (cotacao.tipo === "cadastro") {
        setRespondingPendencia(cotacao._id);
      } else {
        setRespondingCotacao(cotacao._id);
      }
    } else if (action === "aprovar") {
      setApprovingCotacao(cotacao._id);
    } else if (action === "comprar") {
      handleComprar(cotacao);
    } else if (action === "concluir") {
      handleConcluir(cotacao);
    } else if (action === "cancelar") {
      handleCancelar(cotacao);
    } else if (action === "editar") {
      setEditingCotacao(cotacao._id);
    } else if (action === "excluir") {
      handleExcluir(cotacao);
    } else {
      setSelectedCotacao(cotacao._id);
    }
  };

  const handleExcluir = async (cotacao: any) => {
    if (!userId) return;

    const tipo = cotacao.tipo === "cadastro" ? "solicitação" : "cotação";
    const numero = `#${cotacao.numeroSequencial}`;

    if (!window.confirm(`Tem certeza que deseja excluir esta ${tipo} ${numero}?`)) {
      return;
    }

    try {
      if (cotacao.tipo === "cadastro") {
        await excluirPendencia(cotacao._id, userId);
      } else {
        await excluirCotacao(cotacao._id, userId);
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleConcluir = async (cotacao: any) => {
    if (!userId) return;

    const numero = `#${cotacao.numeroSequencial}`;

    if (!window.confirm(`Confirma a conclusão da solicitação ${numero}?`)) {
      return;
    }

    try {
      await concluirPendencia(cotacao._id, userId);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleComprar = async (cotacao: any) => {
    if (!userId) return;

    const numero = `#${cotacao.numeroSequencial}`;

    if (!window.confirm(`Confirma a finalização da compra da cotação ${numero}?`)) {
      return;
    }

    try {
      await finalizarCompra(cotacao._id, userId);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleCancelar = async (cotacao: any) => {
    if (!userId) return;

    const tipo = cotacao.tipo === "cadastro" ? "solicitação" : "cotação";
    const numero = `#${cotacao.numeroSequencial}`;

    if (!window.confirm(`Tem certeza que deseja cancelar esta ${tipo} ${numero}?`)) {
      return;
    }

    try {
      if (cotacao.tipo === "cadastro") {
        await cancelarPendencia(cotacao._id, userId);
      } else {
        await cancelarCotacao(cotacao._id, userId, "Cancelado pelo usuário");
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleExportarHistorico = (cotacoesHistorico: any[]) => {
    console.log("Exportar histórico para Excel", cotacoesHistorico);
    alert("Funcionalidade de exportação será implementada em breve");
  };

  const getAvailableActions = (cotacao: any) => {
    const actions = ["view"];

    const isSolicitante = cotacao.solicitanteId === userId;
    const isComprador = cotacao.compradorId === userId;

    if (cotacao.tipo === "cadastro") {
      if (["admin", "compras", "gerente"].includes(userRole) &&
          ["pendente", "em_andamento"].includes(cotacao.status)) {
        actions.push("responder");
      }

      if (cotacao.status === "respondida_cadastro" && isSolicitante) {
        actions.push("concluir");
      }

      // Add cancel action for cadastro items
      if (!["concluida", "rejeitada"].includes(cotacao.status) &&
          !cotacao.statusCancelamento &&
          (["admin", "compras", "gerente"].includes(userRole) || isSolicitante)) {
        actions.push("cancelar");
      }

      if (userRole === "admin" || isSolicitante || ["compras", "gerente"].includes(userRole)) {
        actions.push("excluir");
      }
      return actions;
    }

    if (podeExecutarAcao(cotacao.status, "responder", userRole, isSolicitante, isComprador)) {
      actions.push("responder");
    }
    if (podeExecutarAcao(cotacao.status, "aprovar", userRole, isSolicitante, isComprador)) {
      actions.push("aprovar");
    }
    if (podeExecutarAcao(cotacao.status, "comprar", userRole, isSolicitante, isComprador)) {
      actions.push("comprar");
    }
    if (podeExecutarAcao(cotacao.status, "editar", userRole, isSolicitante, isComprador)) {
      actions.push("editar");
    }
    if (podeExecutarAcao(cotacao.status, "cancelar", userRole, isSolicitante, isComprador)) {
      actions.push("cancelar");
    }

    if (userRole === "admin" || isSolicitante) {
      actions.push("excluir");
    }

    return actions;
  };

  const isPendente = (cotacao: any) => {
    if (isFornecedor) {
      const statusPendentesFornecedor = ["em_cotacao"];
      return statusPendentesFornecedor.includes(cotacao.status) &&
             cotacao.fornecedorId === userId;
    }

    if (userRole === "admin") {
      if (cotacao.tipo === "cadastro") {
        return ["pendente", "em_andamento", "respondida_cadastro"].includes(cotacao.status);
      } else {
        return ["novo", "em_cotacao", "aprovada_para_compra", "respondida"].includes(cotacao.status);
      }
    }

    if (cotacao.tipo === "cadastro") {
      const statusPendentesCadastro = ["pendente", "em_andamento", "respondida_cadastro"];
      return statusPendentesCadastro.includes(cotacao.status) &&
             ["compras", "gerente"].includes(userRole);
    }

    const statusPendentesCompras = ["novo", "em_cotacao", "aprovada_para_compra"];
    const statusPendentesVendedor = ["respondida"];

    if (["compras", "gerente"].includes(userRole)) {
      return statusPendentesCompras.includes(cotacao.status);
    }

    if (statusPendentesVendedor.includes(cotacao.status) &&
        cotacao.solicitanteId === userId) {
      return true;
    }

    return false;
  };

  // Build query filters
  const queryFiltros = (() => {
    const baseFilters = {
      busca: filtros.busca || undefined,
      status: (filtros.status && filtros.status !== "all") ? filtros.status : undefined,
      incluirHistorico: filtros.incluirHistorico,
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
    };

    if (isFornecedor) {
      return {
        ...baseFilters,
        fornecedorId: userId,
      };
    }

    if (!["admin", "compras", "gerente"].includes(userRole) && filtros.responsavel !== "all") {
      return {
        ...baseFilters,
        solicitanteId: userId,
      };
    }

    return {
      ...baseFilters,
      solicitanteId: filtros.responsavel === "solicitante" ? userId : undefined,
      compradorId: filtros.responsavel === "comprador" ? userId : undefined,
    };
  })();

  const { cotacoes, isLoading } = useBuscaCotacoes(queryFiltros);

  return {
    // Modal states
    selectedCotacao,
    setSelectedCotacao,
    respondingCotacao,
    setRespondingCotacao,
    respondingPendencia,
    setRespondingPendencia,
    approvingCotacao,
    setApprovingCotacao,
    editingCotacao,
    setEditingCotacao,

    // Sorting and filtering states
    sortConfig,
    statusFilter,
    setStatusFilter,
    responsavelFilter,
    setResponsavelFilter,

    // Handlers
    handleSort,
    handleCardAction,
    handleExportarHistorico,
    getAvailableActions,
    isPendente,

    // Data
    cotacoes,
    isLoading,
  };
};