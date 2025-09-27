"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, User, Plus, Edit, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export function PeopleManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [supervisorId, setSupervisorId] = useState<Id<"people"> | undefined>(undefined);

  // Data
  const people = useQuery(api.people.listPeople);
  const peopleByRole = useQuery(api.people.getPeopleByRoleHierarchy);

  // Mutations
  const createPerson = useMutation(api.people.createPerson);
  const updatePerson = useMutation(api.people.updatePerson);
  const togglePersonStatus = useMutation(api.people.togglePersonStatus);

  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("");
    setSupervisorId(undefined);
    setEditingPerson(null);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !role.trim()) {
      toast.error("Nome e função são obrigatórios");
      return;
    }

    // Verificar se email é obrigatório para a função
    const roleLower = role.toLowerCase();
    const isMechanicRole = roleLower.includes("mecânico") || roleLower.includes("mecanico");

    if (!isMechanicRole && !email.trim()) {
      toast.error("Email é obrigatório para esta função");
      return;
    }

    setIsLoading(true);
    try {
      if (editingPerson) {
        await updatePerson({
          id: editingPerson._id,
          name: name.trim(),
          email: email.trim() || undefined,
          role: role.trim(),
          supervisorId,
          active: true,
        });
        toast.success("Pessoa atualizada com sucesso!");
      } else {
        await createPerson({
          name: name.trim(),
          email: email.trim() || undefined,
          role: role.trim(),
          supervisorId,
        });
        toast.success("Pessoa criada com sucesso!");
      }

      resetForm();
      setShowCreateDialog(false);
    } catch (error) {
      toast.error(`Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (person: any) => {
    setEditingPerson(person);
    setName(person.name);
    setEmail(person.email || "");
    setRole(person.role);
    setSupervisorId(person.supervisorId);
    setShowCreateDialog(true);
  };

  const handleToggleStatus = async (personId: Id<"people">, active: boolean) => {
    try {
      await togglePersonStatus({ id: personId, active });
      toast.success(`Pessoa ${active ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      toast.error(`Erro: ${error}`);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const roleColors = {
      "Gerente": "bg-purple-100 text-purple-800 border-purple-200",
      "Consultor": "bg-green-100 text-green-800 border-green-200",
      "Mecânico": "bg-orange-100 text-orange-800 border-orange-200",
      "Técnico": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Analista": "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    return roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPotentialSupervisors = () => {
    if (!people) return [];
    return people.filter(p =>
      p._id !== editingPerson?._id &&
      (p.role === "Gerente" || p.role === "Consultor")
    );
  };

  if (!people || !peopleByRole) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-white/80">Carregando pessoas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5" />
              Gerenciar Pessoas
            </CardTitle>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nova Pessoa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPerson ? "Editar Pessoa" : "Nova Pessoa"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Função *</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Consultor">Consultor</SelectItem>
                        <SelectItem value="Mecânico">Mecânico</SelectItem>
                        <SelectItem value="Técnico">Técnico</SelectItem>
                        <SelectItem value="Analista">Analista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="supervisor">Superior Hierárquico</Label>
                    <Select value={supervisorId || "none"} onValueChange={(value) => setSupervisorId(value === "none" ? undefined : value as Id<"people">)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o superior" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {getPotentialSupervisors().map((person) => (
                          <SelectItem key={person._id} value={person._id}>
                            {person.name} ({person.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email">
                      Email {role && !role.toLowerCase().includes("mecânico") && !role.toLowerCase().includes("mecanico") && "*"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Salvando..." : editingPerson ? "Salvar" : "Criar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Pessoas por Função */}
      {Object.entries(peopleByRole).map(([roleKey, people]) => {
        if (people.length === 0) return null;

        const roleLabel = roleKey === 'diretor' ? 'Diretor' :
                        roleKey === 'gerente' ? 'Gerente' :
                        roleKey === 'consultor' ? 'Consultor' :
                        roleKey === 'mecanico' ? 'Mecânico' : 'Outros';

        return (
          <Card key={roleKey} className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Badge className={getRoleBadgeColor(roleLabel)}>
                  {roleLabel} ({people.length})
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {people.map((person: any) => (
                  <div
                    key={person._id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-white/60" />
                      <div>
                        <p className="font-medium text-white">{person.name}</p>
                        <div className="flex flex-col gap-1 text-sm text-white/70">
                          {person.email && <span>{person.email}</span>}
                          {person.supervisorId && (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-3 w-3" />
                              <span>
                                Supervisor: {people?.find(p => p._id === person.supervisorId)?.name || "Não encontrado"}
                              </span>
                            </div>
                          )}
                          {(person.role === "Consultor" || person.role === "Gerente") && (
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              <span>
                                Equipe: {people?.filter(p => p.supervisorId === person._id).length || 0} pessoa(s)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(person)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>

                      <Button
                        size="sm"
                        variant={person.active ? "destructive" : "default"}
                        onClick={() => handleToggleStatus(person._id, !person.active)}
                        className="h-8 w-8 p-0"
                      >
                        {person.active ? <Trash2 className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}