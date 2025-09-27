"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Edit, Trash2, Users, User } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export function SubdepartmentsManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSubdepartment, setEditingSubdepartment] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [responsiblePersonId, setResponsiblePersonId] = useState<Id<"people"> | undefined>(undefined);

  // Data
  const departments = useQuery(api.departments.listDepartments);
  const allSubdepartmentsWithHierarchy = useQuery(api.subdepartments.getAllSubdepartmentsWithHierarchy);
  const people = useQuery(api.people.listPeople);

  // Mutations
  const createSubdepartment = useMutation(api.subdepartments.createSubdepartment);
  const updateSubdepartment = useMutation(api.subdepartments.updateSubdepartment);
  const toggleSubdepartmentStatus = useMutation(api.subdepartments.toggleSubdepartmentStatus);
  const setSubdepartmentResponsible = useMutation(api.subdepartments.setSubdepartmentResponsible);

  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setResponsiblePersonId(undefined);
    setEditingSubdepartment(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nome do subdepartamento é obrigatório");
      return;
    }

    // Encontrar departamento "consultor"
    const consultorDept = departments?.find(d => d.name === "consultor");
    if (!consultorDept) {
      toast.error("Departamento consultor não encontrado");
      return;
    }

    setIsLoading(true);
    try {
      if (editingSubdepartment) {
        await updateSubdepartment({
          id: editingSubdepartment._id,
          name: name.trim(),
          description: description.trim() || undefined,
          responsiblePersonId,
          active: true,
        });
        toast.success("Subdepartamento atualizado com sucesso!");
      } else {
        await createSubdepartment({
          name: name.trim(),
          description: description.trim() || undefined,
          departmentId: consultorDept._id,
          responsiblePersonId,
        });
        toast.success("Subdepartamento criado com sucesso!");
      }

      resetForm();
      setShowCreateDialog(false);
    } catch (error) {
      toast.error(`Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (subdepartment: any) => {
    setEditingSubdepartment(subdepartment);
    setName(subdepartment.name);
    setDescription(subdepartment.description || "");
    setResponsiblePersonId(subdepartment.responsiblePersonId);
    setShowCreateDialog(true);
  };

  const handleToggleStatus = async (subdepartmentId: Id<"subdepartments">, active: boolean) => {
    try {
      await toggleSubdepartmentStatus({ id: subdepartmentId, active });
      toast.success(`Subdepartamento ${active ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      toast.error(`Erro: ${error}`);
    }
  };

  const handleSetResponsible = async (subdepartmentId: Id<"subdepartments">, personId?: Id<"people">) => {
    try {
      await setSubdepartmentResponsible({ subdepartmentId, personId });
      toast.success("Responsável definido com sucesso!");
    } catch (error) {
      toast.error(`Erro: ${error}`);
    }
  };

  const getConsultors = () => {
    if (!people) return [];
    return people.filter(p => p.role === "Consultor" || p.role === "Gerente");
  };

  if (!allSubdepartmentsWithHierarchy || !people) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-white/80">Carregando subdepartamentos...</p>
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
              <Building2 className="h-5 w-5" />
              Gerenciar Subdepartamentos
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
                  Novo Subdepartamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingSubdepartment ? "Editar Subdepartamento" : "Novo Subdepartamento"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Setor 6 - Componentes Eletrônicos"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrição do subdepartamento"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsible">Consultor Responsável</Label>
                    <Select value={responsiblePersonId || "none"} onValueChange={(value) => setResponsiblePersonId(value === "none" ? undefined : value as Id<"people">)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum (Giovanni gerencia diretamente)</SelectItem>
                        {getConsultors().map((person) => (
                          <SelectItem key={person._id} value={person._id}>
                            {person.name} ({person.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Salvando..." : editingSubdepartment ? "Salvar" : "Criar"}
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

      {/* Lista de Departamentos e Subdepartamentos */}
      {allSubdepartmentsWithHierarchy.map((dept: any) => (
        <Card key={dept._id} className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Building2 className="h-5 w-5" />
              {dept.name}
              {dept.responsible && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {dept.responsible.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dept.subdepartments && dept.subdepartments.length > 0 ? (
              <div className="space-y-3">
                {dept.subdepartments.map((subdept: any) => (
                  <div
                    key={subdept._id}
                    className="border border-white/20 rounded-lg p-4 bg-white/5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium text-white">{subdept.name}</h4>
                          {subdept.description && (
                            <p className="text-sm text-white/70">{subdept.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {subdept.responsible ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {subdept.responsible.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-white/60 border-white/30">
                            Sem responsável
                          </Badge>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(subdept)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant={subdept.active ? "destructive" : "default"}
                          onClick={() => handleToggleStatus(subdept._id, !subdept.active)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Equipe do subdepartamento */}
                    {subdept.people && subdept.people.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/70">
                          <Users className="h-4 w-4" />
                          <span className="text-sm font-medium">Equipe ({subdept.people.length})</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {subdept.people.map((person: any) => (
                            <div
                              key={person._id}
                              className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10"
                            >
                              <User className="h-3 w-3 text-white/60" />
                              <span className="text-xs text-white/90">{person.name}</span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {person.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Troca de responsável rápida */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-white/70">Trocar responsável:</Label>
                        <Select
                          value={subdept.responsiblePersonId || "none"}
                          onValueChange={(value) =>
                            handleSetResponsible(subdept._id, value === "none" ? undefined : value as Id<"people">)
                          }
                        >
                          <SelectTrigger className="w-48 h-8">
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {getConsultors().map((person) => (
                              <SelectItem key={person._id} value={person._id}>
                                {person.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum subdepartamento criado ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}