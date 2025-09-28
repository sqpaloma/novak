"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Users, Building } from "lucide-react";
import { toast } from "sonner";

interface ResponsavelFormData {
  nome: string;
  email: string;
}

interface FornecedorFormData {
  nomeEmpresa: string;
  loginUsuario: string;
  senha: string;
  email: string;
}

export function SettingsFornecedores() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResponsavelDialogOpen, setIsResponsavelDialogOpen] = useState(false);
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<any | null>(null);
  const [editingFornecedor, setEditingFornecedor] = useState<any | null>(null);
  const [editingResponsavel, setEditingResponsavel] = useState<any | null>(null);

  const [fornecedorForm, setFornecedorForm] = useState<FornecedorFormData>({
    nomeEmpresa: "",
    loginUsuario: "",
    senha: "",
    email: "",
  });

  const [responsavelForm, setResponsavelForm] = useState<ResponsavelFormData>({
    nome: "",
    email: "",
  });

  // Queries
  const fornecedores: any = [];
  const responsaveis: any = [];

  // Mutations
  const createFornecedor = () => {};
  const updateFornecedor = () => {};
  const removeFornecedor = () => {};
  const addResponsavel = () => {};
  const updateResponsavel = () => {};
  const removeResponsavel = () => {};

  const handleCreateFornecedor = async () => {
    try {
      // await createFornecedor(fornecedorForm);
      toast.success("Fornecedor criado com sucesso!");
      setIsCreateDialogOpen(false);
      setFornecedorForm({ nomeEmpresa: "", loginUsuario: "", senha: "", email: "" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleFornecedorAtivo = async (id: any, ativo: boolean) => {
    try {
      // await updateFornecedor({ id, ativo: !ativo });
      toast.success(`Fornecedor ${!ativo ? "ativado" : "desativado"} com sucesso!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteFornecedor = async (id: any) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      try {
        // await removeFornecedor({ id });
        toast.success("Fornecedor excluído com sucesso!");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleAddResponsavel = async () => {
    if (!selectedFornecedorId) return;

    try {
      // await addResponsavel({
      //   fornecedorId: selectedFornecedorId,
      //   ...responsavelForm,
      // });
      toast.success("Responsável adicionado com sucesso!");
      setIsResponsavelDialogOpen(false);
      setResponsavelForm({ nome: "", email: "" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteResponsavel = async (id: any) => {
    if (confirm("Tem certeza que deseja excluir este responsável?")) {
      try {
        //  await removeResponsavel({ id });
        toast.success("Responsável excluído com sucesso!");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white hover:border-white/30 hover:border-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-blue-600/70 border-white/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Novo Fornecedor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nomeEmpresa" className="text-white">Nome da Empresa</Label>
                <Input
                  id="nomeEmpresa"
                  value={fornecedorForm.nomeEmpresa}
                  onChange={(e) => setFornecedorForm(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                  className="bg-blue-600/50 border-white/20 text-white"
                  placeholder="Ex: Rexroth Brasil"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={fornecedorForm.email}
                  onChange={(e) => setFornecedorForm(prev => ({ ...prev, email: e.target.value, loginUsuario: e.target.value }))}
                  className="bg-blue-600/50 border-white/20 text-white"
                  placeholder="contato@fornecedor.com"
                />
              </div>
              <div>
                <Label htmlFor="loginUsuario" className="text-white">Login de Acesso</Label>
                <Input
                  id="loginUsuario"
                  value={fornecedorForm.loginUsuario}
                  onChange={(e) => setFornecedorForm(prev => ({ ...prev, loginUsuario: e.target.value }))}
                  className="bg-blue-600/50 border-white/20 text-white"
                  placeholder="Será preenchido automaticamente com o email"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="senha" className="text-white">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={fornecedorForm.senha}
                  onChange={(e) => setFornecedorForm(prev => ({ ...prev, senha: e.target.value }))}
                  className="bg-blue-600/50 border-white/20 text-white"
                  placeholder="Senha de acesso"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-white/20 text-blue-600 hover:bg-white/10 hover:border-white/30 hover:border-blue-600 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateFornecedor}
                  className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 hover:border-white/30 hover:border-blue-600"
                  disabled={!fornecedorForm.nomeEmpresa || !fornecedorForm.email || !fornecedorForm.senha}
                >
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Fornecedores */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building className="h-5 w-5" />
            Fornecedores Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/20">
                <TableHead className="text-white">Empresa</TableHead>
                <TableHead className="text-white">Login</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fornecedores?.map((fornecedor: any) => (
                <TableRow key={fornecedor._id} className="border-white/20">
                  <TableCell className="text-white">{fornecedor.nomeEmpresa}</TableCell>
                  <TableCell className="text-white/80">{fornecedor.loginUsuario}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        checked={fornecedor.ativo}
                        onCheckedChange={() => handleToggleFornecedorAtivo(fornecedor._id, fornecedor.ativo)}
                      />
                      <Badge 
                      className="bg-white border-white/30 text-blue-600 hover:bg-blue-600 hover:text-white"
                      variant={fornecedor.ativo ? "default" : "secondary"}>
                        {fornecedor.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedFornecedorId(fornecedor._id);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingFornecedor(fornecedor._id)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteFornecedor(fornecedor._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Responsáveis do Fornecedor Selecionado */}
      {selectedFornecedorId && (
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Responsáveis - {fornecedores?.find((f: any) => f._id === selectedFornecedorId)?.nomeEmpresa}
              </CardTitle>

              <Dialog open={isResponsavelDialogOpen} onOpenChange={setIsResponsavelDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-blue-600/70 border-white/30 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Novo Responsável</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nomeResponsavel" className="text-white">Nome</Label>
                      <Input
                        id="nomeResponsavel"
                        value={responsavelForm.nome}
                        onChange={(e) => setResponsavelForm(prev => ({ ...prev, nome: e.target.value }))}
                        className="bg-blue-600/50 border-white/20 text-white placeholder:text-white/50"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailResponsavel" className="text-white">Email</Label>
                      <Input
                        id="emailResponsavel"
                        type="email"
                        value={responsavelForm.email}
                        onChange={(e) => setResponsavelForm(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-blue-600/50 border-white/20 text-white placeholder:text-white/50"
                        placeholder="email@fornecedor.com"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsResponsavelDialogOpen(false)}
                        className="border-white/20 text-blue-600 hover:bg-white/10 hover:border-white/30 hover:border-blue-600 hover:text-white"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddResponsavel}
                        className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 hover:border-white/30 hover:border-blue-600"
                        disabled={!responsavelForm.nome || !responsavelForm.email}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responsaveis?.map((responsavel: any) => (
                  <TableRow key={responsavel._id} className="border-white/20">
                    <TableCell className="text-white">{responsavel.nome}</TableCell>
                    <TableCell className="text-white/80">{responsavel.email}</TableCell>
                    <TableCell>
                      <Badge 
                      className="bg-white border-white/30 text-blue-600 hover:bg-blue-600 hover:text-white"
                      variant={responsavel.ativo ? "default" : "secondary"}>
                        {responsavel.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingResponsavel(responsavel._id)}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteResponsavel(responsavel._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}