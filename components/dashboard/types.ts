// Re-export types from the main types file
export type { 
  ProcessedItem,
  RawDataItem,
  DashboardData,
  StatusGroups,
  Activity,
  DepartmentMember,
  Department,
  ResponsavelInfo,
  FilterState,
  ChartDataPoint,
  TooltipData,
  DepartmentStats
} from "@/lib/types";

import { ProcessedItem } from "@/lib/types";

// Legacy interface for backward compatibility
export interface DashboardDataOld {
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
  rawData: ProcessedItem[];
}

// Calendar item interface for activity planner
export interface CalendarItem {
  consultor: string;
  id: string;
  os: string;
  titulo: string;
  cliente: string;
  responsavel: string;
  status: string;
  prazo: string;
  data: string;
  rawData: any[];
}
