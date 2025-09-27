import { ProcessedItem } from "@/lib/types";
import {
  DepartmentStatsResult,
  IndividualStats,
  GeneralStats,
  ResponsavelInfo,
  DepartamentoInfo
} from "./department-types";
import {
  getResponsavelInfo,
  getDepartamentoByResponsavel,
  getDepartamentosFromData,
  TeamMember,
  ConsultorTeam
} from "./department-utils";

export function isItemCompleted(item: ProcessedItem): boolean {
  const status = item.status?.toLowerCase() || "";
  return (
    status.includes("pronto") ||
    status.includes("concluído") ||
    status.includes("concluido") ||
    status.includes("finalizado") ||
    status.includes("entregue") ||
    status.includes("completo")
  );
}

export function getDepartamentoStats(
  processedItems: ProcessedItem[],
  filteredByResponsavel?: string | null,
  registeredUsers?: Array<{name: string}>,
  teamData?: Array<{consultor: any, teamMembers: TeamMember[]}>
): DepartmentStatsResult | null {
  if (filteredByResponsavel) {
    return getIndividualStats(processedItems, filteredByResponsavel);
  }

  return getGeneralStats(processedItems, registeredUsers, teamData);
}

function getIndividualStats(
  processedItems: ProcessedItem[],
  filteredByResponsavel: string
): IndividualStats | null {
  const responsavelInfo = getResponsavelInfo(filteredByResponsavel);
  const departamento = getDepartamentoByResponsavel(filteredByResponsavel);

  if (!responsavelInfo) return null;

  const itensDoResponsavel = processedItems.filter(
    (item) =>
      item.responsavel?.toLowerCase() === filteredByResponsavel.toLowerCase()
  );

  const itensCompletos = itensDoResponsavel.filter(isItemCompleted);

  return {
    responsavel: responsavelInfo,
    departamento: departamento || { nome: "Outros", tipo: "outros" },
    totalItens: itensDoResponsavel.length,
    itensCompletos: itensCompletos.length,
  };
}

function getGeneralStats(
  processedItems: ProcessedItem[],
  registeredUsers?: Array<{name: string}>,
  teamData?: Array<{consultor: any, teamMembers: TeamMember[]}>
): GeneralStats {
  const consultorTeams = getDepartamentosFromData(processedItems, registeredUsers, teamData);

  const statsPorDepartamento = consultorTeams.map((team) => {
    // Itens do consultor
    const consultorItems = processedItems.filter(item =>
      item.responsavel?.toLowerCase().trim() === team.consultor.name.toLowerCase().trim()
    );

    // Itens de todos os membros da equipe
    const teamMemberItems = team.teamMembers.reduce((allItems, member) => {
      const memberItems = processedItems.filter(item =>
        item.responsavel?.toLowerCase().trim() === member.name.toLowerCase().trim()
      );
      return [...allItems, ...memberItems];
    }, [] as ProcessedItem[]);

    // Todos os itens da equipe (consultor + membros)
    const allTeamItems = [...consultorItems, ...teamMemberItems];
    const itensCompletos = allTeamItems.filter(isItemCompleted);

    return {
      id: `team-${team.consultor.name}`,
      responsavel: team.consultor.name,
      totalItens: allTeamItems.length,
      itensCompletos: itensCompletos.length,
      teamMembers: team.teamMembers,
      consultorItems: consultorItems.length,
      teamMemberItems: teamMemberItems.length
    };
  });

  return { statsPorDepartamento };
}