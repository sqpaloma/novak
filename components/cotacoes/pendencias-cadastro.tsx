"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, XCircle, User, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface PendenciasCadastroProps {
  userRole: string;
  userId?: string;
  isFornecedor?: boolean;
}

const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  em_andamento: "bg-blue-100 text-blue-800 border-blue-200",
  concluida: "bg-green-100 text-green-800 border-green-200",
  rejeitada: "bg-red-100 text-red-800 border-red-200",
};

const statusIcons = {
  pendente: Clock,
  em_andamento: User,
  concluida: CheckCircle,
  rejeitada: XCircle,
};

const statusLabels = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  rejeitada: "Rejeitada",
};

export function PendenciasCadastro({ userRole, userId, isFornecedor = false }: PendenciasCadastroProps) {
  // Fornecedores não veem pendências de cadastro
  if (isFornecedor) {
    return null;
  }

  const [statusFilter, setStatusFilter] = useState<string>("pendente");
  const cancelarPendencia = useMutation(api.cotacoes.cancelarPendenciaCadastro);

  // Construir filtros baseado no perfil do usuário
  const queryParams = (() => {
    const baseParams = { status: statusFilter };

    // Para usuários não-compras: só suas próprias pendências
    if (!["admin", "compras", "gerente"].includes(userRole) && userId) {
      return { ...baseParams, solicitanteId: userId };
    }

    return baseParams;
  })();

  const pendencias = useQuery(api.cotacoes.listPendenciasCadastro, queryParams as any);

  const contadores = useQuery(api.cotacoes.contarPendenciasCadastro,
    (!["admin", "compras", "gerente"].includes(userRole) && userId) ? { solicitanteId: userId as any } :
    "skip"
  );

  if (!pendencias || !contadores) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Solicitações de Cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelarPendencia = async (pendenciaId: any) => {
    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    try {
      await cancelarPendencia({
        pendenciaId,
        usuarioId: userId as any,
        motivoCancelamento: "Cancelado pelo usuário",
      });
      toast.success("Pendência cancelada com sucesso");
    } catch (error) {
      toast.error("Erro ao cancelar pendência: " + error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Solicitações de Cadastro de Peças
        </CardTitle>
        
        {/* Contadores */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={statusFilter === "pendente" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pendente")}
            className="text-xs"
          >
            Pendente ({contadores.pendente})
          </Button>
          <Button
            variant={statusFilter === "em_andamento" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("em_andamento")}
            className="text-xs"
          >
            Em Andamento ({contadores.em_andamento})
          </Button>
          <Button
            variant={statusFilter === "concluida" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("concluida")}
            className="text-xs"
          >
            Concluída ({contadores.concluida})
          </Button>
          <Button
            variant={statusFilter === "rejeitada" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("rejeitada")}
            className="text-xs"
          >
            Rejeitada ({contadores.rejeitada})
          </Button>
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="text-xs"
          >
            Todas ({contadores.total})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {pendencias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma solicitação encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Anexo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendencias.map((pendencia) => {
                  const StatusIcon = statusIcons[pendencia.status as keyof typeof statusIcons];

                  // Determine display status and color based on cancellation
                  const displayStatus = pendencia.statusCancelamento === "cancelado" ? "cancelado" : pendencia.status;
                  const displayLabel = pendencia.statusCancelamento === "cancelado" ? "Cancelado" : statusLabels[pendencia.status as keyof typeof statusLabels];
                  const displayColor = pendencia.statusCancelamento === "cancelado" ? "bg-gray-100 text-gray-800 border-gray-200" : statusColors[pendencia.status as keyof typeof statusColors];
                  const DisplayIcon = pendencia.statusCancelamento === "cancelado" ? Ban : StatusIcon;

                  // Check if user can cancel this item
                  const canCancel =
                    !["concluida", "rejeitada"].includes(pendencia.status) &&
                    !pendencia.statusCancelamento &&
                    (["admin", "compras", "gerente"].includes(userRole) || pendencia.solicitanteId === userId);

                  return (
                    <TableRow key={pendencia._id}>
                      <TableCell>
                        <Badge className={displayColor}>
                          <DisplayIcon className="h-3 w-3 mr-1" />
                          {displayLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {pendencia.codigo}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={pendencia.descricao}>
                          {pendencia.descricao}
                        </div>
                      </TableCell>
                      <TableCell>
                        {pendencia.marca || "-"}
                      </TableCell>
                      <TableCell>
                        {pendencia.solicitante?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {pendencia.anexoNome ? (
                          <div className="flex items-center text-sm text-blue-600">
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-20" title={pendencia.anexoNome}>
                              {pendencia.anexoNome}
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(pendencia.createdAt)}
                      </TableCell>
                      <TableCell>
                        {canCancel && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelarPendencia(pendencia._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}