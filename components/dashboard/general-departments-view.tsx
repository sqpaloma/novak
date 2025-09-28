"use client";

import React from "react";
import Link from "next/link";
import { Building, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DepartmentSection } from "./department-section";

interface GeneralDepartmentsViewProps {
  statsPorDepartamento: any[];
  processedItems: any[];
  className?: string;
}

export const GeneralDepartmentsView = ({
  statsPorDepartamento,
  processedItems,
  className,
}: GeneralDepartmentsViewProps) => {
  const filteredDepartments = statsPorDepartamento
    .filter((dep: any) => dep.totalItens > 0)
    .sort((a: any, b: any) => b.totalItens - a.totalItens);

  const departmentData = {
    departments: filteredDepartments,
    processedItems,
  };

  const renderDepartmentContent = (dep: any, team: string[]) => {
    if (dep.responsavel.toLowerCase().includes("consultant1")) {
      return (
        <DepartmentSection
          title="Pistões"
          mechanics={[]}
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
          mechanics={[]}
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
            mechanics={[]}
            processedItems={processedItems}
            consultantName={dep.responsavel}
            teamList={team}
          />
          <DepartmentSection
            title="Comandos Hidráulicos de Grande Porte"
            mechanics={[]}
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
          mechanics={[]}
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
    <Card
      className={`bg-white border-gray-200 text-gray-900 flex flex-col ${className || ""}`}
      style={{ height: "520px" }}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex w-full items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-amber-400" />
            Departamentos
          </CardTitle>
          <Link href="/programacao">
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

      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-hidden">
          <Accordion type="single" collapsible className="w-full h-full">
            <div className="h-full overflow-y-auto">
              {filteredDepartments.map((dep: any) => {
                return (
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
                    {(dep.teamMembers && dep.teamMembers.length > 0) && (
                      <AccordionContent>
                        <div className="px-3">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600 mb-2">
                              Consultor: {dep.consultorItems || 0} itens | Equipe: {dep.teamMemberItems || 0} itens
                            </div>
                            <div className="space-y-1">
                              {dep.teamMembers.map((member: any, index: number) => (
                                <div key={index} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-sm">{member.name}</span>
                                    {member.role && (
                                      <span className="text-xs text-gray-500">({member.role})</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    )}
                  </AccordionItem>
                );
              })}
            </div>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};