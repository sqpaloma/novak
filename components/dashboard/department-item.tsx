"use client";

import React from "react";
import { User } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProcessedItem } from "@/lib/types";
import { TEAMS_BY_CONSULTANT } from "@/lib/department-utils";
import { computeDepartmentTotals } from "@/lib/calculation-utils";
import { DepartmentSection } from "./department-section";

interface DepartmentItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    departments: any[];
    processedItems: ProcessedItem[];
    getTeamForConsultant: (name: string) => string[];
  };
}

export const DepartmentItem = ({ index, style, data }: DepartmentItemProps) => {
  const { departments, processedItems, getTeamForConsultant } = data;
  const dep = departments[index];
  const team = getTeamForConsultant(dep.responsavel);

  const depTotals = computeDepartmentTotals(
    processedItems,
    dep.responsavel,
    team
  );

  const renderDepartmentContent = () => {
    if (dep.responsavel.toLowerCase().includes("consultant1")) {
      return (
        <DepartmentSection
          title="Pistões"
          mechanics={TEAMS_BY_CONSULTANT["consultant1-pistoes"]}
          processedItems={processedItems}
          consultantName={dep.responsavel}
          teamList={team}
        />
      );
    }

    if (dep.responsavel.toLowerCase().includes("consultant2")) {
      return (
        <DepartmentSection
          title="Bombas e Motores de Engrenagens"
          mechanics={TEAMS_BY_CONSULTANT["consultant2-engrenagens"]}
          processedItems={processedItems}
          consultantName={dep.responsavel}
          teamList={team}
        />
      );
    }

    if (dep.responsavel.toLowerCase().includes("consultant3")) {
      return (
        <div className="space-y-4">
          <DepartmentSection
            title="Bomba e Motores de Grande Porte"
            mechanics={TEAMS_BY_CONSULTANT["consultant3-bomba"]}
            processedItems={processedItems}
            consultantName={dep.responsavel}
            teamList={team}
          />
          <DepartmentSection
            title="Comandos Hidráulicos de Grande Porte"
            mechanics={TEAMS_BY_CONSULTANT["consultant3-comandos"]}
            processedItems={processedItems}
            consultantName={dep.responsavel}
            teamList={team}
          />
        </div>
      );
    }

    if (dep.responsavel.toLowerCase().includes("avulso")) {
      return (
        <DepartmentSection
          title="Pessoas Avulsas"
          mechanics={TEAMS_BY_CONSULTANT["avulsos"]}
          processedItems={processedItems}
          consultantName={dep.responsavel}
          teamList={team}
        />
      );
    }

    return (
      <DepartmentSection
        title="Mecânicos do time"
        mechanics={team}
        processedItems={processedItems}
        consultantName={dep.responsavel}
        teamList={team}
      />
    );
  };

  return (
    <div style={style}>
      <AccordionItem key={dep.id} value={dep.id}>
        <AccordionTrigger className="px-3 no-underline hover:no-underline [&[data-state=open]]:no-underline">
          <div className="flex w-full items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {dep.responsavel}
                </span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-right">
                  <p className="text-xs text-gray-500">Total:</p>
                  <p className="text-sm font-bold text-blue-600">
                    {dep.totalItens}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        {team.length > 0 && (
          <AccordionContent>
            <div className="px-3">
              {renderDepartmentContent()}
            </div>
          </AccordionContent>
        )}
      </AccordionItem>
    </div>
  );
};