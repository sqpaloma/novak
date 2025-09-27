import { ProcessedItem } from "@/lib/types";

export interface ResponsavelInfo {
  nome: string;
  isGerente: boolean;
}

export interface DepartamentoInfo {
  nome: string;
  tipo: string;
}

export interface TeamMemberInfo {
  name: string;
  role?: string;
  active: boolean;
}

export interface DepartmentStats {
  id: string;
  responsavel: string;
  totalItens: number;
  itensCompletos: number;
  teamMembers?: TeamMemberInfo[];
  consultorItems?: number;
  teamMemberItems?: number;
}

export interface IndividualStats {
  responsavel: ResponsavelInfo;
  departamento: DepartamentoInfo;
  totalItens: number;
  itensCompletos: number;
}

export interface GeneralStats {
  statsPorDepartamento: DepartmentStats[];
}

export type DepartmentStatsResult = IndividualStats | GeneralStats;

export interface MechanicCounts {
  execCount: number;
  overdueCount: number;
}

export interface DepartmentTotals {
  totalExecCount: number;
  totalOverdueCount: number;
}

export interface DepartamentoInfoProps {
  processedItems: ProcessedItem[];
  filteredByResponsavel?: string | null;
  className?: string;
}

export interface TeamMember {
  name: string;
  active: boolean;
}

export interface DepartmentMember extends TeamMember {
  departmentId: string;
}