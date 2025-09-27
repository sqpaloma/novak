import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ProcessedItem, DepartmentMember } from "@/lib/types";

export interface DashboardData {
  _id?: string;
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardItem {
  _id?: string;
  os: string;
  titulo?: string;
  cliente?: string;
  responsavel?: string;
  status: string;
  dataRegistro?: string;
  rawData?: ProcessedItem;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardUpload {
  _id?: string;
  fileName: string;
  totalRecords: number;
  uploadedBy: string;
  uploadDate: number;
  createdAt?: number;
}

// Hook para carregar dados do dashboard
export function useDashboardData() {
  return useQuery(api.dashboard.loadDashboardData);
}

// Hook para obter histórico de uploads
export function useDashboardUploadHistory() {
  return useQuery(api.dashboard.getDashboardUploadHistory);
}

// Hook para obter responsáveis únicos
export function useUniqueResponsaveis() {
  return useQuery(api.dashboard.getUniqueResponsaveis);
}

// Hook para obter itens por categoria
export function useDashboardItemsByCategory(category: string) {
  return useQuery(api.dashboard.getDashboardItemsByCategory, { category });
}

// Hook para obter itens por responsável
export function useDashboardItemsByResponsavel(responsavel: string) {
  return useQuery(api.dashboard.getDashboardItemsByResponsavel, {
    responsavel,
  });
}

// NOVO: Hook para obter clientes únicos
export function useUniqueClientes() {
  return useQuery(api.dashboard.getUniqueClientes);
}

// NOVO: Hook para obter itens por cliente (busca parcial)
export function useDashboardItemsByCliente(cliente: string) {
  return useQuery(api.dashboard.getDashboardItemsByCliente, { cliente });
}

// NOVO: Hook para obter dados do dashboard organizados por departamento
export function useDashboardDataByDepartment() {
  return useQuery(api.dashboard.getDashboardDataByDepartment);
}

// Hook para obter todos os usuários/consultores
export function useConsultors(): DepartmentMember[] | undefined {
  const users = useQuery(api.users.listUsers);
  return users?.map(user => ({
    _id: user._id,
    name: user.name || "N/A",
    departmentId: user.departmentId || "",
    active: true, // Assume users are active by default
    createdAt: user.createdAt || Date.now(),
    updatedAt: user.updatedAt || Date.now()
  }));
}

// Função para mapear responsável para consultor baseado nos usuários do Convex
export function mapConsultorResponsible(
  originalResponsible: string,
  consultors: DepartmentMember[] | undefined
): string {
  if (!consultors || consultors.length === 0) {
    return originalResponsible;
  }

  const normalizedOriginal = originalResponsible.toLowerCase().trim();
  
  // Busca exata por nome
  const exactMatch = consultors.find(consultor => 
    consultor.name.toLowerCase().trim() === normalizedOriginal
  );
  
  if (exactMatch) {
    return exactMatch.name;
  }

  // Busca parcial por nome (contém)
  const partialMatch = consultors.find(consultor => 
    consultor.name.toLowerCase().includes(normalizedOriginal) ||
    normalizedOriginal.includes(consultor.name.toLowerCase())
  );
  
  if (partialMatch) {
    return partialMatch.name;
  }

  // Se não encontrar correspondência, retorna o original
  return originalResponsible;
}

// Hook para salvar dados do dashboard
export function useSaveDashboardData() {
  return useMutation(api.dashboard.saveDashboardData);
}

// Hook para limpar dados do dashboard
export function useClearDashboardData() {
  return useMutation(api.dashboard.clearAllDashboardData);
}

// Função para salvar dados do dashboard (para compatibilidade com código existente)
export async function saveDashboardData(
  dashboardData: Omit<DashboardData, "_id" | "createdAt" | "updatedAt">,
  items: Omit<DashboardItem, "_id" | "createdAt" | "updatedAt">[],
  fileName: string,
  uploadedBy?: string
) {
  // Esta função será usada através do hook useSaveDashboardData
  // Mantemos aqui apenas para compatibilidade de tipo
  return { success: true, uploadId: null };
}

// Função para carregar dados do dashboard (para compatibilidade com código existente)
export async function loadDashboardData(): Promise<{
  dashboardData: DashboardData | null;
  items: DashboardItem[];
}> {
  // Esta função será usada através do hook useDashboardData
  // Mantemos aqui apenas para compatibilidade de tipo
  return { dashboardData: null, items: [] };
}

// Função para obter histórico de uploads do dashboard (para compatibilidade)
export async function getDashboardUploadHistory(): Promise<DashboardUpload[]> {
  return [];
}

// Função para limpar todos os dados do dashboard (para compatibilidade)
export async function clearAllDashboardData() {
  return { success: true };
}

// Função para obter itens por categoria (para compatibilidade)
export async function getDashboardItemsByCategory(
  category: string
): Promise<DashboardItem[]> {
  return [];
}

// Função para obter responsáveis únicos (para compatibilidade)
export async function getUniqueResponsaveis(): Promise<string[]> {
  return [];
}

// Função para obter itens por responsável (para compatibilidade)
export async function getDashboardItemsByResponsavel(
  responsavel: string
): Promise<DashboardItem[]> {
  return [];
}
