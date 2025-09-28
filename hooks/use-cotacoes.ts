"use client";


import { toast } from "sonner";

export interface CotacaoItem {
  _id?: any;
  codigoPeca: string;
  descricao: string;
  quantidade: number;
  precoUnitario?: number;
  precoTotal?: number;
  prazoEntrega?: string;
  fornecedor?: string;
  observacoes?: string;
  precisaCadastro?: boolean;
  codigoSankhya?: string; // Código Sankhya para itens que precisam de cadastro
  // Novos campos para diferenciação de itens
  tipoItem?: "cadastrado" | "novo"; // Se é item já cadastrado no Sankya ou novo
  // Campos para cadastro (apenas para itens novos)
  aplicacao?: string;
  modelo?: string;
  numeroSerie?: string;
  oem?: string;
}

export interface CotacaoFormData {
  numeroOS?: string;
  numeroOrcamento?: string;
  cliente?: string;
  observacoes?: string;
  fornecedor?: string; // DEPRECATED - mantido para compatibilidade
  solicitarInfoTecnica?: boolean; // DEPRECATED - mantido para compatibilidade
  fornecedorId?: any; // Novo campo para fornecedor
  tipoSolicitacao: "cotacao" | "especificacao_tecnica" | "ambos"; // Novo campo obrigatório
  itens: CotacaoItem[];
}

