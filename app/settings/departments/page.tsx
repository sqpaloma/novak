"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Settings, Users } from "lucide-react";
import { useDepartments } from "@/hooks/use-departments";
import { DepartmentDialogs } from "@/components/_departments/department-dialogs";
import { DepartmentList } from "@/components/_departments/department-list";
import { SeedDataDialog } from "@/components/_departments/seed-data-dialog";

export default function DepartmentsPage() {
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

    // Flowchart state
    selectedDepartmentForFlowchart,
    showFlowchartDialog,
    setShowFlowchartDialog,

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
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Gerenciar Departamentos
            </h1>
            <p className="text-sm md:text-base text-white/80">
              Configure os departamentos e seus papéis padrão
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {departments?.length === 0 && (
            <Button
              onClick={handleInitializeDefaults}
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={departments === undefined}
            >
              <Settings className="h-4 w-4" />
              Inicializar Padrões
            </Button>
          )}

          <SeedDataDialog />

          <DepartmentDialogs
            showCreateDialog={showCreateDialog}
            setShowCreateDialog={setShowCreateDialog}
            onCreateDepartment={onCreateDepartment}
            isCreating={isCreating}
            showFlowchartDialog={showFlowchartDialog}
            setShowFlowchartDialog={setShowFlowchartDialog}
            selectedDepartmentForFlowchart={selectedDepartmentForFlowchart}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Departamentos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}