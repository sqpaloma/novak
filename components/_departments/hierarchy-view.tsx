"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Building2, ChevronRight } from "lucide-react";

export function HierarchyView() {
  const departmentHierarchy = useQuery(api.departments.getDepartmentHierarchy);
  const peopleByRole = useQuery(api.people.getPeopleByRoleHierarchy);

  if (!departmentHierarchy || !peopleByRole) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-white/80">Carregando hierarquia...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    const roleColors = {
      "Gerente": "bg-purple-100 text-purple-800 border-purple-200",
      "Consultor": "bg-green-100 text-green-800 border-green-200",
      "Mecânico": "bg-orange-100 text-orange-800 border-orange-200",
    };
    return roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Visão Geral por Função */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Visão Geral da Hierarquia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(peopleByRole).map(([role, people]) => {
            if (people.length === 0) return null;

            const roleLabel = role === 'diretor' ? 'Diretor' :
                            role === 'gerente' ? 'Gerente' :
                            role === 'consultor' ? 'Consultor' :
                            role === 'mecanico' ? 'Mecânico' : 'Outros';

            return (
              <div key={role} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadgeColor(roleLabel)}>
                    {roleLabel} ({people.length})
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ml-4">
                  {people.map((person: any) => (
                    <div
                      key={person._id}
                      className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10"
                    >
                      <User className="h-4 w-4 text-white/60" />
                      <span className="text-sm text-white/90">{person.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Estrutura de Departamentos e Subdepartamentos */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Building2 className="h-5 w-5" />
            Estrutura de Departamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {departmentHierarchy.map((dept: any) => (
            <div key={dept._id} className="space-y-4">
              {/* Departamento Principal */}
              <div className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-white">{dept.name}</h3>
                      <p className="text-sm text-white/70">{dept.description}</p>
                    </div>
                  </div>
                  {dept.responsible && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      {dept.responsible.name}
                    </Badge>
                  )}
                </div>

                {/* Pessoas do Departamento */}
                {dept.people && dept.people.length > 0 && (
                  <div className="mt-3 ml-8">
                    <p className="text-sm text-white/60 mb-2">Pessoas do departamento:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {dept.people.map((person: any) => (
                        <div
                          key={person._id}
                          className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10"
                        >
                          <User className="h-3 w-3 text-white/60" />
                          <span className="text-xs text-white/90">{person.name}</span>
                          <Badge className={getRoleBadgeColor(person.role)} variant="outline">
                            {person.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subdepartamentos */}
                {dept.subdepartments && dept.subdepartments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-white/70">
                      <ChevronRight className="h-4 w-4" />
                      <span className="text-sm font-medium">Subdepartamentos</span>
                    </div>
                    {dept.subdepartments.map((subdept: any) => (
                      <div
                        key={subdept._id}
                        className="ml-6 border border-white/10 rounded-lg p-3 bg-white/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white/90">{subdept.name}</h4>
                          {subdept.responsible && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              {subdept.responsible.name}
                            </Badge>
                          )}
                        </div>

                        {/* Pessoas do Subdepartamento */}
                        {subdept.people && subdept.people.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-white/60">Equipe:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                              {subdept.people.map((person: any) => (
                                <div
                                  key={person._id}
                                  className="flex items-center gap-1 p-1 bg-white/5 rounded text-xs"
                                >
                                  <User className="h-3 w-3 text-white/50" />
                                  <span className="text-white/80">{person.name}</span>
                                  <span className="text-white/50">({person.role})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}