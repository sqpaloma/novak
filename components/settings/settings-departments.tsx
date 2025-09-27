"use client";

import { DepartmentTabs } from "@/components/_departments/department-tabs";
import { DepartmentDialogs } from "../_departments/department-dialogs";
import { useState } from "react";
import { useDepartments } from "@/hooks/use-departments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepartmentList } from "../_departments/department-list";

export function SettingsDepartments() {
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
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Building2 className="h-5 w-5" />
              Gerenciar Departamentos
            </CardTitle>

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