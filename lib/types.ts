// Tipos principais para o dashboard
export interface ProcessedItem {
  _id?: string;
  id?: string; // Para compatibilidade com código existente
  os: string;
  titulo?: string;
  cliente?: string;
  responsavel?: string;
  status: string;
  dataRegistro?: string;
  data_registro?: string; // Para compatibilidade
  prazo?: string;
  data?: string; // Para compatibilidade com código existente
  rawData?: RawDataItem | any[]; // Permite ambos os formatos
  raw_data?: RawDataItem | any[]; // Para compatibilidade
  createdAt?: number;
  updatedAt?: number;
}

export interface RawDataItem {
  [key: string]: unknown;
  prazo?: string;
  cliente?: string;
  responsavel?: string;
  status?: string;
  os?: string;
  titulo?: string;
}

// Tipos para dashboard data
export interface DashboardData {
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
  rawData: ProcessedItem[];
}

// Tipos para status groups
export interface StatusGroups {
  total: ProcessedItem[];
  aprovacao: ProcessedItem[];
  analises: ProcessedItem[];
  orcamentos: ProcessedItem[];
  execucao: ProcessedItem[];
  pronto: ProcessedItem[];
}

// Tipos para atividades/apontamentos
export interface Activity {
  _id?: string;
  os: string;
  titulo?: string;
  cliente?: string;
  responsavel?: string;
  status: string;
  dataRegistro?: string;
  prazo?: string;
  tipo?: 'montagem' | 'desmontagem' | 'teste';
  setor?: string;
  mecanico?: string;
  rawData?: RawDataItem;
}

// Tipos para membros de departamento
export interface DepartmentMember {
  _id: string;
  departmentId: string;
  name: string;
  role?: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

// Tipos para departamentos
export interface Department {
  _id: string;
  name: string;
  defaultRole: string;
  description?: string;
  active: boolean;
  members?: DepartmentMember[];
  createdAt: number;
  updatedAt: number;
}

// Tipos para responsáveis/consultores
export interface ResponsavelInfo {
  name: string;
  department: string;
  team: string[];
  totalItems: number;
}

// Tipos para cotações
export interface CotacaoItem {
  _id?: string;
  itemId?: string;
  codigoPeca: string;
  descricao: string;
  quantidade: number;
  preco?: number;
  precoUnitario?: number;
  observacoes?: string;
  prazoEntrega?: string;
  fornecedor?: string;
}

export interface Cotacao {
  _id?: string;
  numero: string;
  cliente: string;
  responsavel: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'concluido';
  itens: CotacaoItem[];
  valorTotal?: number;
  dataVencimento?: string;
  observacoes?: string;
  createdAt?: number;
  updatedAt?: number;
}

// Tipos para filtros
export interface FilterState {
  [key: string]: string | number | boolean | null | undefined;
}

// Tipos para notas/anotações
export interface Note {
  _id?: string;
  content: string;
  todoId?: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

// Tipos para todos/tarefas
export interface Todo {
  _id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  userId: string;
  notes?: Note[];
  createdAt: number;
  updatedAt: number;
}

// Tipos para charts/gráficos
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TooltipData {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

// Tipos para programação/planejamento
export interface MechanicColumn {
  mechanic: string;
  items: Activity[];
}

// Tipos para upload de dados
export interface UploadData {
  fileName: string;
  totalRecords: number;
  uploadedBy: string;
  uploadDate: number;
  data: ProcessedItem[];
}

// Tipos para estatísticas de departamento
export interface DepartmentStats {
  departamento: string;
  responsavel: string;
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
  overdue: number;
}

// Tipos para dados consolidados
export interface ConsolidatedData {
  [key: string]: ChartDataPoint[];
}

// Tipos genéricos para eventos
export interface SelectChangeEvent {
  target: {
    value: string;
  };
}

export interface InputChangeEvent {
  target: {
    value: string;
  };
}

// Tipos para dados do dashboard hook
export interface DashboardItemRow extends ProcessedItem {
  id: string;
  rawData: any[];
} 