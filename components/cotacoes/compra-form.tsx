"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Upload, FileText, X, ShoppingCart, Package } from "lucide-react";


interface CompraFormProps {
  isOpen: boolean;
  onClose: () => void;  
}

type FlowType = "nova_compra" | "ja_comprada" | null;

interface CompraData {
  codigo: string;
  descricao: string;
  marca?: string;
  fornecedor?: string;
  valor?: number;
  numeroOrcamento?: string;
  dataCompra?: string;
  observacoes?: string;
}

export function CompraForm({ isOpen, onClose }: CompraFormProps) {
  const [flowType, setFlowType] = useState<FlowType>(null);
  const [compraData, setCompraData] = useState<CompraData>({
    codigo: "",
    descricao: "",
    marca: "",
    fornecedor: "",
    valor: undefined,
    numeroOrcamento: "",
    dataCompra: "",
    observacoes: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFlowSelection = (type: FlowType) => {
    setFlowType(type);
  };

  const updateCompraData = (field: keyof CompraData, value: string | number) => {
    setCompraData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!compraData.codigo.trim() || !compraData.descricao.trim()) {
      toast.error("Código e descrição são obrigatórios");
      return;
    }



    setIsSubmitting(true);

    try {
      let fileStorageId: string | undefined = undefined;

      // Se há arquivo, fazer upload
      if (selectedFile) {
        const uploadUrl = ""; // TODO: Implementar

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });

        if (!result.ok) {
          throw new Error("Falha no upload do arquivo");
        }

        const { storageId } = await result.json();
        fileStorageId = storageId;
      }

      // Determinar status baseado no fluxo
      const status = flowType === "ja_comprada" ? "comprada" : "novo";

      // Criar observações combinadas
      const observacoesCombinadas = [
        flowType === "ja_comprada" ? "ITEM JÁ COMPRADO - Registro para acompanhamento" : "NOVA COMPRA - Para cotação",
        compraData.fornecedor ? `Fornecedor: ${compraData.fornecedor}` : "",
        compraData.valor ? `Valor: R$ ${compraData.valor.toFixed(2)}` : "",
        compraData.numeroOrcamento ? `Nº Orçamento: ${compraData.numeroOrcamento}` : "",
        compraData.dataCompra ? `Data da Compra: ${new Date(compraData.dataCompra).toLocaleDateString('pt-BR')}` : "",
        compraData.observacoes ? compraData.observacoes.trim() : ""
      ].filter(Boolean).join(" | ");

      const result = { // TODO: Implementar
        codigo: compraData.codigo.trim(),
        descricao: compraData.descricao.trim(),
        marca: compraData.marca?.trim() || undefined,
        observacoes: observacoesCombinadas || undefined,
        anexoStorageId: fileStorageId as any,
        anexoNome: selectedFile?.name,
        status: status as any
      };

      if (flowType === "ja_comprada") {
        toast.success(`Registro #${result.codigo} criado com sucesso! Item registrado para acompanhamento.`);
      } else {
        toast.success(`Cotação #${result.codigo} criada com sucesso! O setor de compras será notificado.`);
      }

      handleClose();
    } catch (error) {
      console.error("Erro ao processar compra:", error);
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é PDF
      if (file.type !== "application/pdf") {
        toast.error("Por favor, selecione apenas arquivos PDF");
        e.target.value = "";
        return;
      }

      // Verificar tamanho (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 10MB");
        e.target.value = "";
        return;
      }

      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFlowType(null);
      setCompraData({
        codigo: "",
        descricao: "",
        marca: "",
        fornecedor: "",
        valor: undefined,
        numeroOrcamento: "",
        dataCompra: "",
        observacoes: ""
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-green-500/70 border-white/30 text-white p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            Compras
          </DialogTitle>
          <DialogDescription className="text-green-200">
            {!flowType ?
              "Selecione se o item já foi comprado ou se é uma nova compra para cotação." :
              flowType === "ja_comprada" ?
                "Registrar item já comprado para acompanhamento." :
                "Registrar nova compra para cotação."
            }
          </DialogDescription>
        </DialogHeader>

        {!flowType ? (
          // Seleção do tipo de fluxo
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                O item já foi comprado?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => handleFlowSelection("nova_compra")}
                variant="outline"
                className="h-24 border-green-600 text-green-600 hover:bg-green-50 font-semibold flex-col gap-2"
                disabled={isSubmitting}
              >
                <Package className="h-8 w-8" />
                <span>Não, precisa cotar</span>
                <span className="text-sm opacity-75">Nova compra</span>
              </Button>

              <Button
                onClick={() => handleFlowSelection("ja_comprada")}
                variant="outline"
                className="h-24 border-green-600 text-green-600 hover:bg-green-50 font-semibold flex-col gap-2"
                disabled={isSubmitting}
              >
                <ShoppingCart className="h-8 w-8" />
                <span>Sim, já comprei</span>
                <span className="text-sm opacity-75">Registrar para acompanhamento</span>
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-white/30 text-green-600 hover:bg-white/10 hover:border-white/30 hover:border-green-600 hover:text-white"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          // Formulário baseado no fluxo selecionado
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-green-600/70 p-3 rounded-lg border border-white/30">
              <div className="flex items-center gap-2 mb-2">
                {flowType === "ja_comprada" ?
                  <ShoppingCart className="h-4 w-4 text-green-200" /> :
                  <Package className="h-4 w-4 text-green-200" />
                }
                <span className="text-sm font-medium text-green-200">
                  {flowType === "ja_comprada" ? "Item já comprado" : "Nova compra"}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFlowType(null)}
                className="text-green-300 hover:text-green-200 hover:bg-green-600/50"
                disabled={isSubmitting}
              >
                ← Voltar para seleção
              </Button>
            </div>

            {/* Campos obrigatórios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-green-200 text-sm">
                  Código <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={compraData.codigo}
                  onChange={(e) => updateCompraData("codigo", e.target.value)}
                  placeholder="Ex: ABC123"
                  disabled={isSubmitting}
                  className="bg-green-600/50 border-white/30 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-200 text-sm">Marca</Label>
                <Input
                  value={compraData.marca}
                  onChange={(e) => updateCompraData("marca", e.target.value)}
                  placeholder="Ex: Bosch, SKF"
                  disabled={isSubmitting}
                  className="bg-green-600/50 border-white/30 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-green-200 text-sm">
                Descrição <span className="text-red-400">*</span>
              </Label>
              <Textarea
                value={compraData.descricao}
                onChange={(e) => updateCompraData("descricao", e.target.value)}
                placeholder="Descrição detalhada do item"
                disabled={isSubmitting}
                rows={3}
                className="bg-green-600/50 border-white/30 text-white placeholder:text-white/50"
              />
            </div>

            {/* Campos específicos para item já comprado */}
            {flowType === "ja_comprada" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-green-200 text-sm">Fornecedor</Label>
                    <Input
                      value={compraData.fornecedor}
                      onChange={(e) => updateCompraData("fornecedor", e.target.value)}
                      placeholder="Nome do fornecedor"
                      disabled={isSubmitting}
                      className="bg-green-600/50 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-200 text-sm">Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={compraData.valor || ""}
                      onChange={(e) => updateCompraData("valor", parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      disabled={isSubmitting}
                      className="bg-green-600/50 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-green-200 text-sm">Nº Orçamento</Label>
                    <Input
                      value={compraData.numeroOrcamento}
                      onChange={(e) => updateCompraData("numeroOrcamento", e.target.value)}
                      placeholder="Número do orçamento"
                      disabled={isSubmitting}
                      className="bg-green-600/50 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-200 text-sm">Data da Compra</Label>
                    <Input
                      type="date"
                      value={compraData.dataCompra}
                      onChange={(e) => updateCompraData("dataCompra", e.target.value)}
                      disabled={isSubmitting}
                      className="bg-green-600/50 border-white/30 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="text-green-200 text-sm">Observações</Label>
              <Textarea
                value={compraData.observacoes}
                onChange={(e) => updateCompraData("observacoes", e.target.value)}
                placeholder={flowType === "ja_comprada" ?
                  "Informações sobre a compra, entrega, etc..." :
                  "Observações sobre a cotação necessária..."
                }
                disabled={isSubmitting}
                rows={2}
                className="bg-green-600/50 border-white/30 text-white placeholder:text-white/50"
              />
            </div>

            {/* Upload de arquivo */}
            <div className="space-y-2">
              <Label className="text-green-200">Anexar PDF (Opcional)</Label>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="hidden"
                />

                {!selectedFile ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="w-full border-white/30 text-green-600 hover:bg-white/10 hover:border-white/30 hover:border-green-600 hover:text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar PDF
                  </Button>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-600/70 border border-white/30 rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-green-200 mr-2" />
                      <span className="text-sm text-white truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-green-200 ml-2">
                        ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      disabled={isSubmitting}
                      className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="border-white/30 text-green-600 hover:bg-white/10 hover:border-white/30 hover:border-green-600 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-white/30 hover:border-green-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {flowType === "ja_comprada" ? "Registrando..." : "Criando Cotação..."}
                  </>
                ) : (
                  flowType === "ja_comprada" ? "Registrar Item" : "Criar Cotação"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}