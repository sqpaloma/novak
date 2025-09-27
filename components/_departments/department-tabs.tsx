"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Eye, Database } from "lucide-react";
import { HierarchyView } from "./hierarchy-view";
import { PeopleManagement } from "./people-management";
import { SubdepartmentsManagement } from "./subdepartments-management";
import { SeedDataDialog } from "./seed-data-dialog";
import { DepartmentList } from "./department-list";
import { DepartmentDialogs } from "./department-dialogs";
import { useDepartments } from "@/hooks/use-departments";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export function DepartmentTabs() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    // Data
    departments,
    roles,

    // Form state
    name,
    setName,
    defaultRole,
    setDefaultRole,
    description,
    setDescription,
    editingDepartment,
    isCreating,
    isUpdating,

    // Functions
    resetForm,
    handleCreateDepartment,
    handleEditDepartment,
    handleUpdateDepartment,
    handleToggleStatus,
    handleInitializeDefaults,
    handleViewFlowchart,
    getRoleBadgeColor,
    getRoleLabel,
  } = useDepartments();

  const onCreateDepartment = async () => {
    const success = await handleCreateDepartment();
    if (success) {
      setShowCreateDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com ações principais */}
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          {departments?.length === 0 && (
            <Button
              onClick={handleInitializeDefaults}
              variant="outline"
              className="text-white border-white/30 bg-white/10 hover:bg-white/20"
            >
              <Settings className="h-4 w-4 mr-2" />
              Inicializar Padrões 
            </Button>
          )}

          <SeedDataDialog />

          <DepartmentDialogs
            showCreateDialog={showCreateDialog}
            setShowCreateDialog={setShowCreateDialog}
            onCreateDepartment={onCreateDepartment}
            isCreating={isCreating}
            name={name}
            setName={setName}
            defaultRole={defaultRole}
            setDefaultRole={setDefaultRole}
            description={description}
            setDescription={setDescription}
            roles={roles}
            resetForm={resetForm}
            departments={departments}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hierarchy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20">
          <TabsTrigger
            value="hierarchy"
            className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
          >
            <Eye className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="departments"
            className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
          >
            <Building2 className="h-4 w-4" />
            Departamentos
          </TabsTrigger>
          <TabsTrigger
            value="subdepartments"
            className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
          >
            <Database className="h-4 w-4" />
            Setores
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
          >
            <Users className="h-4 w-4" />
            Pessoas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="space-y-6">
          <HierarchyView />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-6">
            {departments === undefined ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-white/80">Carregando departamentos...</p>
              </div>
            ) : departments?.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-white/80 mx-auto mb-4" />
                <p className="text-white/80">
                  Nenhum departamento cadastrado ainda.
                </p>
                <p className="text-sm text-white/80 mt-2">
                  Clique em "Inicializar Padrões" para criar departamentos básicos
                  ou "Novo Departamento" para criar um personalizado.
                </p>
              </div>
            ) : (
              <DepartmentList
                departments={departments}
                editingDepartment={editingDepartment}
                isUpdating={isUpdating}
                name={name}
                setName={setName}
                defaultRole={defaultRole}
                setDefaultRole={setDefaultRole}
                description={description}
                setDescription={setDescription}
                roles={roles}
                onEditDepartment={handleEditDepartment}
                onUpdateDepartment={handleUpdateDepartment}
                onToggleStatus={handleToggleStatus}
                onViewFlowchart={handleViewFlowchart}
                getRoleBadgeColor={getRoleBadgeColor}
                getRoleLabel={getRoleLabel}
                resetForm={resetForm}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="subdepartments" className="space-y-6">
          <SubdepartmentsManagement />
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          <PeopleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}