export function useCotacoes() {
  // Queries
  const listCotacoes: any = [];
  const getProximoNumero: any = 0;


  // Função para criar nova cotação
  const handleCriarCotacao = async (
    data: CotacaoFormData,
    solicitanteId: any
  ) => {
    try {
      const result = await {
        numeroOS: data.numeroOS,
        numeroOrcamento: data.numeroOrcamento,
        cliente: data.cliente,
        solicitanteId,
        observacoes: data.observacoes,
        fornecedor: data.fornecedor, // DEPRECATED - mantido para compatibilidade
        solicitarInfoTecnica: data.solicitarInfoTecnica, // DEPRECATED - mantido para compatibilidade
        fornecedorId: data.fornecedorId, // Novo campo
        tipoSolicitacao: data.tipoSolicitacao, // Novo campo
        itens: data.itens.map(item => ({
          codigoPeca: item.codigoPeca,
          descricao: item.descricao,
          quantidade: item.quantidade,
          observacoes: item.observacoes,
          precisaCadastro: item.precisaCadastro,
        })),
      };

      toast.success(`Cotação #${result.numeroOS} criada com sucesso!`);
      return result;
    } catch (error) {
      toast.error(`Erro ao criar cotação: ${error}`);
      throw error;
    }
  };


  // Função para responder cotação
  const handleResponderCotacao = async (
    cotacaoId: any,
    compradorId: any,
    itensResposta: Array<{
      itemId: any;
      precoUnitario: number;
      prazoEntrega?: string;
      fornecedor?: string;
      observacoes?: string;
      codigoSankhya?: string; // Código Sankhya para itens que precisam de cadastro
    }>,
    observacoes?: string,
    // Parâmetros para upload de arquivos
    cotacaoFile?: File,
    propostaTecnicaFile?: File
  ) => {
    try {
      let cotacaoStorageId: any;
      let cotacaoNome: string | undefined;
      let propostaStorageId: any;
      let propostaNome: string | undefined;

      // Upload do arquivo de cotação se fornecido
      if (cotacaoFile) {
        const uploadUrl = ""; // TODO: Implementar
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": cotacaoFile.type },
          body: cotacaoFile,
        });
        const { storageId } = await result.json();
        cotacaoStorageId = storageId;
        cotacaoNome = cotacaoFile.name;
      }

      // Upload do arquivo de proposta técnica se fornecido
      if (propostaTecnicaFile) {
        const uploadUrl = ""; // TODO: Implementar
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": propostaTecnicaFile.type },
          body: propostaTecnicaFile,
        });
        const { storageId } = await result.json();
        propostaStorageId = storageId;
        propostaNome = propostaTecnicaFile.name;
      }

      const result = {
        cotacaoId,
        compradorId,
        itensResposta,
        observacoes,
        anexoCotacaoStorageId: cotacaoStorageId,
        anexoCotacaoNome: cotacaoNome,
        anexoPropostaTecnicaStorageId: propostaStorageId,
        anexoPropostaTecnicaNome: propostaNome,
      };
      
      // Verificar se algum item tem código Sankhya para personalizar a mensagem
      const temCodigoSankhya = itensResposta.some(item => item.codigoSankhya?.trim());
      const temAnexos = cotacaoFile || propostaTecnicaFile;
      
      let mensagem = "Cotação respondida com sucesso!";
      if (temCodigoSankhya && temAnexos) {
        mensagem += " Códigos Sankhya foram registrados e arquivos anexados.";
      } else if (temCodigoSankhya) {
        mensagem += " Códigos Sankhya foram registrados para os itens que precisam de cadastro.";
      } else if (temAnexos) {
        mensagem += " Arquivos anexados com sucesso.";
      }
      
      toast.success(mensagem);
    } catch (error) {
      toast.error(`Erro ao responder cotação: ${error}`);
      throw error;
    }
  };

  // Função para aprovar cotação
  const handleAprovarCotacao = async (
    cotacaoId: any,
    solicitanteId: any,
    observacoes?: string
  ) => {
    try {
      const result = { cotacaoId, solicitanteId, observacoes };
      toast.success("Cotação aprovada para compra!");
    } catch (error) {
      toast.error(`Erro ao aprovar cotação: ${error}`);
      throw error;
    }
  };

  // Função para finalizar compra
  const handleFinalizarCompra = async (
    cotacaoId: any,
    compradorId: any,
    observacoes?: string
  ) => {
    try {
      const result = { cotacaoId, compradorId, observacoes };
      toast.success("Compra finalizada com sucesso!");
    } catch (error) {
      toast.error(`Erro ao finalizar compra: ${error}`);
      throw error;
    }
  };

  // Função para cancelar cotação
  const handleCancelarCotacao = async (
    cotacaoId: any,
    usuarioId: any,
    motivo: string
  ) => {
    try {
      const result = { cotacaoId, usuarioId, motivo };
      toast.success("Cotação cancelada!");
    } catch (error) {
      toast.error(`Erro ao cancelar cotação: ${error}`);
      throw error;
    }
  };

  const handleCancelarPendencia = async (
    pendenciaId: any,
    usuarioId: any,
    motivo?: string
  ) => {
    try {
      const result = {
        pendenciaId,
        usuarioId,
        motivoCancelamento: motivo || "Cancelado pelo usuário"
      };
      toast.success("Solicitação cancelada!");
    } catch (error) {
      toast.error(`Erro ao cancelar solicitação: ${error}`);
      throw error;
    }
  };

  // Função para editar itens
  const handleEditarItens = async (
    cotacaoId: any,
    usuarioId: any,
    itens: Array<{
      itemId?: any;
      codigoPeca: string;
      descricao: string;
      quantidade: number;
      observacoes?: string;
    }>,
      itensParaRemover?: any[]
  ) => {
    try {
      const result = {
        cotacaoId,
        usuarioId,
        itens,
        itensParaRemover,
      };
      toast.success("Itens atualizados com sucesso!");
    } catch (error) {
      toast.error(`Erro ao editar itens: ${error}`);
      throw error;
    }
  };

  // Função para excluir cotação
  const handleExcluirCotacao = async (
    cotacaoId: any,
    usuarioId: any
  ) => {
    try {
      const result = { cotacaoId, usuarioId };
      toast.success("Cotação excluída com sucesso!");
    } catch (error) {
      toast.error(`Erro ao excluir cotação: ${error}`);
      throw error;
    }
  };

  // Função para excluir pendência de cadastro
  const handleExcluirPendencia = async (
    pendenciaId: any,
    usuarioId: any
  ) => {
    try {
      const result = { pendenciaId, usuarioId };
      toast.success("Solicitação excluída com sucesso!");
    } catch (error) {
      toast.error(`Erro ao excluir solicitação: ${error}`);
      throw error;
    }
  };

  // Função para responder pendência de cadastro com código Sankhya
  const handleResponderPendencia = async (
    pendenciaId: any,
    usuarioId: any,
    codigoSankhya: string,
    observacoes?: string
  ) => {
    try {
      const result = {
        pendenciaId,
        usuarioId,
        codigoSankhya,
        observacoes,
      };
      toast.success("Pendência respondida com código Sankhya!");
    } catch (error) {
      toast.error(`Erro ao responder pendência: ${error}`);
      throw error;
    }
  };

  // Função para concluir pendência de cadastro
  const handleConcluirPendencia = async (
    pendenciaId: any,
    usuarioId: any
  ) => {
    try {
      const result = { pendenciaId, usuarioId };
      toast.success("Solicitação concluída com sucesso!");
    } catch (error) {
      toast.error(`Erro ao concluir solicitação: ${error}`);
      throw error;
    }
  };

  // Função para migrar pendências sem número sequencial
  const handleMigrarPendencias = async () => {
    try {
          const result = { migradas: 0, message: "Nenhuma pendência migrada" };
      if (result.migradas > 0) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
      return result;
    } catch (error) {
      toast.error(`Erro na migração: ${error}`);
      throw error;
    }
  };

  return {
    // Data
    cotacoes: listCotacoes,
    proximoNumero: getProximoNumero,
    
    // Actions
    criarCotacao: handleCriarCotacao,
    responderCotacao: handleResponderCotacao,
    aprovarCotacao: handleAprovarCotacao,
    finalizarCompra: handleFinalizarCompra,
    cancelarCotacao: handleCancelarCotacao,
    cancelarPendencia: handleCancelarPendencia,
    editarItens: handleEditarItens,
    excluirCotacao: handleExcluirCotacao,
    excluirPendencia: handleExcluirPendencia,
    responderPendencia: handleResponderPendencia,
    concluirPendencia: handleConcluirPendencia,
    migrarPendencias: handleMigrarPendencias,
    
    // Loading states
    isLoading: listCotacoes === undefined,
  };
}


