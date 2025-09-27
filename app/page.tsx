"use client";

import React, { useState, useEffect, useRef, useDeferredValue } from "react";
import dynamic from "next/dynamic";
import { AdminProtection } from "@/components/admin-protection";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { parseBRDate } from "@/lib/date-utils";
import { buildStatusGroups } from "@/lib/status-utils";
import { useFilteredItems } from "@/hooks/use-filtered-items";
import { useUserPermissions } from "@/hooks/use-user-permissions";

// Constantes
const LOADING_SKELETON = "animate-pulse rounded-lg bg-neutral-900/40";
// Componentes dinâmicos
const DashboardCalendar = dynamic(
  () => import("@/components/dashboard/dashboard-calendar").then(m => m.DashboardCalendar),
  {
    ssr: false,
    loading: () => <div className={`h-[520px] ${LOADING_SKELETON}`} />,
  }
);

const DistributionPanel = dynamic(
  () => import("@/components/dashboard/distribution-panel").then(m => m.DistributionPanel),
  {
    ssr: false,
    loading: () => <div className={`h-[256px] ${LOADING_SKELETON}`} />,
  }
);

const ActivityPlanner = dynamic(
  () => import("@/components/dashboard/activity-planner").then(m => m.ActivityPlanner),
  {
    ssr: false,
    loading: () => <div className={`h-[320px] ${LOADING_SKELETON}`} />,
  }
);

const DashboardModal = dynamic(
  () => import("@/components/dashboard/dashboard-modal").then(m => m.DashboardModal),
  {
    ssr: false,
    loading: () => <div className={`h-[400px] ${LOADING_SKELETON}`} />,
  }
);

const ResponsavelFilter = dynamic(
  () => import("@/components/dashboard/responsavel-filter").then(m => m.ResponsavelFilter),
  { ssr: false }
);

const SearchFilter = dynamic(
  () => import("@/components/dashboard/search-filter").then(m => m.SearchFilter),
  { ssr: false }
);

const DepartamentoInfo = dynamic(
  () => import("@/components/dashboard/departamento-info").then(m => m.DepartamentoInfo),
  {
    ssr: false,
    loading: () => <div className={`h-[520px] ${LOADING_SKELETON}`} />,
  }
);

