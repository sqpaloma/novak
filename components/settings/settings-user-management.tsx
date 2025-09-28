"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateUserForm } from "./create-user-form";
import { UserPlus, Users, Edit, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface EditingUser {
  _id: any;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  role?: string;
  isAdmin?: boolean;
}

export function SettingsUserManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const users: any = [];


  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  const handleEditUser = (user: any) => {
    setEditingUser({
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      position: user.position || "",
      department: user.department || "",
      role: user.role || "consultor",
      isAdmin: user.isAdmin || false,
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setIsUpdating(true);
    try {
     

      toast.success("Usuário atualizado com sucesso!");
      setEditingUser(null);
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: keyof EditingUser, value: any) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      [field]: value,
    });
  };

  const handleDeleteUser = async (userId: any) => {
    setDeletingUserId(userId);
  };


  const cancelDeleteUser = () => {
    setDeletingUserId(null);
  };

  const getRoleBadgeColor = (role?: string) => {
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
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "diretor":
        return "Diretor";
      case "gerente":
        return "Gerente";
      case "compras":
        return "Compras";
      case "qualidade_pcp":
        return "Qualidade e PCP";
      case "consultor":
      default:
        return "Consultor";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showCreateForm ? (
            <div className="space-y-6">
             

              <div className="flex justify-end">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-white hover:text-blue-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Novo Usuário
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">
                  Usuários Cadastrados
                </h3>
                
                {users?.length === 0 ? (
                  <p className="text-white">Nenhum usuário encontrado.</p>
                ) : (
                  <div className="space-y-3">
                    {users?.map((user: any) => (
                      <Card key={user._id} className="border border-white/30">
                        <CardContent className="pt-4">
                          {editingUser && editingUser._id === user._id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Nome</Label>
                                  
                                  <Input
                                    value={editingUser.name}
                                    onChange={(e) =>
                                      handleInputChange("name", e.target.value)
                                    }
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>E-mail</Label>
                                  <Input
                                    value={editingUser.email}
                                    onChange={(e) =>
                                      handleInputChange("email", e.target.value)
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Telefone</Label>
                                  <Input
                                    value={editingUser.phone}
                                    onChange={(e) =>
                                      handleInputChange("phone", e.target.value)
                                    }
                                    placeholder="(11) 99999-9999"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Cargo</Label>
                                  <Input
                                    value={editingUser.position}
                                    onChange={(e) =>
                                      handleInputChange("position", e.target.value)
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Departamento</Label>
                                  <Select
                                    value={editingUser.department}
                                    onValueChange={(value) =>
                                      handleInputChange("department", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="vendas">Vendas</SelectItem>
                                      <SelectItem value="servicos">Serviços</SelectItem>
                                      <SelectItem value="engenharia">
                                        Engenharia e Assistência
                                      </SelectItem>
                                      <SelectItem value="administrativo">
                                        Administrativo
                                      </SelectItem>
                                      <SelectItem value="consultoria">
                                        Consultoria
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Papel (Perfil)</Label>
                                  <Select
                                    value={editingUser.role}
                                    onValueChange={(value) =>
                                      handleInputChange("role", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="consultor">Consultor</SelectItem>
                                      <SelectItem value="qualidade_pcp">
                                        Qualidade e PCP
                                      </SelectItem>
                                      <SelectItem value="compras">Compras</SelectItem>
                                      <SelectItem value="gerente">Gerente</SelectItem>
                                      <SelectItem value="diretor">Diretor</SelectItem>
                                      <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={editingUser.isAdmin}
                                      onCheckedChange={(checked) =>
                                        handleInputChange("isAdmin", checked)
                                      }
                                    />
                                    <Label className="text-sm">
                                      Usuário Administrador
                                    </Label>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  disabled={isUpdating}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={handleSaveEdit}
                                  disabled={isUpdating}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isUpdating ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                      Salvando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Salvar
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium text-white">
                                    {user.name}
                                  </h4>
                                  <Badge
                                    className={getRoleBadgeColor(user.role)}
                                    variant="outline"
                                  >
                                    {getRoleLabel(user.role)}
                                  </Badge>
                                  {user.isAdmin && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-white/80 space-y-1">
                                  <p>E-mail: {user.email}</p>
                                  {user.position && <p>Cargo: {user.position}</p>}
                                  {user.department && <p>Departamento: {user.department}</p>}
                                  {user.phone && <p>Telefone: {user.phone}</p>}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <CreateUserForm
              onCancel={() => setShowCreateForm(false)}
              onSuccess={handleCreateSuccess}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
