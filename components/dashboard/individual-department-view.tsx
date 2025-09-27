"use client";

import React from "react";
import Link from "next/link";
import { Building, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProcessedItem } from "@/lib/types";
import { ResponsavelInfo, getTeamForConsultant, TEAMS_BY_CONSULTANT } from "@/lib/department-utils";
import { DepartmentSection } from "./department-section";

interface IndividualDepartmentViewProps {
  responsavel: ResponsavelInfo;
  totalItens: number;
  processedItems: ProcessedItem[];
  className?: string;
}

export const IndividualDepartmentView = ({
  responsavel,
  totalItens,
  processedItems,
  className,
}: IndividualDepartmentViewProps) => {
  const teamList = !responsavel.isGerente
    ? getTeamForConsultant(responsavel.nome)
    : [];

  const renderTeamContent = () => {
    if (responsavel.nome.toLowerCase().includes("consultant1")) {
      return (
        <DepartmentSection
          title="Pistões"
          mechanics={["FUNCIONARIO1", "FUNCIONARIO2", "FUNCIONARIO3", "FUNCIONARIO4"]}
          processedItems={processedItems}
          consultantName={responsavel.nome}
          teamList={teamList}
        />
      );
    }

    if (responsavel.nome.toLowerCase().includes("consultant2")) {
      return (
        <DepartmentSection
          title="Bombas e Motores de Engrenagens"
          mechanics={TEAMS_BY_CONSULTANT["consultant2-engrenagens"]}
          processedItems={processedItems}
          consultantName={responsavel.nome}
          teamList={teamList}
        />
      );
    }

    if (responsavel.nome.toLowerCase().includes("consultant3")) {
      return (
        <div className="space-y-4">
          <DepartmentSection
            title="Bomba e Motores de Grande Porte"
            mechanics={TEAMS_BY_CONSULTANT["consultant3-bomba"]}
            processedItems={processedItems}
            consultantName={responsavel.nome}
            teamList={teamList}
          />
          <DepartmentSection
            title="Comandos Hidráulicos de Grande Porte"
            mechanics={TEAMS_BY_CONSULTANT["consultant3-comandos"]}
            processedItems={processedItems}
            consultantName={responsavel.nome}
            teamList={teamList}
          />
        </div>
      );
    }

    if (responsavel.nome.toLowerCase().includes("avulso")) {
      return (
        <DepartmentSection
          title="Pessoas Avulsas"
          mechanics={TEAMS_BY_CONSULTANT["avulsos"]}
          processedItems={processedItems}
          consultantName={responsavel.nome}
          teamList={teamList}
        />
      );
    }

    return (
      <DepartmentSection
        title="Mecânicos do time"
        mechanics={teamList}
        processedItems={processedItems}
        consultantName={responsavel.nome}
        teamList={teamList}
      />
    );
  };

  return (
    <Card
      className={`bg-white border-gray-200 text-gray-900 flex flex-col ${className || ""}`}
      style={{ height: "520px" }}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex w-full items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-3">
            {responsavel.isGerente ? (
              <Building className="h-5 w-5 text-amber-400" />
            ) : (
              <User className="h-5 w-5 text-blue-400" />
            )}
            {responsavel.nome}
            <span className="text-lg font-bold text-blue-600">
              {totalItens}
            </span>
          </CardTitle>
          <Link
            href={`/programacao?consultor=${encodeURIComponent(responsavel.nome)}`}
          >
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-blue-600 text-blue-700 hover:bg-blue-50"
            >
              Programação
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 space-y-3">
          {responsavel.isGerente && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Posição:</p>
              <p className="font-medium text-gray-900">Gerente Geral</p>
            </div>
          )}
        </div>

        {!responsavel.isGerente && (teamList || []).length > 0 && (
          <div className="flex-1 pt-2 overflow-hidden">
            <Accordion
              type="single"
              collapsible
              className="w-full h-full"
              defaultValue="team"
            >
              <AccordionItem value="team" className="h-full">
                <AccordionTrigger className="text-sm no-underline hover:no-underline [&[data-state=open]]:no-underline">
                  Time
                </AccordionTrigger>
                <AccordionContent className="overflow-hidden">
                  <div
                    style={{ maxHeight: "300px" }}
                    className="overflow-y-auto"
                  >
                    {renderTeamContent()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};