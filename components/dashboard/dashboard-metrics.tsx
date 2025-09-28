"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, DollarSign, CheckCircle, Clock, FileText, Users } from "lucide-react";
import { useState, useEffect } from "react";


interface DashboardData {
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
}

interface DashboardMetricsProps {
  dashboardData: DashboardData;
  openModal: (type: string, data?: any[]) => void;
  overdueItems?: any[];
}

interface ItemMetrics {
  total: number;
  overdue: number;
  onTime: number;
}

export function DashboardMetrics({
  dashboardData,
  openModal,
  overdueItems = [],
}: DashboardMetricsProps) {
  // Convex hooks
  const dashData: any = [];

  // Estados para as métricas de itens atrasados
  const [itemMetrics, setItemMetrics] = useState<{
    total: ItemMetrics;
    aprovacao: ItemMetrics;
    analises: ItemMetrics;
    orcamentos: ItemMetrics;
    execucao: ItemMetrics;
    pronto: ItemMetrics;
  }>({
    total: { total: 0, overdue: 0, onTime: 0 },
    aprovacao: { total: 0, overdue: 0, onTime: 0 },
    analises: { total: 0, overdue: 0, onTime: 0 },
    orcamentos: { total: 0, overdue: 0, onTime: 0 },
    execucao: { total: 0, overdue: 0, onTime: 0 },
    pronto: { total: 0, overdue: 0, onTime: 0 },
  });

  // Função para fazer parse de diferentes formatos de data
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Remove espaços extras
    const cleanDate = dateString.toString().trim();

    // Tenta diferentes formatos
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/mm/yyyy
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // dd-mm-yyyy
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-mm-dd
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // dd/mm/yy
    ];

    for (const format of formats) {
      const match = cleanDate.match(format);
      if (match) {
        if (format.source.includes("yyyy")) {
          // Formato com ano completo
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Formato com ano abreviado
          const [, day, month, year] = match;
          const fullYear =
            parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
          return new Date(fullYear, parseInt(month) - 1, parseInt(day));
        }
      }
    }

    // Se for uma data ISO (YYYY-MM-DD), usa diretamente
    if (cleanDate.includes("-") && cleanDate.length === 10) {
      const date = new Date(cleanDate);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Se for um número (data do Excel)
    if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
      const excelDate = Number(cleanDate);
      return new Date((excelDate - 25569) * 86400 * 1000);
    }

    return null;
  };

  // Função para verificar se um item está atrasado
  const isItemOverdue = (item: any): boolean => {
    let deadlineDate: Date | null = null;

    // Suporta múltiplos formatos/campos vindos do Convex e do processamento local
    if (item.dataRegistro) {
      // Campo salvo no Convex
      deadlineDate = new Date(item.dataRegistro);
    } else if (item.data_registro) {
      // Campo usado nos itens processados localmente
      deadlineDate = new Date(item.data_registro);
    } else if (item.rawData?.prazo) {
      deadlineDate = parseDate(item.rawData.prazo);
    } else if (item.raw_data?.prazo) {
      deadlineDate = parseDate(item.raw_data.prazo);
    } else if (item.prazo) {
      deadlineDate = parseDate(item.prazo);
    } else if (item.data) {
      deadlineDate = parseDate(item.data);
    }

    if (!deadlineDate || isNaN(deadlineDate.getTime())) {
      return false; // Se não tem data válida, considera no prazo
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    return deadlineDate < today;
  };

  // Função para calcular métricas de uma categoria
  const calculateMetrics = (items: any[]): ItemMetrics => {
    const total = items.length;
    const overdue = items.filter(isItemOverdue).length;
    const onTime = total - overdue;

    return { total, overdue, onTime };
  };

  useEffect(() => {
    if (dashData?.items) {
      const allItems = dashData.items;

      // Filtra itens por categoria
      const aprovacaoItems = allItems.filter((item: any) => {
        const status = item.status.toLowerCase();
        return (
          status.includes("aguardando") ||
          status.includes("pendente") ||
          status.includes("aprovação") ||
          status.includes("aprovacao")
        );
      });

      const analisesItems = allItems.filter((item: any) => {
        const status = item.status.toLowerCase();
        return (
          status.includes("análise") ||
          status.includes("analise") ||
          status.includes("revisão") ||
          status.includes("revisao")
        );
      });

      const orcamentosItems = allItems.filter((item: any) => {
        const status = item.status.toLowerCase();
        return (
          status.includes("orçamento") ||
          status.includes("orcamento") ||
          status.includes("cotação") ||
          status.includes("cotacao")
        );
      });

      const execucaoItems = allItems.filter((item: any) => {
        const status = item.status.toLowerCase();
        return (
          status.includes("execução") ||
          status.includes("execucao") ||
          status.includes("andamento") ||
          status.includes("progresso")
        );
      });

      const prontoItems = allItems.filter((item: any) => {
        const status = item.status.toLowerCase();
        return (
          status.includes("pronto") ||
          status.includes("concluído") ||
          status.includes("concluido") ||
          status.includes("finalizado") ||
          status.includes("entregue")
        );
      });

      // Calcula métricas para cada categoria
      setItemMetrics({
        total: calculateMetrics(allItems),
        aprovacao: calculateMetrics(aprovacaoItems),
        analises: calculateMetrics(analisesItems),
        orcamentos: calculateMetrics(orcamentosItems),
        execucao: calculateMetrics(execucaoItems),
        pronto: calculateMetrics(prontoItems),
      });
    }
  }, [dashData]); // Recarrega quando dashData muda


  // Função para calcular percentual seguro
  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // Função para calcular a média dos percentuais de todos os cards
  const calculateAveragePercentages = () => {
    const categories = [
      itemMetrics.aprovacao,
      itemMetrics.analises,
      itemMetrics.orcamentos,
      itemMetrics.execucao,
    ];
    const validCategories = categories.filter((cat) => cat.total > 0);

    if (validCategories.length === 0) {
      return { overdue: 0, onTime: 0 };
    }

    const overduePercentages = validCategories.map((cat) =>
      calculatePercentage(cat.overdue, cat.total)
    );
    const onTimePercentages = validCategories.map((cat) =>
      calculatePercentage(cat.onTime, cat.total)
    );

    const avgOverdue = Math.round(
      overduePercentages.reduce((sum, p) => sum + p, 0) / validCategories.length
    );
    const avgOnTime = Math.round(
      onTimePercentages.reduce((sum, p) => sum + p, 0) / validCategories.length
    );

    return { overdue: avgOverdue, onTime: avgOnTime };
  };

  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full">
      {/* Cards em grid 3x2 */}
        {/* Total Itens */}
        <Card
          onClick={() => openModal("total")}
          className="bg-white border-gray-200 cursor-pointer hover:bg-gray-50 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                Total Itens
              </span>
              <BarChart3 className="h-3 w-3 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-gray-900 text-center">
              {dashboardData.totalItens}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs mt-1">
              <span className="text-red-500">
                {calculateAveragePercentages().overdue}%
              </span>
              <span className="text-green-500">
                {calculateAveragePercentages().onTime}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Aguardando Aprovação */}
        <Card
          onClick={() => openModal("aprovacao")}
          className="bg-white border-gray-200 cursor-pointer hover:bg-gray-50 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                Aguardando Aprovação
              </span>
              <Clock className="h-3 w-3 text-gray-500" />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1 text-center">
              {dashboardData.aguardandoAprovacao}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-500">
                {calculatePercentage(
                  itemMetrics.aprovacao.overdue,
                  itemMetrics.aprovacao.total
                )}
                %
              </span>
              <span className="text-green-500">
                {calculatePercentage(
                  itemMetrics.aprovacao.onTime,
                  itemMetrics.aprovacao.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Análises */}
        <Card
          onClick={() => openModal("analises")}
          className="bg-white border-gray-200 cursor-pointer hover:bg-gray-50 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                Análises
              </span>
              <FileText className="h-3 w-3 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1 text-center">
              {dashboardData.analises}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-500">
                {calculatePercentage(
                  itemMetrics.analises.overdue,
                  itemMetrics.analises.total
                )}
                %
              </span>
              <span className="text-green-500">
                {calculatePercentage(
                  itemMetrics.analises.onTime,
                  itemMetrics.analises.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Orçamentos */}
        <Card
          onClick={() => openModal("orcamentos")}
          className="bg-white border-gray-200 cursor-pointer hover:bg-gray-50 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                Orçamentos
              </span>
              <DollarSign className="h-3 w-3 text-green-500" />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1 text-center">
              {dashboardData.orcamentos}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-500">
                {calculatePercentage(
                  itemMetrics.orcamentos.overdue,
                  itemMetrics.orcamentos.total
                )}
                %
              </span>
              <span className="text-green-500">
                {calculatePercentage(
                  itemMetrics.orcamentos.onTime,
                  itemMetrics.orcamentos.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Em Execução */}
        <Card
          onClick={() => openModal("execucao")}
          className="bg-white border-gray-200 cursor-pointer hover:bg-gray-50 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                Em Execução
              </span>
              <Users className="h-3 w-3 text-orange-500" />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1 text-center">
              {dashboardData.emExecucao}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-500">
                {calculatePercentage(
                  itemMetrics.execucao.overdue,
                  itemMetrics.execucao.total
                )}
                %
              </span>
              <span className="text-green-500">
                {calculatePercentage(
                  itemMetrics.execucao.onTime,
                  itemMetrics.execucao.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pronto */}
        <Card
          onClick={() => openModal("pronto")}
          className="bg-white border-gray-200 cursor-pointer hover:bg-gray-50 transition"
        >
          <CardContent className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">Pronto</span>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1 text-center">
              {dashboardData.pronto}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-red-500">
                {calculatePercentage(
                  itemMetrics.pronto.overdue,
                  itemMetrics.pronto.total
                )}
                %
              </span>
              <span className="text-green-500">
                {calculatePercentage(
                  itemMetrics.pronto.onTime,
                  itemMetrics.pronto.total
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
