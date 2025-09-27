import { ProcessedItem, StatusGroups } from './types';

export const buildStatusGroups = (items: ProcessedItem[]): StatusGroups => {
  const total = items;
  const aprovacao = items.filter((item) => 
    item.status?.toLowerCase().includes('aprovação') || 
    item.status?.toLowerCase().includes('aprovacao')
  );
  const analises = items.filter((item) => 
    item.status?.toLowerCase().includes('análise') || 
    item.status?.toLowerCase().includes('analise')
  );
  const orcamentos = items.filter((item) => 
    item.status?.toLowerCase().includes('orçamento') || 
    item.status?.toLowerCase().includes('orcamento')
  );
  const execucao = items.filter((item) => 
    item.status?.toLowerCase().includes('execução') || 
    item.status?.toLowerCase().includes('execucao')
  );
  const pronto = items.filter((item) => 
    item.status?.toLowerCase().includes('pronto') || 
    item.status?.toLowerCase().includes('finalizado')
  );

  return {
    total,
    aprovacao,
    analises,
    orcamentos,
    execucao,
    pronto,
  };
};