import { ProcessedItem } from "@/lib/types";

// Temporary hardcoded teams - should be moved to database
export const TEAMS_BY_CONSULTANT: Record<string, string[]> = {
  "consultant1-pistoes": ["FUNCIONARIO1", "FUNCIONARIO2", "FUNCIONARIO3", "FUNCIONARIO4"],
  "consultant2-engrenagens": ["FUNCIONARIO5", "FUNCIONARIO6", "FUNCIONARIO7"],
  "consultant3-bomba": ["FUNCIONARIO8", "FUNCIONARIO9", "FUNCIONARIO10", "FUNCIONARIO11", "FUNCIONARIO12"],
  "consultant3-comandos": ["FUNCIONARIO13", "FUNCIONARIO14", "FUNCIONARIO15"],
  "consultant4": ["FUNCIONARIO16", "FUNCIONARIO17", "FUNCIONARIO18", "FUNCIONARIO19", "FUNCIONARIO20", "FUNCIONARIO21", "FUNCIONARIO22", "FUNCIONARIO23"],
  "consultant5": ["FUNCIONARIO24"],
  "avulsos": ["OUTROS"]
};

export interface ResponsavelInfo {
  nome: string;
  isGerente: boolean;
}

export interface DepartamentoInfo {
  nome: string;
  tipo: string;
}

export function getResponsavelInfo(responsavel: string): ResponsavelInfo | null {
  if (!responsavel) return null;

  const nome = responsavel.toLowerCase();
  const isGerente = nome.includes("gerente") || nome.includes("diretor") || nome.includes("supervisor");

  return {
    nome: responsavel,
    isGerente,
  };
}

export function getDepartamentoByResponsavel(responsavel: string): DepartamentoInfo | null {
  if (!responsavel) return null;

  const nome = responsavel.toLowerCase();

  if (nome.includes("consultant1")) {
    return { nome: "Pistões e Hidráulicos", tipo: "pistoes" };
  }
  if (nome.includes("consultant3")) {
    return { nome: "Bomba e Comandos", tipo: "bomba" };
  }
  if (nome.includes("consultant2")) {
    return { nome: "Engrenagens", tipo: "engrenagens" };
  }
  if (nome.includes("consultant4")) {
    return { nome: "Geral", tipo: "geral" };
  }
  if (nome.includes("consultant5")) {
    return { nome: "Especiais", tipo: "especiais" };
  }

  return { nome: "Outros", tipo: "outros" };
}

export interface TeamMember {
  _id?: string;
  name: string;
  role?: string;
  supervisorId?: string;
  active: boolean;
}

export interface ConsultorTeam {
  consultor: {name: string};
  teamMembers: TeamMember[];
  totalItens: number;
}

export function getDepartamentosFromData(
  processedItems: ProcessedItem[],
  registeredUsers?: Array<{name: string}>,
  teamData?: Array<{consultor: any, teamMembers: TeamMember[]}>
): ConsultorTeam[] {
  if (!teamData || teamData.length === 0) {
    return [];
  }

  return teamData.map((team) => {
    // Calcula itens do consultor
    const consultorItems = processedItems.filter(item =>
      item.responsavel?.toLowerCase().trim() === team.consultor.name.toLowerCase().trim()
    );

    // Calcula itens dos membros da equipe
    const teamMemberItems = team.teamMembers.reduce((total, member) => {
      const memberItems = processedItems.filter(item =>
        item.responsavel?.toLowerCase().trim() === member.name.toLowerCase().trim()
      );
      return total + memberItems.length;
    }, 0);

    return {
      consultor: team.consultor,
      teamMembers: team.teamMembers,
      totalItens: consultorItems.length + teamMemberItems
    };
  }).filter(team => team.totalItens > 0); // Só mostra equipes que têm itens
}

export function getTeamForConsultant(
  name: string | undefined | null,
  departmentMembers: any[] = []
): string[] {
  if (!name || !departmentMembers) return [];

  const consultorMembers = departmentMembers.filter(member =>
    member.active &&
    member.name &&
    member.name.toLowerCase().includes(name.toLowerCase())
  );

  return consultorMembers.map(member => member.name);
}

export function formatPersonName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}