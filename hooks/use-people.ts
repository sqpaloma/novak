import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function usePeople() {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState<Id<"users"> | undefined>(undefined);
  const [supervisorId, setSupervisorId] = useState<Id<"people"> | undefined>(undefined);
  const [editingPerson, setEditingPerson] = useState<Id<"people"> | null>(null);

  // Data queries
  const people = useQuery(api.people.listPeople);
  const peopleByRole = useQuery(api.people.getPeopleByRoleHierarchy);

  // Mutations
  const createPersonMutation = useMutation(api.people.createPerson);
  const updatePersonMutation = useMutation(api.people.updatePerson);
  const togglePersonStatusMutation = useMutation(api.people.togglePersonStatus);
  const linkPersonToDepartmentMutation = useMutation(api.people.linkPersonToDepartment);
  const unlinkPersonFromDepartmentMutation = useMutation(api.people.unlinkPersonFromDepartment);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset form
  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("");
    setUserId(undefined);
    setSupervisorId(undefined);
    setEditingPerson(null);
  };

  // Create person
  const handleCreatePerson = async () => {
    if (!name.trim() || !role.trim()) {
      alert("Nome e função são obrigatórios");
      return false;
    }

    setIsCreating(true);
    try {
      await createPersonMutation({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role: role.trim(),
        userId,
        supervisorId,
      });

      resetForm();
      return true;
    } catch (error) {
      console.error("Erro ao criar pessoa:", error);
      alert(`Erro ao criar pessoa: ${error}`);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Edit person
  const handleEditPerson = (person: any) => {
    setEditingPerson(person._id);
    setName(person.name);
    setEmail(person.email || "");
    setPhone(person.phone || "");
    setRole(person.role);
    setUserId(person.userId);
    setSupervisorId(person.supervisorId);
  };

  // Update person
  const handleUpdatePerson = async () => {
    if (!editingPerson || !name.trim() || !role.trim()) {
      alert("Nome e função são obrigatórios");
      return false;
    }

    setIsUpdating(true);
    try {
      await updatePersonMutation({
        id: editingPerson,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role: role.trim(),
        userId,
        supervisorId,
        active: true,
      });

      resetForm();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar pessoa:", error);
      alert(`Erro ao atualizar pessoa: ${error}`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle person status
  const handleTogglePersonStatus = async (personId: Id<"people">, active: boolean) => {
    try {
      await togglePersonStatusMutation({
        id: personId,
        active,
      });
      return true;
    } catch (error) {
      console.error("Erro ao alterar status da pessoa:", error);
      alert(`Erro ao alterar status: ${error}`);
      return false;
    }
  };

  // Link person to department
  const handleLinkPersonToDepartment = async (
    personId: Id<"people">,
    departmentId?: Id<"departments">,
    subdepartmentId?: Id<"subdepartments">,
    isResponsible: boolean = false
  ) => {
    try {
      await linkPersonToDepartmentMutation({
        personId,
        departmentId,
        subdepartmentId,
        isResponsible,
      });
      return true;
    } catch (error) {
      console.error("Erro ao vincular pessoa ao departamento:", error);
      alert(`Erro ao vincular pessoa: ${error}`);
      return false;
    }
  };

  // Unlink person from department
  const handleUnlinkPersonFromDepartment = async (linkId: Id<"departmentPeople">) => {
    try {
      await unlinkPersonFromDepartmentMutation({
        linkId,
      });
      return true;
    } catch (error) {
      console.error("Erro ao desvincular pessoa do departamento:", error);
      alert(`Erro ao desvincular pessoa: ${error}`);
      return false;
    }
  };

  // Helper functions for role labels and colors
  const getRoleLabel = (roleValue: string) => {
    const roleLabels = {
      diretor: "Diretor",
      gerente: "Gerente",
      consultor: "Consultor",
      mecanico: "Mecânico",
      tecnico: "Técnico",
      analista: "Analista",
      outro: "Outro",
    };
    return roleLabels[roleValue as keyof typeof roleLabels] || roleValue;
  };

  const getRoleBadgeColor = (roleValue: string) => {
    const roleColors = {
      diretor: "bg-purple-100 text-purple-800 border-purple-200",
      gerente: "bg-blue-100 text-blue-800 border-blue-200",
      consultor: "bg-green-100 text-green-800 border-green-200",
      mecanico: "bg-orange-100 text-orange-800 border-orange-200",
      tecnico: "bg-yellow-100 text-yellow-800 border-yellow-200",
      analista: "bg-indigo-100 text-indigo-800 border-indigo-200",
      outro: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return roleColors[roleValue as keyof typeof roleColors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get person hierarchy
  const getPersonHierarchy = (personId: Id<"people">) => {
    return useQuery(api.people.getPersonHierarchy, { personId });
  };

  // Get person team
  const getPersonTeam = (personId: Id<"people">) => {
    return useQuery(api.people.getPersonTeam, { personId });
  };

  // Get subordinates
  const getSubordinates = (supervisorId: Id<"people">) => {
    return useQuery(api.people.getSubordinates, { supervisorId });
  };

  return {
    // Data
    people,
    peopleByRole,

    // Form state
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    role,
    setRole,
    userId,
    setUserId,
    supervisorId,
    setSupervisorId,
    editingPerson,
    isCreating,
    isUpdating,

    // Functions
    resetForm,
    handleCreatePerson,
    handleEditPerson,
    handleUpdatePerson,
    handleTogglePersonStatus,
    handleLinkPersonToDepartment,
    handleUnlinkPersonFromDepartment,
    getRoleLabel,
    getRoleBadgeColor,

    // Queries
    getPersonHierarchy,
    getPersonTeam,
    getSubordinates,
  };
}