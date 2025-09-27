import { ProcessedItem } from "@/lib/types";
import { parseBRDate } from "./date-utils";

export function extractOrcamentoFromItem(item: ProcessedItem): string | null {
  const raw: any = item?.raw_data || item?.rawData;
  if (!raw) return null;

  const checkObject = (obj: Record<string, any>) => {
    for (const key of Object.keys(obj)) {
      const k = key.toLowerCase();
      if (
        k.includes("orcamento") ||
        k.includes("orçamento") ||
        k.includes("nro orc") ||
        k.includes("numero orc") ||
        k.includes("num orc") ||
        k === "orc" ||
        k === "orcamento"
      ) {
        const v = obj[key];
        if (v == null) continue;
        const s = v.toString().trim();
        if (s) return s;
      }
    }
    return null;
  };

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const fromObj = checkObject(raw as Record<string, any>);
    if (fromObj) return fromObj;
  }

  if (Array.isArray(raw)) {
    for (const val of raw) {
      if (val && typeof val === "object") {
        const found = checkObject(val as Record<string, any>);
        if (found) return found;
      } else if (typeof val === "string") {
        const lower = val.toLowerCase();
        if (lower.includes("orc") || lower.includes("orç")) {
          const m = val.match(/\d{3,}/);
          if (m && m[0]) return m[0];
        }
      }
    }
  }

  return null;
}

export function isInExecution(status: string | undefined | null): boolean {
  const s = (status || "").toLowerCase();
  return (
    s.includes("execu") || // cobre "execução" e "execucao"
    s.includes("em andamento") ||
    s.includes("fazendo")
  );
}

export function isOverdue(item: ProcessedItem): boolean {
  let deadlineDate = null;

  // Tenta usar dataRegistro primeiro
  if (item.dataRegistro) {
    deadlineDate = new Date(item.dataRegistro);
  } else if (item.raw_data && typeof item.raw_data === 'object' && 'prazo' in item.raw_data) {
    deadlineDate = parseBRDate((item.raw_data as any).prazo);
  } else if (item.rawData) {
    // Se rawData é array, procura por campos de data
    if (Array.isArray(item.rawData)) {
      for (const val of item.rawData) {
        if (val && typeof val === "object") {
          const possibleDateFields = [
            "prazo",
            "data_registro",
            "data_prazo",
            "deadline",
          ];
          for (const field of possibleDateFields) {
            if ((val as any)[field]) {
              deadlineDate = parseBRDate((val as any)[field]);
              if (deadlineDate) break;
            }
          }
        } else if (val && typeof val === "string") {
          // Se é string que pode ser uma data
          const testDate = parseBRDate(val);
          if (testDate) {
            deadlineDate = testDate;
            break;
          }
        }
        if (deadlineDate) break;
      }
    }
    // Se não encontrou e item tem prazo diretamente
    if (!deadlineDate && item.prazo) {
      deadlineDate = parseBRDate(item.prazo);
    }
  }

  if (!deadlineDate || isNaN(deadlineDate.getTime())) {
    return false; // Se não tem data válida, considera no prazo
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  (deadlineDate as Date).setHours(0, 0, 0, 0);

  return (deadlineDate as Date) < today;
}

export function extractMechanicFromItem(
  item: ProcessedItem,
  consultantName: string,
  team: string[]
): string | null {
  if (!item) return null;
  const teamSet = new Set((team || []).map((t) => t.toUpperCase().trim()));
  const raw = item.rawData;
  if (!raw) return null;

  // Função auxiliar para verificar se um valor corresponde a alguém do time
  const findMatchInTeam = (value: string): string | null => {
    const upperValue = value.toUpperCase().trim();

    // Verifica correspondência exata primeiro
    if (teamSet.has(upperValue)) return upperValue;

    // Verifica correspondências parciais para nomes compostos
    for (const teamMember of team) {
      const teamUpper = teamMember.toUpperCase().trim();

      // Para nomes compostos como "FUNCIONARIO X", verifica se o valor é uma versão mais completa
      if (upperValue.includes(teamUpper) && upperValue.length > teamUpper.length) {
        return teamUpper;
      }

      // Para casos onde o valor é uma parte do nome (ex: "FUNCIONARIO" para "FUNCIONARIO X")
      if (teamUpper.includes(upperValue) && teamUpper.length > upperValue.length) {
        // Verifica se é realmente uma parte válida (começa com o valor)
        if (teamUpper.startsWith(upperValue + ' ') || teamUpper.startsWith(upperValue)) {
          return teamUpper;
        }
      }

      // Verifica correspondência por palavras individuais
      const teamParts = teamUpper.split(' ').filter(Boolean);
      const valueParts = upperValue.split(' ').filter(Boolean);

      // Se todos os parts do valor estão contidos no team member
      if (valueParts.length > 0 && valueParts.every(part => teamParts.includes(part))) {
        return teamUpper;
      }

      // Se o primeiro nome bate e o valor tem mais especificidade
      if (teamParts.length > 1 && valueParts.length > 1 &&
          teamParts[0] === valueParts[0] &&
          (teamParts.includes(valueParts[1]) || valueParts.includes(teamParts[1]))) {
        return teamUpper;
      }
    }

    return null;
  };

  // Se for um array "linha" (strings ou valores)
  if (Array.isArray(raw)) {
    for (const val of raw) {
      if (val == null) continue;
      const s = val.toString().trim();
      if (s) {
        const match = findMatchInTeam(s);
        if (match) return match;
      }
    }
  }

  // Se for um array de objetos
  if (Array.isArray(raw)) {
    for (const val of raw) {
      if (val && typeof val === "object") {
        const possibleFields = [
          "executante",
          "mecanico",
          "mecânico",
          "responsavel_execucao",
          "executor",
        ];
        for (const f of possibleFields) {
          const v = (val as any)[f];
          if (typeof v === "string" && v.trim()) {
            const match = findMatchInTeam(v);
            if (match) return match;
          }
        }
        // Se não achou em campos conhecidos, varre todos os valores string
        for (const k of Object.keys(val)) {
          const v = (val as any)[k];
          if (typeof v === "string" && v.trim()) {
            const match = findMatchInTeam(v);
            if (match) return match;
          }
        }
      }
    }
  }

  return null;
}