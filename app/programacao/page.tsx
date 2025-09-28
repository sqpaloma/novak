"use client";

import { useMemo, useState, useEffect } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsavelFilter } from "@/components/dashboard/responsavel-filter";
import { ProgramacaoFilters } from "@/components/programacao/programacao-filters";


export default function ProgramacaoPage() {
  const dashboardData: any = [];
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(
    null
  );
  const [statusFilter,   setStatusFilter] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("programacao:statusFilter") || "execucao"
      : "execucao"
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [databaseItems, setDatabaseItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

 
  // Sanitiza filtro salvo para os permitidos
  useEffect(() => {
    const allowed = new Set(["execucao", "atrasados"]);
    if (!allowed.has(statusFilter)) setStatusFilter("execucao");
    if (statusFilter === "execução") setStatusFilter("execucao");
  }, []);

  // Carrega itens do banco de dados (mesma fonte do ActivityPlanner)
  useEffect(() => {
    const loadDb = async () => {
      setIsLoading(true);
      try {
        const items = (dashboardData as any)?.items || [];
        const dbItems = items
          .filter((item: any) => item.dataRegistro)
          .map((item: any) => ({
            id: item.os,
            os: item.os,
            titulo: item.titulo || `Item ${item.os}`,
            cliente: item.cliente || "Cliente não informado",
            responsavel: item.responsavel || "Não informado",
            status: item.status,
            prazo: item.dataRegistro || "",
            data: item.dataRegistro || "",
            rawData: item.rawData || [],
          }));
        setDatabaseItems(dbItems);
      } catch (e) {
        // noop
      } finally {
        setIsLoading(false);
      }
    };
    loadDb();
  }, [dashboardData]);

  // Persistir preferências
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedConsultant)
      localStorage.setItem(
        "programacao:selectedConsultant",
        selectedConsultant
      );
  }, [selectedConsultant]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (statusFilter)
      localStorage.setItem("programacao:statusFilter", statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedConsultant || typeof window === "undefined") return;
    const key = `programacao:dept:${selectedConsultant.toLowerCase()}`;
    if (selectedDepartment) localStorage.setItem(key, selectedDepartment);
    else localStorage.removeItem(key);
  }, [selectedDepartment, selectedConsultant]);


  // Itens do consultor selecionado
  const consultantItems = useMemo(() => {
    if (!selectedConsultant) return [] as any[];
    const consultantLower = selectedConsultant.toLowerCase();
    return databaseItems.filter((item: any) => {
      const respLower = (item.responsavel || "").toLowerCase();
      return respLower.includes(consultantLower);
    });
  }, [databaseItems, selectedConsultant]);

  // Departamentos do consultor e time filtrado
  const departments = useMemo(() => {
    return [];
  }, [selectedConsultant]);



  // KPIs (somente análise, execução, atrasados)
  const kpis = useMemo(() => {
    let analise = 0;
    let execucao = 0;
    let atrasados = 0;
    for (const it of databaseItems) {
      if (it.status === "analise") analise++;
      if (it.status === "execucao") execucao++;
      if (it.status === "atrasados") atrasados++;
    }
    return { analise, execucao, atrasados };
  }, [databaseItems]);

  // Aplicar filtro ativo (analise | execucao | atrasados) e filtro de data
  const visibleItems = useMemo(() => {
    let filtered = databaseItems;

    // Aplicar filtro de status
    if (statusFilter === "analise")
      filtered = filtered.filter((i) => i.status === "analise");
    else if (statusFilter === "execucao")
      filtered = filtered.filter((i) => i.status === "execucao");
    else if (statusFilter === "atrasados")
      filtered = filtered.filter((i) => {
        return i.status === "atrasados";
      });

    // Aplicar filtro de data
    if (dateFilter === "today") {
      filtered = filtered;
    } else if (dateFilter === "week") {
      filtered = filtered;
    }

    return filtered;
  }, [databaseItems, statusFilter, dateFilter]);



  


  // Items for today and this week (for counts)
  const todayItems = useMemo(() => databaseItems, [databaseItems]);
  const thisWeekItems = useMemo(() => databaseItems, [databaseItems]);

  const columnCount = Math.max(1, 1);



  return (
    
      <ResponsiveLayout fullWidth={true}>
        <div className="mt-6 sm:mt-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Programação</h1>
          {false && (
            <ResponsavelFilter
              onFilterChange={(r) => setSelectedConsultant(r)}
              processedItems={databaseItems}
            />
          )}
        </div>

        <div className="mt-4">
          <Card className="bg-white h-[800px] flex flex-col w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-gray-800">
                  {selectedConsultant
                    ? ""
                    : false
                      ? "Selecione um consultor para ver a programação"
                      : "Carregando sua programação..."}
                </CardTitle>
              </div>
              {selectedConsultant && (
                <div className="mt-3">
                  <ProgramacaoFilters
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    kpis={kpis}
                    totalItems={databaseItems.length}
                    showDepartmentFilter={false}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                    todayCount={todayItems.length}
                    weekCount={thisWeekItems.length}
                    departments={[]}
                    selectedDepartment={null}
                    onDepartmentChange={() => {}}
                  /> 
                </div>
              )}
            </CardHeader>
          </Card>
        </div>
      </ResponsiveLayout>
  );
}
