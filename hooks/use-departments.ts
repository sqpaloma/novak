import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export interface Department {
  _id: Id<"departments">;
  name: string;
  defaultRole?: string;
  description?: string;
  responsiblePersonId?: Id<"people">;
  responsible?: any;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export function useDepartments() {
  // Form states
  const [name, setName] = useState("");
  const [defaultRole, setDefaultRole] = useState("consultor");
  const [description, setDescription] = useState("");
  const [responsiblePersonId, setResponsiblePersonId] = useState<Id<"people"> | undefined>(undefined);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Flowchart modal
  const [selectedDepartmentForFlowchart, setSelectedDepartmentForFlowchart] = useState<Department | null>(null);
  const [showFlowchartDialog, setShowFlowchartDialog] = useState(false);

  // Convex queries and mutations
  const departments = useQuery(api.departments.listAllDepartments);
  const departmentHierarchy = useQuery(api.departments.getDepartmentHierarchy);
  const createDepartment = useMutation(api.departments.createDepartment);
  const updateDepartment = useMutation(api.departments.updateDepartment);
  const toggleDepartmentStatus = useMutation(api.departments.toggleDepartmentStatus);
  const initializeDefaultDepartments = useMutation(api.departments.initializeDefaultDepartments);
  const setDepartmentResponsible = useMutation(api.departments.setDepartmentResponsible);

  const roles = useMemo(() => [
    { value: "consultor", label: "Consultor" },
    { value: "qualidade_pcp", label: "Qualidade e PCP" },
    { value: "compras", label: "Compras" },
    { value: "gerente", label: "Gerente" },
    { value: "diretor", label: "Diretor" },
    { value: "admin", label: "Administrador" },
  ], []);

  const resetForm = useCallback(() => {
    setName("");
    setDefaultRole("consultor");
    setDescription("");
    setResponsiblePersonId(undefined);
    setEditingDepartment(null);
  }, []);

  const handleCreateDepartment = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Nome do departamento é obrigatório");
      return;
    }

    setIsCreating(true);
    try {
      await createDepartment({
        name: name.trim(),
        defaultRole,
        description: description.trim() || undefined,
        responsiblePersonId,
      });

      toast.success("Departamento criado com sucesso!");
      resetForm();
      return true;
    } catch (error) {
      toast.error("Erro ao criar departamento");
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [name, defaultRole, description, responsiblePersonId, createDepartment, resetForm]);

  const handleEditDepartment = useCallback((department: Department) => {
    setEditingDepartment(department);
    setName(department.name);
    setDefaultRole(department.defaultRole || "consultor");
    setDescription(department.description || "");
    setResponsiblePersonId(department.responsiblePersonId);
  }, []);

  const handleUpdateDepartment = useCallback(async () => {
    if (!editingDepartment || !name.trim()) {
      toast.error("Nome do departamento é obrigatório");
      return;
    }

    setIsUpdating(true);
    try {
      await updateDepartment({
        id: editingDepartment._id,
        name: name.trim(),
        defaultRole,
        description: description.trim() || undefined,
        responsiblePersonId,
        active: editingDepartment.active,
      });

      toast.success("Departamento atualizado com sucesso!");
      resetForm();
      return true;
    } catch (error) {
      toast.error("Erro ao atualizar departamento");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [editingDepartment, name, defaultRole, description, responsiblePersonId, updateDepartment, resetForm]);

  const handleToggleStatus = useCallback(async (department: Department) => {
    try {
      await toggleDepartmentStatus({
        id: department._id,
        active: !department.active,
      });

      toast.success(
        `Departamento ${!department.active ? "ativado" : "desativado"} com sucesso!`
      );
    } catch (error) {
      toast.error("Erro ao alterar status do departamento");
    }
  }, [toggleDepartmentStatus]);

  const handleInitializeDefaults = useCallback(async () => {
    try {
      const result = await initializeDefaultDepartments();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      toast.error("Erro ao inicializar departamentos padrão");
    }
  }, [initializeDefaultDepartments]);

  // Flowchart functions
  const handleViewFlowchart = useCallback((department: Department) => {
    setSelectedDepartmentForFlowchart(department);
    setShowFlowchartDialog(true);
  }, []);

  // Set department responsible
  const handleSetResponsible = useCallback(async (departmentId: Id<"departments">, personId?: Id<"people">) => {
    try {
      await setDepartmentResponsible({
        departmentId,
        personId,
      });
      toast.success("Responsável definido com sucesso!");
      return true;
    } catch (error) {
      toast.error("Erro ao definir responsável");
      return false;
    }
  }, [setDepartmentResponsible]);

  // Helper functions for queries (these return query configurations, not actual hooks)
  const getPeopleByDepartmentQuery = useCallback((departmentId: Id<"departments">) => {
    return { api: api.people.getPeopleByDepartment, args: { departmentId } };
  }, []);

  const getDashboardDataByTeamQuery = useCallback((personId: Id<"people">) => {
    return { api: api.departments.getDashboardDataByTeam, args: { personId } };
  }, []);

  const getRoleBadgeColor = useCallback((role?: string) => {
    if (!role) {
      return "bg-white/15 text-white border-white/30";
    }
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "diretor":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "gerente":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "compras":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "qualidade_pcp":
        return "bg-green-100 text-green-800 border-green-200";
      case "consultor":
      default:
        return "bg-white/15 text-white border-white/30";
    }
  }, []);

  const getRoleLabel = useCallback((role?: string) => {
    if (!role) {
      return "Sem função definida";
    }
    const roleObj = roles.find((r) => r.value === role);
    return roleObj ? roleObj.label : role;
  }, [roles]);

  return {
    // Data
    departments,
    departmentHierarchy,
    roles,

    // Form state
    name,
    setName,
    defaultRole,
    setDefaultRole,
    description,
    setDescription,
    responsiblePersonId,
    setResponsiblePersonId,
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
    handleSetResponsible,
    getRoleBadgeColor,
    getRoleLabel,

    // Query helpers
    getPeopleByDepartmentQuery,
    getDashboardDataByTeamQuery,
  };
}