// Hook para cotação específica
export function useCotacao(cotacaoId?: any) {
  const cotacao: any = {};

  return {
    cotacao,
    isLoading: cotacao === undefined,
  };
}

// Hook para busca de cotações
export function useBuscaCotacoes(filtros: {
  status?: string;
  solicitanteId?: any;
  compradorId?: any;
  busca?: string;
  incluirHistorico?: boolean;
  dataInicio?: number;
  dataFim?: number;
}) {
  const cotacoes: any = [];

  return {
    cotacoes,
    isLoading: cotacoes === undefined,
    total: cotacoes?.length || 0,
  };
}

// Utilitários para status
export const statusCotacao = {
  novo: { label: "Novo", color: "bg-white text-blue-900", textColor: "text-blue-900" },
  em_cotacao: { label: "Em Cotação", color: "bg-blue-600 text-white", textColor: "text-blue-600" },
  respondida: { label: "Respondida", color: "bg-white text-blue-900", textColor: "text-blue-900" },
  aprovada_para_compra: { label: "Aprovada para Compra", color: "bg-blue-600 text-white", textColor: "text-blue-600" },
  comprada: { label: "Comprada", color: "bg-blue-800 text-white", textColor: "text-blue-800" },
  cancelada: { label: "Cancelada", color: "bg-blue-400 text-white", textColor: "text-blue-400" },
  // Status de pendências de cadastro
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", textColor: "text-yellow-800" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-100 text-blue-800 border-blue-200", textColor: "text-blue-800" },
  respondida_cadastro: { label: "Respondida", color: "bg-white text-blue-900 border-blue-200", textColor: "text-blue-900" },
  concluida: { label: "Concluída", color: "bg-green-100 text-green-800 border-green-200", textColor: "text-green-800" },
  rejeitada: { label: "Rejeitada", color: "bg-red-100 text-red-800 border-red-200", textColor: "text-red-800" },
};

export const getStatusInfo = (status: string) => {
  return statusCotacao[status as keyof typeof statusCotacao] || {
    label: status,
    color: "bg-gray-500",
    textColor: "text-gray-700",
  };
};

/**
 * Verifica se um usuário pode executar uma ação específica em uma cotação
 * 
 * PERMISSÕES DO ADMINISTRADOR (role === "admin"):
 * ✅ Criar cotações (como vendedor)
 * ✅ Ver todas as cotações (sem restrições)
 * ✅ Responder cotações (como compras) 
 * ✅ Aprovar cotações (pode aprovar qualquer cotação, não só as próprias)
 * ✅ Finalizar compras (como compras)
 * ✅ Cancelar cotações (em qualquer status)
 * ✅ Editar cotações (em qualquer status, exceto finalizadas)
 * ✅ Ver filtro de responsável (como equipe de compras)
 * ✅ Ver todas as cotações pendentes da equipe de compras
 * 
 * O administrador tem acesso total a todas as funcionalidades do sistema.
 */
export const podeExecutarAcao = (
  status: string,
  acao: string,
  userRole: string,
  isSolicitante: boolean,
  isComprador: boolean
) => {
  // Administradores têm acesso total a todas as ações (exceto algumas restrições específicas)
  const isAdmin = userRole === "admin";
  
  switch (acao) {
    case "responder":
      return ["novo", "em_cotacao"].includes(status) && 
             (isAdmin || ["compras", "gerente"].includes(userRole));
    
    case "aprovar":
      // Administradores podem aprovar qualquer cotação respondida
      return status === "respondida" && (isAdmin || isSolicitante);
    
    case "comprar":
      return status === "aprovada_para_compra" && 
             (isAdmin || ["compras", "gerente"].includes(userRole));
    
    case "cancelar":
      return !["comprada", "cancelada"].includes(status) && 
             (isAdmin || isSolicitante || ["compras", "gerente"].includes(userRole));
    
    case "editar":
      // Administradores podem editar cotações em qualquer status (exceto finalizadas)
      return !["comprada", "cancelada"].includes(status) && 
             (isAdmin || 
              (["novo", "em_cotacao"].includes(status) && isSolicitante) ||
              (status === "em_cotacao" && ["compras", "gerente"].includes(userRole)));
    
    default:
      return false;
  }
}; 