function ConsultingDashboard() {
  const {  processedItems, loadSavedData } = useDashboardData();
  const { canSeeAllData, canSeeResponsavelFilter, isSpecialUser } = useUserPermissions();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();


  // Estados para modais
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [calendarModalData, setCalendarModalData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Estados para filtro por responsável
  const [filteredByResponsavel, setFilteredByResponsavel] = useState<
    string | null
  >(null);


  // Só force "próprio" quando já existir usuário e permissões carregadas
  const authReady = user !== undefined && user !== null && typeof user?.name === "string" && user.name.trim() !== "";
  const shouldForceOwn = isAdmin ? false : (authReady ? !canSeeAllData : false);

  const filteredItems = useFilteredItems({
    processedItems: processedItems as any,
    filteredByResponsavel,
    shouldForceOwn,
    user: authReady ? user : null, // evite filtrar por nome vazio
    isSpecialManager: isSpecialUser,
    isAdmin,
  });

  const deferredFilteredItems = useDeferredValue(filteredItems);
  const itemIdToDueDate = React.useMemo(() => {
    const map = new Map<string, Date | null>();
    deferredFilteredItems.forEach((item) => {
      let itemDate: Date | null = null;
      if (item.data_registro && item.data_registro.includes("-")) {
        const d = new Date(item.data_registro);
        itemDate = isNaN(d.getTime()) ? null : d;
      } else if (item.prazo) {
        itemDate = parseBRDate(item.prazo);
      } else if (item.data) {
        itemDate = parseBRDate(item.data);
      }
      if (item.id) {
        map.set(item.id, itemDate);
      }
    });
    return map;
  }, [deferredFilteredItems]);

  const groupedFiltered = React.useMemo(
    () => buildStatusGroups(deferredFilteredItems),
    [deferredFilteredItems]
  );
  const groupedAll = React.useMemo(
    () => buildStatusGroups((processedItems || []) as any),
    [processedItems]
  );

  const filteredDashboardData = React.useMemo(() => ({
    totalItens: groupedFiltered.total.length,
    aguardandoAprovacao: groupedFiltered.aprovacao.length,
    analises: groupedFiltered.analises.length,
    orcamentos: groupedFiltered.orcamentos.length,
    emExecucao: groupedFiltered.execucao.length,
    pronto: groupedFiltered.pronto.length,
  }), [groupedFiltered]);

  const overdueItems = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return deferredFilteredItems.filter((item) => {
      if (!item.id) return false;
      const itemDate = itemIdToDueDate.get(item.id) ?? null;
      return itemDate && itemDate < today;
    });
  }, [deferredFilteredItems, itemIdToDueDate]);

  const notifiedOverdueRef = useRef<Set<string>>(new Set());
  const notifiedApprovalRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    deferredFilteredItems.forEach((item) => {
      if (!item.id) return;
      
      const date = itemIdToDueDate.get(item.id) ?? null;

      if (date && date < today && !notifiedOverdueRef.current.has(item.id)) {
        console.log(`Item ${item.os} atrasado: ${item.titulo || "Item"} do cliente ${item.cliente}`);
        notifiedOverdueRef.current.add(item.id);
      } else if (date && date >= today && date <= tomorrow && !notifiedOverdueRef.current.has(item.id)) {
        console.log(`Prazo próximo: ${item.os} - ${item.titulo || "Item"} vence em breve`);
        notifiedOverdueRef.current.add(item.id);
      }

      const status = (item.status || "").toLowerCase();
      const isWaitingApproval = status.includes("aguardando") || status.includes("pendente") ||
                                status.includes("aprovação") || status.includes("aprovacao");

      if (isWaitingApproval && !notifiedApprovalRef.current.has(item.id)) {
        console.log(`Aprovação pendente: ${item.os} - ${item.titulo || "Item"} aguarda aprovação`);
        notifiedApprovalRef.current.add(item.id);
      }
    });
  }, [deferredFilteredItems, itemIdToDueDate]);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  const handleResponsavelFilterChange = (responsavel: string | null) => {
    setFilteredByResponsavel(responsavel);
  };

  const handleItemSelect = (item: any) => {
    // Abrir modal com detalhes do item selecionado
    setActiveModal("item-details");
    setModalData([item]);
  };

  const handleCalendarDateClick = (date: string, items: any[]) => {
    setSelectedDate(date);
    setCalendarModalData(items);
    setActiveModal("calendar");
  };

  const openModal = async (modalType: string, data?: any[]) => {
    setActiveModal(modalType);

    if (data) {
      setModalData(data);
      return;
    }

    const groups = shouldForceOwn || filteredByResponsavel ? groupedFiltered : groupedAll;
    const modalTypeMap: Record<string, any[]> = {
      total: groups.total,
      aprovacao: groups.aprovacao,
      analises: groups.analises,
      orcamentos: groups.orcamentos,
      execucao: groups.execucao,
      pronto: groups.pronto,
    };

    setModalData(modalTypeMap[modalType] || []);
  };

  // canSeeResponsavelFilter já vem do hook useUserPermissions

  return (
    <ResponsiveLayout fullWidth={true}>
      <div className="mt-6 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-bold text-white">
          Seja bem-vindo(a),<br className="sm:hidden" /> {user?.name || "Usuário"}!
        </h1>
        <div className="sm:mt-0 mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <SearchFilter
            onItemSelect={handleItemSelect}
            processedItems={processedItems}
            className="w-full sm:w-80"
          />
          {canSeeResponsavelFilter && (
            <ResponsavelFilter
              onFilterChange={handleResponsavelFilterChange}
              processedItems={processedItems}
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="block lg:hidden md:hidden space-y-2">
          <div className="space-y-4 mt-4">
            <DashboardMetrics
              dashboardData={filteredDashboardData}
              openModal={openModal}
              overdueItems={overdueItems}
            />
            <div className="h-[250px]">
              <DistributionPanel dashboardData={filteredDashboardData} />
            </div>
          </div>
          <DepartamentoInfo
            processedItems={deferredFilteredItems}
            filteredByResponsavel={filteredByResponsavel}
          />
          <DashboardCalendar
            processedItems={deferredFilteredItems as any}
            onDateClick={handleCalendarDateClick}
            filteredByResponsavel={filteredByResponsavel}
          />
        </div>

        <div className="hidden md:grid xl:hidden grid-cols-2 gap-2">
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <DashboardMetrics
              dashboardData={filteredDashboardData}
              openModal={openModal}
              overdueItems={overdueItems}
            />
            <div className="h-[250px]">
              <DistributionPanel dashboardData={filteredDashboardData} />
            </div>
          </div>
          <DepartamentoInfo
            processedItems={deferredFilteredItems}
            filteredByResponsavel={filteredByResponsavel}
          />
          <DashboardCalendar
            processedItems={deferredFilteredItems as any}
            onDateClick={handleCalendarDateClick}
            filteredByResponsavel={filteredByResponsavel}
          />
        </div>

        <div className="hidden xl:grid grid-cols-6 xl:grid-cols-8 gap-2">
          <div className="space-y-2 col-span-2 xl:col-span-3">
            <div className="flex h-[520px] flex-col">
              <div className="h-[198px]">
                <DashboardMetrics
                  dashboardData={filteredDashboardData}
                  openModal={openModal}
                  overdueItems={overdueItems}
                />
              </div>
              <div className="mt-2 flex-1">
                <DistributionPanel dashboardData={filteredDashboardData} />
              </div>
            </div>
          </div>
          <div className="col-span-1 xl:col-span-2">
            <DepartamentoInfo
              processedItems={deferredFilteredItems}
              filteredByResponsavel={filteredByResponsavel}
              className="h-[520px]"
            />
          </div>
          <div className="col-span-3 xl:col-span-3 xl:col-start-6">
            <DashboardCalendar
              processedItems={deferredFilteredItems as any}
              onDateClick={handleCalendarDateClick}
              filteredByResponsavel={filteredByResponsavel}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ActivityPlanner
          processedItems={deferredFilteredItems}
          filteredByResponsavel={filteredByResponsavel}
        />
      </div>

      {activeModal && (
        <DashboardModal
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          modalData={modalData}
          calendarModalData={calendarModalData}
          selectedDate={selectedDate}
        />
      )}
    </ResponsiveLayout>
  );
}

export default function Home() {
  return (
    <AdminProtection
      allowedRoles={["consultor", "compras", "gerente", "diretor", "admin"]}
    >
      <ConsultingDashboard />
    </AdminProtection>
  );
}
