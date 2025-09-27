"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Download } from "lucide-react";
import { CotacaoDetailModal } from "./cotacao-detail-modal";
import { CotacaoResponseModal } from "./cotacao-response-modal";
import { SankhyaResponseModal } from "./sankhya-response-modal";
import { CotacaoApprovalModal } from "./cotacao-approval-modal";
import { CotacaoEditModal } from "./cotacao-edit-modal";
import { Id } from "@/convex/_generated/dataModel";
import { SortableHeader, FilterableHeader } from "./table-headers";
import { CotacaoCard } from "./cotacao-card";
import { CotacaoRow } from "./cotacao-row";
import {
  sortCotacoes,
  filterCotacoes,
  getStatusOptions,
  getResponsavelOptions,
} from "./table-utils";
import { useCotacoesTable } from "./use-cotacoes-table";

interface FiltrosState {
  busca: string;
  status: string;
  incluirHistorico: boolean;
  responsavel: string;
  dataInicio?: number;
  dataFim?: number;
}

interface CotacoesTableProps {
  filtros: FiltrosState;
  userRole: string;
  userId?: Id<"users">;
  isFornecedor?: boolean;
}

export function CotacoesTable({ filtros, userRole, userId, isFornecedor = false }: CotacoesTableProps) {
  const {
    // Modal states
    selectedCotacao,
    setSelectedCotacao,
    respondingCotacao,
    setRespondingCotacao,
    respondingPendencia,
    setRespondingPendencia,
    approvingCotacao,
    setApprovingCotacao,
    editingCotacao,
    setEditingCotacao,

    // Sorting and filtering states
    sortConfig,
    statusFilter,
    setStatusFilter,
    responsavelFilter,
    setResponsavelFilter,

    // Handlers
    handleSort,
    handleCardAction,
    handleExportarHistorico,
    getAvailableActions,
    isPendente,

    // Data
    cotacoes,
    isLoading,
  } = useCotacoesTable({ filtros, userRole, userId, isFornecedor });

  // Filter and separate cotações
  const cotacoesPendentes = cotacoes?.filter(c => {
    const isSolicitante = c.solicitanteId === userId;
    const isCompras = ["admin", "compras", "gerente"].includes(userRole);

    if (c.tipo !== "cadastro") {
      if (isCompras && !isSolicitante) {
        return ["novo", "em_cotacao"].includes(c.status);
      }
      return !["comprada", "cancelada"].includes(c.status);
    }

    if (isCompras && !isSolicitante) {
      return ["pendente", "em_andamento"].includes(c.status);
    }

    if (isSolicitante) {
      return !["concluida", "rejeitada"].includes(c.status);
    }

    return false;
  }) || [];

  const cotacoesHistorico = cotacoes?.filter(c => {
    if (c.tipo !== "cadastro") {
      return ["comprada", "cancelada"].includes(c.status);
    }
    return ["concluida", "rejeitada"].includes(c.status);
  }) || [];

  // Apply sorting and filtering
  const sortedAndFilteredPendentes = sortCotacoes(filterCotacoes(cotacoesPendentes, statusFilter, responsavelFilter), sortConfig);
  const sortedAndFilteredHistorico = sortCotacoes(filterCotacoes(cotacoesHistorico, statusFilter, responsavelFilter), sortConfig);

  if (isLoading) {
    return (
      <Card className="bg-blue-600/70 border-white/30">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto"></div>
          <p className="mt-2 text-white">Carregando cotações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Cotações Pendentes */}
        {sortedAndFilteredPendentes.length > 0 && (
          <Card className="bg-white/15 border-white/30">
            <CardHeader className="p-4 border-b border-white/30">
              <CardTitle className="flex items-center gap-2 text-white font-semibold">
                <Clock className="h-5 w-5 text-white" />
                Pendentes ({sortedAndFilteredPendentes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Layout Desktop - Tabela */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-[800px]">
                    <TableHeader>
                      <TableRow className="hover:!bg-transparent border-white/30">
                        <SortableHeader column="tipo" className="w-20 px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Tipo</SortableHeader>
                        <SortableHeader column="numero" className="w-24 px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Número</SortableHeader>
                        <SortableHeader column="identificacao" className="min-w-[200px] px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Identificação</SortableHeader>
                        <FilterableHeader
                          column="status"
                          className="w-32 px-2 sm:px-4"
                          options={getStatusOptions(cotacoesPendentes)}
                          currentValue={statusFilter}
                          onValueChange={setStatusFilter}
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          Status
                        </FilterableHeader>
                        <FilterableHeader
                          column="responsaveis"
                          className="min-w-[180px] px-2 sm:px-4"
                          options={getResponsavelOptions(cotacoesPendentes)}
                          currentValue={responsavelFilter}
                          onValueChange={setResponsavelFilter}
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          Responsáveis
                        </FilterableHeader>
                        <SortableHeader column="itens" className="w-20 px-2 sm:px-4" textAlign="center" sortConfig={sortConfig} onSort={handleSort}>Itens</SortableHeader>
                        <SortableHeader column="valor" className="w-32 px-2 sm:px-4" textAlign="right" sortConfig={sortConfig} onSort={handleSort}>Valor</SortableHeader>
                        <SortableHeader column="data" className="w-28 px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Data</SortableHeader>
                        <SortableHeader column="prazo" className="w-20 px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Prazo</SortableHeader>
                        <TableHead className="text-white w-20 px-2 sm:px-4">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAndFilteredPendentes.map((cotacao) => (
                        <CotacaoRow
                          key={cotacao._id}
                          cotacao={cotacao}
                          isPendente={isPendente(cotacao)}
                          availableActions={getAvailableActions(cotacao)}
                          onRowAction={handleCardAction}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Layout Mobile - Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {sortedAndFilteredPendentes.map((cotacao) => (
                  <CotacaoCard
                    key={cotacao._id}
                    cotacao={cotacao}
                    isPendente={isPendente(cotacao)}
                    availableActions={getAvailableActions(cotacao)}
                    onCardAction={handleCardAction}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico */}
        {(filtros.incluirHistorico && sortedAndFilteredHistorico.length > 0) && (
          <div className="bg-blue-600/70 border-white/30">
            <div className="p-4 border-b border-white/30">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-white font-semibold">
                  Histórico ({sortedAndFilteredHistorico.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExportarHistorico(cotacoesHistorico)}
                  className="text-blue-600 hover:text-blue-600/70 hover:bg-blue-600/70"
                  title="Exportar histórico para Excel"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Layout Desktop - Tabela */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[800px]">
                  <TableHeader>
                    <TableRow className="hover:!bg-transparent border-white/30">
                      <SortableHeader column="tipo" className="w-20 px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Tipo</SortableHeader>
                      <SortableHeader column="numero" className="w-24 px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Número</SortableHeader>
                      <SortableHeader column="identificacao" className="min-w-[200px] px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Identificação</SortableHeader>
                      <FilterableHeader
                        column="status"
                        className="w-32 px-2 sm:px-4"
                        options={getStatusOptions(cotacoesHistorico)}
                        currentValue={statusFilter}
                        onValueChange={setStatusFilter}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      >
                        Status
                      </FilterableHeader>
                      <FilterableHeader
                        column="responsaveis"
                        className="min-w-[180px] px-2 sm:px-4"
                        options={getResponsavelOptions(cotacoesHistorico)}
                        currentValue={responsavelFilter}
                        onValueChange={setResponsavelFilter}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      >
                        Responsáveis
                      </FilterableHeader>
                      <SortableHeader column="itens" className="w-20 px-2 sm:px-4" textAlign="center" sortConfig={sortConfig} onSort={handleSort}>Itens</SortableHeader>
                      <SortableHeader column="valor" className="w-32 px-2 sm:px-4" textAlign="right" sortConfig={sortConfig} onSort={handleSort}>Valor</SortableHeader>
                      <SortableHeader column="data" className="w-28 px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Data</SortableHeader>
                      <SortableHeader column="prazo" className="w-20 px-2 sm:px-4" sortConfig={sortConfig} onSort={handleSort}>Prazo</SortableHeader>
                      <TableHead className="text-white w-20 px-2 sm:px-4">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAndFilteredHistorico.map((cotacao) => (
                      <CotacaoRow
                        key={cotacao._id}
                        cotacao={cotacao}
                        isPendente={false}
                        availableActions={getAvailableActions(cotacao)}
                        onRowAction={handleCardAction}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Layout Mobile - Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {sortedAndFilteredHistorico.map((cotacao) => (
                <CotacaoCard
                  key={cotacao._id}
                  cotacao={cotacao}
                  isPendente={false}
                  availableActions={getAvailableActions(cotacao)}
                  onCardAction={handleCardAction}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {sortedAndFilteredPendentes.length === 0 && sortedAndFilteredHistorico.length === 0 && (
          <Card className="bg-blue-600/70 border-white/30">
            <CardContent className="p-8 text-center">
              <p className="text-white">
                {filtros.busca || (filtros.status && filtros.status !== "all") || (filtros.responsavel && filtros.responsavel !== "all") || statusFilter !== 'all' || responsavelFilter !== 'all'
                  ? "Nenhuma cotação encontrada com os filtros aplicados."
                  : "Nenhuma cotação encontrada."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      {selectedCotacao && (
        <CotacaoDetailModal
          cotacaoId={selectedCotacao}
          isOpen={!!selectedCotacao}
          onClose={() => setSelectedCotacao(null)}
          userRole={userRole}
          userId={userId}
        />
      )}

      {respondingCotacao && (
        <CotacaoResponseModal
          cotacaoId={respondingCotacao}
          isOpen={!!respondingCotacao}
          onClose={() => setRespondingCotacao(null)}
          userRole={userRole}
          userId={userId}
        />
      )}

      {respondingPendencia && (
        <SankhyaResponseModal
          pendenciaId={respondingPendencia}
          isOpen={!!respondingPendencia}
          onClose={() => setRespondingPendencia(null)}
          userId={userId}
          pendenciaData={(() => {
            const pendencia = cotacoes?.find(c => c._id === respondingPendencia && c.tipo === "cadastro");
            if (!pendencia || pendencia.tipo !== "cadastro") return undefined;
            return {
              numeroSequencial: pendencia.numeroSequencial,
              codigo: pendencia.codigo,
              descricao: pendencia.descricao,
              marca: pendencia.marca,
              solicitante: pendencia.solicitante ? { name: pendencia.solicitante.name } : undefined
            };
          })()}
        />
      )}

      {approvingCotacao && (
        <CotacaoApprovalModal
          cotacaoId={approvingCotacao}
          isOpen={!!approvingCotacao}
          onClose={() => setApprovingCotacao(null)}
          userRole={userRole}
          userId={userId}
        />
      )}

      {editingCotacao && (
        <CotacaoEditModal
          cotacaoId={editingCotacao}
          isOpen={!!editingCotacao}
          onClose={() => setEditingCotacao(null)}
          userRole={userRole}
          userId={userId}
          onSave={() => {
            setTimeout(() => {
              setEditingCotacao(null);
            }, 500);
          }}
        />
      )}
    </>
  );
}