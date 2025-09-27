"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  UserX,
  BarChart3,
  Eye,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Id } from "@/convex/_generated/dataModel";

interface TeamMember {
  _id: Id<"departmentMembers">;
  name: string;
  role?: string;
  active: boolean;
  departmentName: string;
  createdAt: number;
  updatedAt: number;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  roleDistribution: Record<string, number>;
  members: Array<{
    id: Id<"departmentMembers">;
    name: string;
    role: string;
    departmentId: Id<"departments">;
  }>;
}

export function TeamDashboard() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<"overview" | "members">("overview");

  // Buscar dados da equipe do usuário logado
  const teamMembers = useQuery(
    user?.userId ? api.departments.getMembersBySupervisor : "skip",
    user?.userId ? { supervisorId: user.userId } : undefined
  );

  const teamStats = useQuery(
    user?.userId ? api.departments.getTeamStats : "skip",
    user?.userId ? { supervisorId: user.userId } : undefined
  );

  if (!user || user.role !== "consultor") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Acesso restrito apenas para consultores.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };

  const renderOverview = () => {
    if (teamStats === undefined) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Carregando estatísticas...</p>
        </div>
      );
    }

    if (!teamStats || teamStats.totalMembers === 0) {
      return (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Você ainda não tem membros em sua equipe.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Entre em contato com o administrador para adicionar membros à sua supervisão.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Membros</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Membros Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.activeMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Membros Inativos</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.inactiveMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por função */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Função
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(teamStats.roleDistribution).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma função definida para os membros da equipe.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(teamStats.roleDistribution).map(([role, count]) => (
                  <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{role}</p>
                    <p className="text-xl font-bold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo da equipe */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamStats.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Ativo
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMembers = () => {
    if (teamMembers === undefined) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Carregando membros...</p>
        </div>
      );
    }

    if (!teamMembers || teamMembers.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Você ainda não tem membros em sua equipe.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Entre em contato com o administrador para adicionar membros à sua supervisão.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <Card key={member._id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {member.role && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {member.role}
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      {member.departmentName}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={member.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
                    >
                      {member.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Adicionado em {formatDate(member.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Minha Equipe
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Gerencie e acompanhe sua equipe de trabalho
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedView === "overview" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedView("overview")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </Button>
          <Button
            variant={selectedView === "members" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedView("members")}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Membros
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {selectedView === "overview" ? renderOverview() : renderMembers()}
        </CardContent>
      </Card>
    </div>
  );
}