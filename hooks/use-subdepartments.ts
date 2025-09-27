import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useSubdepartments(departmentId?: Id<"departments">) {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [responsiblePersonId, setResponsiblePersonId] = useState<Id<"people"> | undefined>(undefined);
  const [editingSubdepartment, setEditingSubdepartment] = useState<Id<"subdepartments"> | null>(null);

  // Data queries
  const subdepartments = departmentId
    ? useQuery(api.subdepartments.listSubdepartmentsByDepartment, { departmentId })
    : undefined;
  const allSubdepartmentsWithHierarchy = useQuery(api.subdepartments.getAllSubdepartmentsWithHierarchy);
  const subdepartmentStats = useQuery(api.subdepartments.getSubdepartmentStats);

  // Mutations
  const createSubdepartmentMutation = useMutation(api.subdepartments.createSubdepartment);
  const updateSubdepartmentMutation = useMutation(api.subdepartments.updateSubdepartment);
  const toggleSubdepartmentStatusMutation = useMutation(api.subdepartments.toggleSubdepartmentStatus);
  const setSubdepartmentResponsibleMutation = useMutation(api.subdepartments.setSubdepartmentResponsible);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset form
  const resetForm = () => {
    setName("");
    setDescription("");
    setResponsiblePersonId(undefined);
    setEditingSubdepartment(null);
  };

  // Create subdepartment
  const handleCreateSubdepartment = async (targetDepartmentId: Id<"departments">) => {
    if (!name.trim()) {
      alert("Nome é obrigatório");
      return false;
    }

    setIsCreating(true);
    try {
      await createSubdepartmentMutation({
        name: name.trim(),
        description: description.trim() || undefined,
        departmentId: targetDepartmentId,
        responsiblePersonId,
      });

      resetForm();
      return true;
    } catch (error) {
      console.error("Erro ao criar subdepartamento:", error);
      alert(`Erro ao criar subdepartamento: ${error}`);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Edit subdepartment
  const handleEditSubdepartment = (subdepartment: any) => {
    setEditingSubdepartment(subdepartment._id);
    setName(subdepartment.name);
    setDescription(subdepartment.description || "");
    setResponsiblePersonId(subdepartment.responsiblePersonId);
  };

  // Update subdepartment
  const handleUpdateSubdepartment = async () => {
    if (!editingSubdepartment || !name.trim()) {
      alert("Nome é obrigatório");
      return false;
    }

    setIsUpdating(true);
    try {
      await updateSubdepartmentMutation({
        id: editingSubdepartment,
        name: name.trim(),
        description: description.trim() || undefined,
        responsiblePersonId,
        active: true,
      });

      resetForm();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar subdepartamento:", error);
      alert(`Erro ao atualizar subdepartamento: ${error}`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle subdepartment status
  const handleToggleSubdepartmentStatus = async (subdepartmentId: Id<"subdepartments">, active: boolean) => {
    try {
      await toggleSubdepartmentStatusMutation({
        id: subdepartmentId,
        active,
      });
      return true;
    } catch (error) {
      console.error("Erro ao alterar status do subdepartamento:", error);
      alert(`Erro ao alterar status: ${error}`);
      return false;
    }
  };

  // Set responsible person
  const handleSetResponsible = async (subdepartmentId: Id<"subdepartments">, personId?: Id<"people">) => {
    try {
      await setSubdepartmentResponsibleMutation({
        subdepartmentId,
        personId,
      });
      return true;
    } catch (error) {
      console.error("Erro ao definir responsável:", error);
      alert(`Erro ao definir responsável: ${error}`);
      return false;
    }
  };

  // Get subdepartment details
  const getSubdepartment = (subdepartmentId: Id<"subdepartments">) => {
    return useQuery(api.subdepartments.getSubdepartment, { id: subdepartmentId });
  };

  // Get subdepartments by responsible person
  const getSubdepartmentsByResponsible = (personId: Id<"people">) => {
    return useQuery(api.subdepartments.getSubdepartmentsByResponsible, { personId });
  };

  // Get people by subdepartment
  const getPeopleBySubdepartment = (subdepartmentId: Id<"subdepartments">) => {
    return useQuery(api.people.getPeopleBySubdepartment, { subdepartmentId });
  };

  return {
    // Data
    subdepartments,
    allSubdepartmentsWithHierarchy,
    subdepartmentStats,

    // Form state
    name,
    setName,
    description,
    setDescription,
    responsiblePersonId,
    setResponsiblePersonId,
    editingSubdepartment,
    isCreating,
    isUpdating,

    // Functions
    resetForm,
    handleCreateSubdepartment,
    handleEditSubdepartment,
    handleUpdateSubdepartment,
    handleToggleSubdepartmentStatus,
    handleSetResponsible,

    // Queries
    getSubdepartment,
    getSubdepartmentsByResponsible,
    getPeopleBySubdepartment,
  };
}