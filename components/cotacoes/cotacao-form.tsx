"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Save, Upload, FileText } from "lucide-react";
import { useCotacoes } from "@/hooks/use-cotacoes";
import { Id } from "@/convex/_generated/dataModel";
import type { CotacaoItem } from "@/hooks/use-cotacoes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface CotacaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  solicitanteId?: Id<"users">;
}

export function CotacaoForm({ isOpen, onClose, solicitanteId }: CotacaoFormProps) {
  const { criarCotacao, proximoNumero, isLoading } = useCotacoes();
  const fornecedores = useQuery(api.fornecedores.getAtivos);

  const [formData, setFormData] = useState({
    numeroOS: "",
    numeroOrcamento: "",
    observacoes: "",
    fornecedor: "", // DEPRECATED - mantido para compatibilidade
    solicitarInfoTecnica: false, // DEPRECATED - mantido para compatibilidade
    fornecedorId: undefined as Id<"fornecedores"> | undefined,
    tipoSolicitacao: "cotacao" as "cotacao" | "especificacao_tecnica" | "ambos",
  });

  const [itens, setItens] = useState<CotacaoItem[]>([
    {
      codigoPeca: "",
      descricao: "",
      quantidade: 1,
      observacoes: "",
      precisaCadastro: false,
      tipoItem: undefined,
      aplicacao: "",
      modelo: "",
      numeroSerie: "",
      oem: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index: number, field: keyof CotacaoItem, value: string | number | boolean) => {
    setItens(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItens(prev => [...prev, {
      codigoPeca: "",
      descricao: "",
      quantidade: 1,
      observacoes: "",
      precisaCadastro: false,
      tipoItem: undefined,
      aplicacao: "",
      modelo: "",
      numeroSerie: "",
      oem: "",
    }]);
  };

  const removeItem = (index: number) => {
    if (itens.length > 1) {
      setItens(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é PDF ou imagem
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        alert('Por favor, selecione apenas arquivos PDF ou imagens (JPG, PNG)');
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const validateForm = () => {
    // Pelo menos um campo de identificação deve estar preenchido
    if (!formData.numeroOS && !formData.numeroOrcamento) {
      return "Preencha pelo menos um campo: Número da OS ou Orçamento";
    }

    // Se for "especificacao_tecnica", validar apenas observações
    if (formData.tipoSolicitacao === "especificacao_tecnica") {
      if (!formData.observacoes?.trim()) {
        return "Para solicitação de especificação técnica, as observações são obrigatórias";
      }
      return null;
    }

    // Para "cotacao" e "ambos", validar itens
    if (formData.tipoSolicitacao === "cotacao" || formData.tipoSolicitacao === "ambos") {
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        if (!item.codigoPeca.trim()) {
          return `Item ${i + 1}: Código da peça é obrigatório`;
        }
        if (!item.descricao.trim()) {
          return `Item ${i + 1}: Descrição é obrigatória`;
        }
        if (item.quantidade <= 0) {
          return `Item ${i + 1}: Quantidade deve ser maior que zero`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!solicitanteId) {
      alert("Erro: Usuário não identificado");
      return;
    }

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);

    try {
      await criarCotacao({
        ...formData,
        itens: itens.filter(item => item.codigoPeca.trim() && item.descricao.trim()),
      }, solicitanteId);

      // Limpar formulário
      setFormData({
        numeroOS: "",
        numeroOrcamento: "",
        observacoes: "",
        fornecedor: "", // DEPRECATED - mantido para compatibilidade
        solicitarInfoTecnica: false, // DEPRECATED - mantido para compatibilidade
        fornecedorId: undefined,
        tipoSolicitacao: "cotacao",
      });
      setItens([{
        codigoPeca: "",
        descricao: "",
        quantidade: 1,
        observacoes: "",
        precisaCadastro: false,
        tipoItem: undefined,
        aplicacao: "",
        modelo: "",
        numeroSerie: "",
        oem: "",
      }]);
      setUploadedFile(null);

      onClose();
    } catch (error) {
      console.error("Erro ao criar cotação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-6xl max-h-[95vh] overflow-y-auto w-full bg-blue-600/70 border-white/30 text-white p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Nova Cotação #{proximoNumero || "..."}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Informações gerais */}
          <div className="p-3 sm:p-4 bg-blue-600/70 border-white/30 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Informações Gerais</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroOS" className="text-white">Número da OS</Label>
                  <Input
                    id="numeroOS"
                    value={formData.numeroOS}
                    onChange={(e) => handleInputChange("numeroOS", e.target.value)}
                    placeholder="Ex: 41250"
                    className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroOrcamento" className="text-white">Número do Orçamento</Label>
                  <Input
                    id="numeroOrcamento"
                    value={formData.numeroOrcamento}
                    onChange={(e) => handleInputChange("numeroOrcamento", e.target.value)}
                    placeholder="Ex: 200001"
                    className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fornecedor" className="text-white">Fornecedor</Label>
                  <Select
                    value={formData.fornecedorId || ""}
                    onValueChange={(value) => handleInputChange("fornecedorId", value)}
                  >
                    <SelectTrigger className="bg-blue-600/70 border-white/30 text-white">
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores?.map((fornecedor) => (
                        <SelectItem key={fornecedor._id} value={fornecedor._id}>
                          {fornecedor.nomeEmpresa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.fornecedorId && (
                <div className="space-y-2">
                  <Label htmlFor="tipoSolicitacao" className="text-white">Tipo de Solicitação</Label>
                  <Select
                    value={formData.tipoSolicitacao}
                    onValueChange={(value) => handleInputChange("tipoSolicitacao", value)}
                  >
                    <SelectTrigger className="bg-blue-600/70 border-white/30 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cotacao">Somente Cotação</SelectItem>
                      <SelectItem value="especificacao_tecnica">Somente Especificação Técnica</SelectItem>
                      <SelectItem value="ambos">Cotação + Especificação Técnica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-white">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  placeholder="Observações gerais sobre a cotação..."
                  rows={3}
                  className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo baseado no tipo de solicitação */}
          {formData.tipoSolicitacao === "especificacao_tecnica" ? (
            /* Seção para somente especificação técnica */
            <div className="p-3 sm:p-4 bg-blue-600/70 border-white/30 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                <FileText className="h-5 w-5 inline mr-2" />
                Solicitação de Especificação Técnica
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observacoesEspecificacao" className="text-white">
                    Detalhes da Solicitação *
                  </Label>
                  <Textarea
                    id="observacoesEspecificacao"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    placeholder="Descreva detalhadamente as especificações técnicas que você precisa: características do produto, parâmetros técnicos, normas, certificações, etc."
                    rows={6}
                    className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Anexar Arquivo (Opcional)</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Selecionar Arquivo
                    </Label>
                    {uploadedFile && (
                      <div className="flex items-center gap-2 text-white text-sm">
                        <FileText className="h-4 w-4" />
                        <span>{uploadedFile.name}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={removeFile}
                          className="text-red-400 hover:text-red-300 hover:bg-red-600/20 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-white/60 text-xs">
                    Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Seção para cotação ou ambos (com itens) */
            <div className="p-3 sm:p-4 bg-blue-600/70 border-white/30 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  {formData.tipoSolicitacao === "cotacao" ? "Itens para Cotação" : "Itens para Cotação + Especificação"}
                </h3>
                <Button
                  type="button"
                  onClick={addItem}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-600/70 text-white hover:border-white/30 hover:border-blue-600 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            <div>
              {/* Layout mobile - Cards */}
              <div className="space-y-3 sm:hidden">
                {itens.map((item, index) => (
                  <Card key={index} className="bg-blue-600/70 border-white/30 hover:bg-blue-600/70  ">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-white">Item {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={itens.length === 1}
                          className="text-red-400 hover:text-red-300 hover:bg-red-600/70 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-white text-xs">Tipo de Item *</Label>
                        <Select
                          value={item.tipoItem || ""}
                          onValueChange={(value) => handleItemChange(index, "tipoItem", value)}
                        >
                          <SelectTrigger className="bg-blue-600/70 border-white/30 text-white">
                            <SelectValue placeholder="Selecione o tipo de item" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cadastrado">Item já cadastrado no Sankya</SelectItem>
                            <SelectItem value="novo">Item não cadastrado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Campos aparecem apenas após seleção do tipo */}
                      {item.tipoItem && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">
                              {item.tipoItem === "cadastrado" ? "Código Sankya *" : "Código do Fornecedor *"}
                            </Label>
                            <Input
                              value={item.codigoPeca}
                              onChange={(e) => handleItemChange(index, "codigoPeca", e.target.value)}
                              placeholder={item.tipoItem === "cadastrado" ? "Código Sankya" : "Código do fornecedor"}
                              className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Descrição *</Label>
                            <Input
                              value={item.descricao}
                              onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                              placeholder="Descrição da peça"
                              className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-white text-xs">Quantidade *</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) => handleItemChange(index, "quantidade", parseInt(e.target.value) || 1)}
                                className="bg-blue-600/70 border-white/30 text-white"
                              />
                            </div>
                            {/* Checkbox "Precisa Cadastro" apenas para itens não cadastrados */}
                            {item.tipoItem === "novo" && (
                              <div className="space-y-2">
                                <Label className="text-white text-xs">Precisa Cadastro</Label>
                                <div className="flex items-center justify-center h-10">
                                  <Checkbox
                                    checked={item.precisaCadastro || false}
                                    onCheckedChange={(checked) => handleItemChange(index, "precisaCadastro", !!checked)}
                                    className="border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Campos adicionais apenas para itens não cadastrados que precisam de cadastro */}
                          {item.tipoItem === "novo" && item.precisaCadastro && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label className="text-white text-xs">Aplicação</Label>
                                <Input
                                  value={item.aplicacao || ""}
                                  onChange={(e) => handleItemChange(index, "aplicacao", e.target.value)}
                                  placeholder="Aplicação"
                                  className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-white text-xs">Modelo</Label>
                                <Input
                                  value={item.modelo || ""}
                                  onChange={(e) => handleItemChange(index, "modelo", e.target.value)}
                                  placeholder="Modelo"
                                  className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-white text-xs">Nº Série</Label>
                                <Input
                                  value={item.numeroSerie || ""}
                                  onChange={(e) => handleItemChange(index, "numeroSerie", e.target.value)}
                                  placeholder="Nº Série"
                                  className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-white text-xs">OEM</Label>
                                <Input
                                  value={item.oem || ""}
                                  onChange={(e) => handleItemChange(index, "oem", e.target.value)}
                                  placeholder="OEM"
                                  className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                />
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label className="text-white text-xs">Observações</Label>
                            <Input
                              value={item.observacoes || ""}
                              onChange={(e) => handleItemChange(index, "observacoes", e.target.value)}
                              placeholder="Observações"
                              className="bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Layout desktop - Tabela */}
              <div className="hidden sm:block overflow-x-auto">
                {/* Verificar se algum item tem tipo selecionado para mostrar colunas dinâmicas */}
                {itens.some(item => item.tipoItem) ? (
                  <Table className="min-w-[1000px]">
                    <TableHeader>
                      <TableRow className="hover:!bg-transparent border-white/30">
                        <TableHead className="w-[180px] text-white px-2 sm:px-4 text-xs sm:text-sm">Tipo de Item *</TableHead>
                        <TableHead className="w-[150px] text-white px-2 sm:px-4 text-xs sm:text-sm">Código *</TableHead>
                        <TableHead className="min-w-[200px] text-white px-2 sm:px-4 text-xs sm:text-sm">Descrição *</TableHead>
                        <TableHead className="w-[100px] text-white px-2 sm:px-4 text-xs sm:text-sm">Qtd *</TableHead>
                        <TableHead className="w-[120px] text-white px-2 sm:px-4 text-xs sm:text-sm">Cadastro</TableHead>
                        <TableHead className="min-w-[150px] text-white px-2 sm:px-4 text-xs sm:text-sm">Observações</TableHead>
                        <TableHead className="w-[80px] text-white px-2 sm:px-4 text-xs sm:text-sm">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.map((item, index) => (
                        <React.Fragment key={index}>
                          <TableRow className="border-white/30 hover:bg-blue-600/70">
                          <TableCell className="px-2 sm:px-4">
                            <Select
                              value={item.tipoItem || ""}
                              onValueChange={(value) => handleItemChange(index, "tipoItem", value)}
                            >
                              <SelectTrigger className="bg-blue-600/70 border-white/30 text-white">
                                <SelectValue placeholder="Selecione tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cadastrado">Já cadastrado</SelectItem>
                                <SelectItem value="novo">Não cadastrado</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          {item.tipoItem ? (
                            <>
                              <TableCell className="px-2 sm:px-4">
                                <Input
                                  value={item.codigoPeca}
                                  onChange={(e) => handleItemChange(index, "codigoPeca", e.target.value)}
                                  placeholder={item.tipoItem === "cadastrado" ? "Código Sankya" : "Código fornecedor"}
                                  className="w-full bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                />
                              </TableCell>
                              <TableCell className="px-2 sm:px-4">
                                <Input
                                  value={item.descricao}
                                  onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                                  placeholder="Descrição da peça"
                                  className="w-full bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                />
                              </TableCell>
                              <TableCell className="px-2 sm:px-4">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantidade}
                                  onChange={(e) => handleItemChange(index, "quantidade", parseInt(e.target.value) || 1)}
                                  className="w-full bg-blue-600/70 border-white/30 text-white"
                                />
                              </TableCell>
                              <TableCell className="px-2 sm:px-4">
                                {item.tipoItem === "novo" ? (
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={item.precisaCadastro || false}
                                      onCheckedChange={(checked) => handleItemChange(index, "precisaCadastro", !!checked)}
                                      className="border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <span className="text-white/50 text-xs">N/A</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="px-2 sm:px-4">
                                <Input
                                  value={item.observacoes || ""}
                                  onChange={(e) => handleItemChange(index, "observacoes", e.target.value)}
                                  placeholder="Observações"
                                  className="w-full bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                />
                              </TableCell>
                            </>
                          ) : (
                            <TableCell colSpan={5} className="px-2 sm:px-4 text-center">
                              <span className="text-white/50 text-sm">Selecione o tipo de item para continuar</span>
                            </TableCell>
                          )}
                          <TableCell className="px-2 sm:px-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={itens.length === 1}
                              className="text-red-400 hover:text-red-300 hover:bg-red-600/70"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                          {/* Linha adicional para campos de cadastro apenas para itens não cadastrados que precisam de cadastro */}
                          {item.tipoItem === "novo" && item.precisaCadastro && (
                            <TableRow key={`${index}-cadastro`} className="border-white/30 bg-blue-600/50">
                              <TableCell colSpan={7} className="px-2 sm:px-4">
                                <div className="grid grid-cols-4 gap-2">
                                  <div>
                                    <Label className="text-white text-xs mb-1 block">Aplicação</Label>
                                    <Input
                                      value={item.aplicacao || ""}
                                      onChange={(e) => handleItemChange(index, "aplicacao", e.target.value)}
                                      placeholder="Aplicação"
                                      className="w-full bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-white text-xs mb-1 block">Modelo</Label>
                                    <Input
                                      value={item.modelo || ""}
                                      onChange={(e) => handleItemChange(index, "modelo", e.target.value)}
                                      placeholder="Modelo"
                                      className="w-full bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-white text-xs mb-1 block">Nº Série</Label>
                                    <Input
                                      value={item.numeroSerie || ""}
                                      onChange={(e) => handleItemChange(index, "numeroSerie", e.target.value)}
                                      placeholder="Nº Série"
                                      className="w-full bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-white text-xs mb-1 block">OEM</Label>
                                    <Input
                                      value={item.oem || ""}
                                      onChange={(e) => handleItemChange(index, "oem", e.target.value)}
                                      placeholder="OEM"
                                      className="w-full bg-blue-600/70 border-white/30 text-white placeholder:text-white/50"
                                    />
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Table className="min-w-[400px]">
                    <TableHeader>
                      <TableRow className="hover:!bg-transparent border-white/30">
                        <TableHead className="min-w-[250px] text-white px-2 sm:px-4 text-xs sm:text-sm">Tipo de Item *</TableHead>
                        <TableHead className="w-[80px] text-white px-2 sm:px-4 text-xs sm:text-sm">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.map((item, index) => (
                        <TableRow key={index} className="border-white/30 hover:bg-blue-600/70">
                          <TableCell className="px-2 sm:px-4">
                            <Select
                              value={item.tipoItem || ""}
                              onValueChange={(value) => handleItemChange(index, "tipoItem", value)}
                            >
                              <SelectTrigger className="bg-blue-600/70 border-white/30 text-white">
                                <SelectValue placeholder="Selecione o tipo de item" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cadastrado">Item já cadastrado no Sankya</SelectItem>
                                <SelectItem value="novo">Item não cadastrado</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-2 sm:px-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={itens.length === 1}
                              className="text-red-400 hover:text-red-300 hover:bg-red-600/70"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-blue-600/70 text-blue-600 hover:bg-blue-600/70 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-600/70 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Cotação
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 