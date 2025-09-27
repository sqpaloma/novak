import { getStatusInfo } from "@/hooks/use-cotacoes";

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

// Sorting function
export const sortCotacoes = (data: any[], sortConfig: SortConfig) => {
  if (!sortConfig.direction || !sortConfig.key) return data;

  return [...data].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortConfig.key) {
      case 'tipo':
        aVal = a.tipo;
        bVal = b.tipo;
        break;
      case 'numero':
        aVal = a.numeroSequencial;
        bVal = b.numeroSequencial;
        break;
      case 'identificacao':
        aVal = a.tipo === 'cadastro' ? a.descricao : (a.numeroOS || a.cliente || '');
        bVal = b.tipo === 'cadastro' ? b.descricao : (b.numeroOS || b.cliente || '');
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'responsaveis':
        aVal = a.solicitante?.name || '';
        bVal = b.solicitante?.name || '';
        break;
      case 'itens':
        aVal = a.totalItens || 0;
        bVal = b.totalItens || 0;
        break;
      case 'valor':
        aVal = a.valorTotal || 0;
        bVal = b.valorTotal || 0;
        break;
      case 'data':
        aVal = a.createdAt;
        bVal = b.createdAt;
        break;
      case 'prazo':
        aVal = a.prazoEntrega || '';
        bVal = b.prazoEntrega || '';
        break;
      default:
        aVal = '';
        bVal = '';
    }

    // Handle different data types
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // String comparison
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (sortConfig.direction === 'asc') {
      return aStr.localeCompare(bStr, 'pt-BR');
    } else {
      return bStr.localeCompare(aStr, 'pt-BR');
    }
  });
};

// Filter function
export const filterCotacoes = (data: any[], statusFilter: string, responsavelFilter: string) => {
  return data.filter(cotacao => {
    // Status filter
    if (statusFilter !== 'all' && cotacao.status !== statusFilter) {
      return false;
    }

    // Responsavel filter
    if (responsavelFilter !== 'all') {
      if (responsavelFilter === 'sem_comprador' && cotacao.comprador) {
        return false;
      }
      if (responsavelFilter !== 'sem_comprador' &&
          cotacao.solicitanteId !== responsavelFilter &&
          cotacao.compradorId !== responsavelFilter) {
        return false;
      }
    }

    return true;
  });
};

// Get unique status options for filter
export const getStatusOptions = (data: any[]) => {
  const uniqueStatuses = [...new Set(data.map(c => c.status))];
  return [
    { value: 'all', label: 'Todos os Status' },
    ...uniqueStatuses.map(status => ({
      value: status,
      label: getStatusInfo(status).label
    }))
  ];
};

// Get unique responsavel options for filter
export const getResponsavelOptions = (data: any[]) => {
  const uniqueUsers = new Map();
  data.forEach(c => {
    if (c.solicitante) {
      uniqueUsers.set(c.solicitanteId, c.solicitante.name);
    }
    if (c.comprador) {
      uniqueUsers.set(c.compradorId, c.comprador.name);
    }
  });

  return [
    { value: 'all', label: 'Todos os Responsáveis' },
    { value: 'sem_comprador', label: 'Sem Comprador' },
    ...Array.from(uniqueUsers.entries()).map(([id, name]) => ({
      value: id,
      label: name
    }))
  ];
};

// Utility functions
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('pt-BR');
};