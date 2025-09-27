import { ProcessedItem } from "@/lib/types";
import { isInExecution, isOverdue, extractMechanicFromItem } from "./item-utils";

export function computeMechanicCounts(
  processedItems: ProcessedItem[],
  consultantName: string,
  mechanicUpper: string,
  team: string[]
): { execCount: number; overdueCount: number } {
  const consultantLower = (consultantName || "").toLowerCase().trim();
  let execCount = 0;
  let overdueCount = 0;

  for (const item of processedItems) {
    const respLower = (item.responsavel || "").toLowerCase();

    // Se for usuário especial, também incluir itens de outros usuários que são de engrenagem
    let shouldInclude = respLower.includes(consultantLower);
    if (consultantLower.includes("consultant1") && respLower.includes("consultant2")) {
      // Verificar se o mecânico está no time de engrenagens
      const specialTeam = team; // Assuming 'team' is the source of truth for special team
      if (specialTeam.includes(mechanicUpper)) {
        shouldInclude = true;
      }
    }

    // Se for usuário específico, excluir itens de engrenagem
    if (consultantLower.includes("consultant2") && respLower.includes("consultant2")) {
      const mech = extractMechanicFromItem(item, consultantName, team);
      const specialTeam = team; // Assuming 'team' is the source of truth for special team
      if (mech && specialTeam.includes(mech)) {
        shouldInclude = false; // Excluir mecânicos de engrenagem do usuário específico
      }
    }

    if (!shouldInclude) continue;
    if (!isInExecution(item.status)) continue;

    const mech = extractMechanicFromItem(item, consultantName, team);
    if (!mech) continue;
    if (mech !== mechanicUpper) continue;

    execCount += 1;
    if (isOverdue(item)) overdueCount += 1;
  }

  return { execCount, overdueCount };
}

export function computeDepartmentTotals(
  processedItems: ProcessedItem[],
  consultantName: string,
  team: string[]
): { totalExecCount: number; totalOverdueCount: number } {
  const consultantLower = (consultantName || "").toLowerCase().trim();
  let totalExecCount = 0;
  let totalOverdueCount = 0;

  for (const item of processedItems) {
    const respLower = (item.responsavel || "").toLowerCase();

    // Se for usuário especial, também incluir itens relacionados
    let shouldInclude = respLower.includes(consultantLower);
    if (consultantLower.includes("consultant1") && respLower.includes("consultant2")) {
      // Verificar se tem mecânico do time de engrenagens
      const mech = extractMechanicFromItem(item, consultantName, team);
      const specialTeam = team; // Use team data from database
      if (mech && specialTeam.includes(mech)) {
        shouldInclude = true;
      }
    }

    // Se for usuário específico, excluir itens de engrenagem
    if (consultantLower.includes("consultant2") && respLower.includes("consultant2")) {
      const mech = extractMechanicFromItem(item, consultantName, team);
      const specialTeam = ["FUNCIONARIO5", "FUNCIONARIO6", "FUNCIONARIO7"];
      if (mech && specialTeam.includes(mech)) {
        shouldInclude = false; // Excluir mecânicos de engrenagem do usuário específico
      }
    }

    if (!shouldInclude) continue;
    if (!isInExecution(item.status)) continue;

    const mech = extractMechanicFromItem(item, consultantName, team);
    if (!mech) continue;

    totalExecCount += 1;
    if (isOverdue(item)) totalOverdueCount += 1;
  }

  return { totalExecCount, totalOverdueCount };
}