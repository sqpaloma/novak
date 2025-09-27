"use client";

import React from "react";
import { DepartamentoInfoProps } from "@/lib/department-types";
import { getDepartamentoStats } from "@/lib/department-data-processor";
import { IndividualDepartmentView } from "./individual-department-view";
import { GeneralDepartmentsView } from "./general-departments-view";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboardData } from "@/lib/convex-dashboard-client";

export function DepartamentoInfo({
  processedItems,
  filteredByResponsavel,
  className,
}: DepartamentoInfoProps) {
  // Busca consultores e suas equipes
  const consultorsWithTeams = useQuery(api.departments.getConsultorsWithTeams);
  
  // Busca dados do dashboard para aplicar mapeamento de consultor
  const dashboardData = useDashboardData();

  // Função para mapear responsável para consultor
  const mapResponsavelToConsultor = (responsavel: string): string => {
    if (!responsavel) return "Não informado";
    
    const firstName = responsavel.split(" ")[0]?.toLowerCase();
    
    const consultorMappings: Record<string, string> = {
      "lucas": "Lucas Santos",
      "rafael": "Rafael Massa", 
      "rafaelmas": "Rafael Massa",
      "marcelo": "Marcelo Menezes",
      "giovanni": "Giovanni",
      "alexandre": "Alexandre",
      "alexsandro": "Alexsandro",
      "kaua": "Kaua"
    };

    const mappedConsultor = consultorMappings[firstName];
    if (mappedConsultor) {
      return mappedConsultor;
    } else {
      // Fallback: usar o primeiro nome capitalizado
      return firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : "Não informado";
    }
  };

  // Processa os itens do dashboard para incluir mapeamento de consultor
  const processedItemsWithConsultor = React.useMemo(() => {
    if (!dashboardData?.items) return processedItems;

    // Cria um mapa dos itens do dashboard com consultor mapeado
    const dashboardItemsMap = new Map();
    dashboardData.items.forEach((item: any) => {
      if (item.responsavel) {
        const mappedConsultor = mapResponsavelToConsultor(item.responsavel);
        dashboardItemsMap.set(item.os || item.id, {
          ...item,
          consultor: mappedConsultor
        });
      }
    });

    // Aplica o mapeamento aos processedItems
    return processedItems.map(item => {
      const dashboardItem = dashboardItemsMap.get(item.os || item.id);
      if (dashboardItem) {
        return {
          ...item,
          consultor: dashboardItem.consultor
        };
      }
      return item;
    });
  }, [processedItems, dashboardData]);

  // Converte para o formato esperado pelas funções
  const registeredUsers = consultorsWithTeams?.map(team => ({
    name: team.consultor.name
  }));

  const stats = getDepartamentoStats(
    processedItemsWithConsultor,
    filteredByResponsavel,
    registeredUsers,
    consultorsWithTeams
  );

  if (!stats) return null;

  // Individual responsavel view
  if ("responsavel" in stats) {
    const { responsavel, totalItens } = stats;

    return (
      <IndividualDepartmentView
        responsavel={responsavel}
        totalItens={totalItens}
        processedItems={processedItemsWithConsultor}
        className={className}
      />
    );
  }

  // General departments view
  return (
    <GeneralDepartmentsView
      statsPorDepartamento={stats.statsPorDepartamento}
      processedItems={processedItemsWithConsultor}
      className={className}
    />
  );
}