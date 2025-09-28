"use client";

import React, { useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";


function DashboardCalendar() {
  return (
    <div>
      <h1>Dashboard Calendar</h1>
    </div>
  );
}

function DistributionPanel() {
  return (
    <div>
      <h1>Distribution Panel</h1>
    </div>
  );
}

function ActivityPlanner() {
  return (
    <div>
      <h1>Activity Planner</h1>
    </div>
  );
}

function DashboardModal() {
  return (
    <div>
      <h1>Dashboard Modal</h1>
    </div>
  );
};

function ResponsavelFilter() {
  return (
    <div>
      <h1>Responsavel Filter</h1>
    </div>
  );
}

function SearchFilter() {
  return (
    <div>
      <h1>Search Filter</h1>
    </div>
  );
}

function DepartamentoInfo() {
  return (
    <div>
      <h1>Departamento Info</h1>
    </div>
  );
};

// Função auxiliar para agrupar status
function buildStatusGroups(items: any[]) {
  return {
    total: items,
    aprovacao: items.filter((item: any) => item.status?.toLowerCase().includes('aprovacao')),
    analises: items.filter((item: any) => item.status?.toLowerCase().includes('analise')),
    orcamentos: items.filter((item: any) => item.status?.toLowerCase().includes('orcamento')),
    execucao: items.filter((item: any) => item.status?.toLowerCase().includes('execucao')),
    pronto: items.filter((item: any) => item.status?.toLowerCase().includes('pronto')),
  };
};

function ConsultingDashboard() {
  // Estados do dashboard
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [filteredByResponsavel, setFilteredByResponsavel] = useState<string | null>(null);

  // Dados mockados temporários
  const processedItems: any[] = [];
  const groupedFiltered = buildStatusGroups(processedItems);
  const groupedAll = buildStatusGroups(processedItems);

  const filteredDashboardData = {
    totalItens: groupedFiltered.total.length,
    aguardandoAprovacao: groupedFiltered.aprovacao.length,
    analises: groupedFiltered.analises.length,
    orcamentos: groupedFiltered.orcamentos.length,
    emExecucao: groupedFiltered.execucao.length,
    pronto: groupedFiltered.pronto.length,
  };

  const overdueItems: any[] = [];
  const canSeeResponsavelFilter = true;

  // Handlers
  const handleResponsavelFilterChange = (responsavel: string | null) => {
    setFilteredByResponsavel(responsavel);
  };

  const handleItemSelect = (item: any) => {
    setActiveModal("item-details");
    setModalData([item]);
  };

  const openModal = (modalType: string, data?: any[]) => {
    setActiveModal(modalType);
    if (data) {
      setModalData(data);
      return;
    }
    const groups = filteredByResponsavel ? groupedFiltered : groupedAll;
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

  return (
    <ResponsiveLayout fullWidth={true}>
      <div className="mt-6 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-bold text-white">
            Seja bem-vindo(a),<br className="sm:hidden" /> {"Usuário"}!
        </h1>
        <div className="sm:mt-0 mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <SearchFilter />
          {canSeeResponsavelFilter && (
              <ResponsavelFilter />
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
              <DistributionPanel />
            </div>
          </div>
          <DepartamentoInfo />
          <DashboardCalendar />
        </div>

        <div className="hidden md:grid xl:hidden grid-cols-2 gap-2">
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <DashboardMetrics
              dashboardData={filteredDashboardData}
              openModal={openModal}
              overdueItems={overdueItems}
            />
            <div className="h-[250px]">
              <DistributionPanel />
            </div>
          </div>
          <DepartamentoInfo />
          <DashboardCalendar />
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
                <DistributionPanel />
              </div>
            </div>
          </div>
          <div className="col-span-1 xl:col-span-2">
            <DepartamentoInfo />
          </div>
          <div className="col-span-3 xl:col-span-3 xl:col-start-6">
            <DashboardCalendar />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ActivityPlanner />
      </div>

      {activeModal && (
        <DashboardModal />
      )}
    </ResponsiveLayout>
  );
}

export default function Home() {
  return (
    <ConsultingDashboard />
  );
}
