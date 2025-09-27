"use client";

import React, { useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package, Search, Filter, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CotacoesTable } from "@/components/cotacoes/cotacoes-table";
import { CotacaoForm } from "@/components/cotacoes/cotacao-form";
import { CadastroPecaForm } from "@/components/cotacoes/cadastro-peca-form";
import { CompraDirectaForm } from "@/components/cotacoes/compra-direta-form";
import { JaCompreiForm } from "@/components/cotacoes/ja-comprei-form";

export default function CotacoesPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showCadastroForm, setShowCadastroForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSubtarefas, setShowSubtarefas] = useState(false);
  const [showCompraDirectaForm, setShowCompraDirectaForm] = useState(false);
  const [showJaCompreiForm, setShowJaCompreiForm] = useState(false);
  const [filtros, setFiltros] = useState<{
    busca: string;
    status: string;
    incluirHistorico: boolean;
    responsavel: string;
    dataInicio?: number;
    dataFim?: number;
  }>({
    busca: "",
    status: "all",
    incluirHistorico: false,
    responsavel: "all",
    dataInicio: undefined,
    dataFim: undefined,
  });

  // Verificar se o usuário pode criar cotações (vendedores)
  const podecriarCotacao = ["consultor", "vendedor", "admin", "gerente","compras","qualidade e pco"].includes(
    user?.role || ""
  );

  // Verificar se é da equipe de compras
  const isCompras = ["admin", "compras", "gerente"].includes(user?.role || "");

  // Verificar se o usuário tem acesso à página
  const temAcesso = user && [
    "admin",
    "consultor",
    "vendedor",
    "gerente",
    "compras",
    "qualidade e pco",
    "fornecedor"
  ].includes(user.role || "");

  if (!temAcesso) {
    return (
      <ResponsiveLayout
        title="Acesso Restrito"
        subtitle=""
        fullWidth={true}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Acesso Negado
            </h2>
            <p className="text-white mb-6">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  // Verificar se é fornecedor - eles só veem cotações específicas para eles
  const isFornecedor = user?.role === "fornecedor";

  return (
    <ResponsiveLayout
      title="Cotação de Peças"
      subtitle=""
      fullWidth={true}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Header personalizado com actions - oculto para fornecedores */}
        {!isFornecedor && (
          <div className="flex flex-col gap-4">
            {/* Botões de ação */}
            <div className="flex flex-row gap-3 justify-end">
              {/* Botão para cadastrar peça - não mostrar para equipe de compras */}
              {!["compras"].includes(user?.role || "") && (
                <Button
                  onClick={() => setShowCadastroForm(true)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:text-white hover:bg-blue-500 font-semibold flex-1 sm:flex-none sm:w-auto"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Cadastro de Peça
                </Button>
              )}

              {/* Dropdown de Subtarefas - não mostrar para equipe de compras */}
              {podecriarCotacao && !["compras"].includes(user?.role || "") && (
                <div className="relative">
                  <Button
                    onClick={() => setShowSubtarefas(!showSubtarefas)}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:text-white hover:bg-blue-500 font-semibold flex-1 sm:flex-none sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Compra Direta
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showSubtarefas ? 'rotate-180' : ''}`} />
                  </Button>

                  {showSubtarefas && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSubtarefas(false)} />
                      <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg border border-white/30 z-50 bg-blue-600">
                      
                         

                          <button
                            onClick={() => {
                              setShowCompraDirectaForm(true);
                              setShowSubtarefas(false);
                            }}
                            className="w-full px-4 py-3 text-left flex items-center text-white"
                          >
                            <div>
                              <div className="text-sm font-medium text-white">Compra direta</div>
                              <div className="text-xs text-white">Registrar informações das peças para compra direta</div>
                              <div className="px-4 py-2 text-sm border-b text-white">
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              setShowJaCompreiForm(true);
                              setShowSubtarefas(false);
                            }}
                            className="w-full px-4 py-3 text-left flex items-center  text-white"
                          >
                            
                            <div>
                              <div className="text-sm font-medium text-white">Já comprei</div>
                              <div className="text-xs text-white">Registrar fornecedor, nº orçamento, valor, print (opcional)</div>
                              <div className="px-4 py-2 text-sm border-b text-white"></div>
                            </div>
                          </button>
                        </div>
                      
                    </>
                  )}
                </div>
              )}

              {/* Botão para criar nova cotação */}
              {podecriarCotacao && (
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:text-white hover:bg-blue-500 font-semibold flex-1 sm:flex-none sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cotação
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Busca e filtros simplificados */}
        <div className="bg-blue-600/70 rounded-lg p-3 sm:p-4 border border-white/30">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cotações..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10 bg-white border-blue-300 text-white placeholder-gray-500"
              />
            </div>

            {/* Botões de filtro */}
            <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-blue-600 text-blue-600 hover:text-white hover:bg-blue-500 w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Ocultar Filtros" : "Filtros"}
              </Button>

              {(filtros.status !== "all" || filtros.incluirHistorico || (filtros.responsavel && filtros.responsavel !== "all") || filtros.dataInicio || filtros.dataFim) && (
                <Button
                  variant="outline"
                  onClick={() => setFiltros(prev => ({
                    ...prev,
                    status: "all",
                    incluirHistorico: false,
                    responsavel: "all",
                   
                  }))}
                  className="text-red-600 hover:text-white hover:bg-red-500 border-red-300 w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros Expandidos - Layout Mobile-First */}
        {showFilters && (
          <div className="bg-blue-600/70 rounded-lg p-3 sm:p-4 border border-white/30">
            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Status</label>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-blue-600/70 border-white/30 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="novo">Novo</option>
                  <option value="em_cotacao">Em Cotação</option>
                  <option value="respondida">Respondida</option>
                  <option value="aprovada_para_compra">Aprovada para Compra</option>
                  <option value="comprada">Comprada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-blue-600/70 border-white/30 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="novo">Novo</option>
                  <option value="em_cotacao">Em Cotação</option>
                  <option value="respondida">Respondida</option>
                  <option value="aprovada_para_compra">Aprovada para Compra</option>
                  <option value="comprada">Comprada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Responsável - ajustado para diferentes perfis */}
              {(isCompras && !isFornecedor) && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Responsável</label>
                  <select
                    value={filtros.responsavel}
                    onChange={(e) => setFiltros(prev => ({ ...prev, responsavel: e.target.value }))}
                    className="w-full bg-blue-600/70 border-white/30 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="solicitante">Minhas solicitações</option>
                    <option value="comprador">Minhas compras</option>
                  </select>
                </div>
              )}

              {/* Para outros usuários (exceto fornecedores) - mostrar apenas filtro básico */}
              {(!isCompras && !isFornecedor && user?.role !== "admin") && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Minhas</label>
                  <select
                    value={filtros.responsavel}
                    onChange={(e) => setFiltros(prev => ({ ...prev, responsavel: e.target.value }))}
                    className="w-full bg-blue-600/70 border-white/30 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">Todas</option>
                    <option value="solicitante">Minhas solicitações</option>
                  </select>
                </div>
              )}

              {/* Switch para incluir histórico */}
              <div className="flex items-start space-x-3 bg-blue-600/70 p-3 rounded-md">
                <input
                  type="checkbox"
                  id="incluir-historico"
                  checked={filtros.incluirHistorico}
                  onChange={(e) => setFiltros(prev => ({ ...prev, incluirHistorico: e.target.checked }))}
                    className="rounded border-white/30  bg-blue-600/70 text-white focus:ring-blue-500 mt-1"
                />
                <label htmlFor="incluir-historico" className="text-white text-sm leading-relaxed">
                  Incluir cotações finalizadas (Compradas/Canceladas)
                </label>
              </div>
            </div>
        )}

        {/* Tabela de Cotações */}
        <CotacoesTable
          filtros={filtros}
          userRole={user?.role || ""}
          userId={user?.userId}
          isFornecedor={isFornecedor}
        />

        {/* Modal de Nova Cotação */}
        {showForm && (
          <CotacaoForm
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            solicitanteId={user?.userId}
          />
        )}

        {/* Modal de Cadastro de Peça */}
        {showCadastroForm && (
          <CadastroPecaForm
            isOpen={showCadastroForm}
            onClose={() => setShowCadastroForm(false)}
          />
        )}

        {/* Modal de Compra Direta */}
        {showCompraDirectaForm && (
          <CompraDirectaForm
            isOpen={showCompraDirectaForm}
            onClose={() => setShowCompraDirectaForm(false)}
            solicitanteId={user?.userId}
          />
        )}

        {/* Modal de Já Comprei */}
        {showJaCompreiForm && (
          <JaCompreiForm
            isOpen={showJaCompreiForm}
            onClose={() => setShowJaCompreiForm(false)}
            solicitanteId={user?.userId}
          />
        )}

      </div>
    </ResponsiveLayout>
  );
} 