import { ProcessedItem, Activity } from "./types";

// Mapeamento de responsáveis para equipes
const RESPONSAVEL_TO_TEAM: Record<string, string[]> = {
  "supervisor-pistoes": ["TECH01", "TECH02", "TECH03", "TECH04"],
  "supervisor-engrenagens": ["TECH05", "TECH06", "TECH07"],
  "supervisor-bomba": ["TECH08", "TECH09", "TECH10", "TECH11", "TECH12"],
  "supervisor-comandos": ["TECH13", "TECH14", "TECH15"],
  "supervisor-geral": [
    "TECH16",
    "TECH17",
    "TECH18",
    "TECH19",
    "TECH20",
    "TECH21",
    "TECH22",
    "TECH23",
  ],
  "supervisor-manutencao": ["TECH24"],
};

export function getTeamByResponsavel(responsavel: string): string[] {
  const normalizedResponsavel = responsavel.toLowerCase().trim();
  
  // Busca direta no mapeamento
  for (const [key, team] of Object.entries(RESPONSAVEL_TO_TEAM)) {
    if (key.toLowerCase().includes(normalizedResponsavel) || 
        normalizedResponsavel.includes(key.toLowerCase())) {
      return team;
    }
  }
  
  return [];
}

export function extractMechanicFromItem(item: ProcessedItem, team: string[]): string | null {
  if (!item.rawData && !item.raw_data) return null;
  
  const rawData = item.rawData || item.raw_data;
  if (!rawData) return null;

  // Lista de campos possíveis para mecânico
  const mechanicFields = [
    'mecanico', 'mecânico', 'responsavel_mecanico', 'responsável_mecânico',
    'executado_por', 'realizado_por', 'operador', 'tecnico', 'técnico'
  ];

  // Verifica cada campo possível
  for (const field of mechanicFields) {
    const value = (rawData as any)[field];
    if (value && typeof value === 'string') {
      const normalizedValue = value.toUpperCase().trim();

      // Verifica se o valor está na equipe
      if (team.some(member => member.includes(normalizedValue) || normalizedValue.includes(member))) {
        return normalizedValue;
      }
    }
  }

  // Se não encontrar nos campos específicos, procura em todos os campos
  for (const [key, value] of Object.entries(rawData)) {
    if (typeof value === 'string') {
      const normalizedValue = value.toUpperCase().trim();
      
      // Verifica se algum membro da equipe está no valor
      const foundMember = team.find(member => 
        member.includes(normalizedValue) || normalizedValue.includes(member)
      );
      
      if (foundMember) {
        return foundMember;
      }
    }
  }

  return null;
}

export function getDueDate(activity: ProcessedItem): Date | null {
  if (!activity) return null;

  // Verifica primeiro o campo prazo direto
  if (activity.prazo) {
    const date = parseBRDate(activity.prazo);
    if (date) return date;
  }

  // Verifica nos dados brutos
  const rawData = activity.rawData || activity.raw_data;
  if (!rawData) return null;

  const dateFields = [
    'prazo', 'data_prazo', 'vencimento', 'data_vencimento', 
    'entrega', 'data_entrega', 'deadline', 'due_date'
  ];

  for (const field of dateFields) {
    const value = (rawData as any)[field];
    if (value && typeof value === 'string') {
      const date = parseBRDate(value);
      if (date) return date;
    }
  }

  return null;
}

function parseBRDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // Remove espaços e caracteres especiais
  const cleanDate = dateStr.trim().replace(/[^\d\/\-\.]/g, '');
  
  // Padrões de data brasileira: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
  const patterns = [
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/
  ];

  for (const pattern of patterns) {
    const match = cleanDate.match(pattern);
    if (match) {
      const [, day, month, year] = match;
      const fullYear = year.length === 2 ? `20${year}` : year;
      
      const date = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day));
      
      // Verifica se a data é válida
      if (date.getDate() === parseInt(day) && 
          date.getMonth() === parseInt(month) - 1 && 
          date.getFullYear() === parseInt(fullYear)) {
        return date;
      }
    }
  }

  return null;
}

export function getTodayItems(items: ProcessedItem[]): ProcessedItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return items.filter(item => {
    const dueDate = getDueDate(item);
    if (!dueDate) return false;
    
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });
}

export function getThisWeekItems(items: ProcessedItem[]): ProcessedItem[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
  endOfWeek.setHours(23, 59, 59, 999);
  
  return items.filter(item => {
    const dueDate = getDueDate(item);
    if (!dueDate) return false;
    
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
  });
}

export function groupItemsByMechanic(items: ProcessedItem[], team: string[]): Record<string, ProcessedItem[]> {
  const grouped: Record<string, ProcessedItem[]> = {};
  
  // Inicializa com todos os membros da equipe
  team.forEach(member => {
    grouped[member] = [];
  });
  
  // Adiciona categoria para itens sem mecânico definido
  grouped['SEM_MECANICO'] = [];
  
  items.forEach(item => {
    const mechanic = extractMechanicFromItem(item, team);
    if (mechanic && grouped[mechanic]) {
      grouped[mechanic].push(item);
    } else {
      grouped['SEM_MECANICO'].push(item);
    }
  });
  
  return grouped;
}

export function isOverdue(item: ProcessedItem): boolean {
  const dueDate = getDueDate(item);
  if (!dueDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}

export function getOverdueItems(items: ProcessedItem[]): ProcessedItem[] {
  return items.filter(isOverdue);
}

// Status helper functions
export function isAnaliseStatus(status: string): boolean {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  return normalizedStatus.includes('analise') ||
         normalizedStatus.includes('análise') ||
         normalizedStatus.includes('pendente') ||
         normalizedStatus.includes('em andamento');
}

export function isExecucaoStatus(status: string): boolean {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase().trim();
  return normalizedStatus.includes('execucao') ||
         normalizedStatus.includes('execução') ||
         normalizedStatus.includes('executando') ||
         normalizedStatus.includes('fazendo');
}

// Date utility
export function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

// Consultant and department mappings
export const TEAMS_BY_CONSULTANT: Record<string, string[]> = {
  "pistoes": ["TECH01", "TECH02", "TECH03", "TECH04"],
  "engrenagens": ["TECH05", "TECH06", "TECH07"],
  "bomba": ["TECH08", "TECH09", "TECH10", "TECH11", "TECH12"],
  "comandos": ["TECH13", "TECH14", "TECH15"],
  "geral": ["TECH16", "TECH17", "TECH18", "TECH19", "TECH20", "TECH21", "TECH22", "TECH23"],
  "manutencao": ["TECH24"],
};

export function getTeamForConsultant(consultant: string | null): string[] {
  if (!consultant) return [];

  const normalizedConsultant = consultant.toLowerCase().trim();

  // Check direct mappings
  for (const [key, team] of Object.entries(TEAMS_BY_CONSULTANT)) {
    if (key.includes(normalizedConsultant) || normalizedConsultant.includes(key)) {
      return team;
    }
  }

  // Fallback to responsavel mapping
  return getTeamByResponsavel(consultant);
}

export function getDepartmentsForConsultant(consultant: string | null): string[] {
  if (!consultant) return [];

  const normalizedConsultant = consultant.toLowerCase().trim();
  const departments: string[] = [];

  // Check which departments this consultant can access
  for (const [key] of Object.entries(TEAMS_BY_CONSULTANT)) {
    if (key.includes(normalizedConsultant) || normalizedConsultant.includes(key)) {
      departments.push(key);
    }
  }

  return departments.length > 0 ? departments : [consultant];
}