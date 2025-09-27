"use client";

import React, { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Save, Calculator, Copy, Loader2 } from "lucide-react";
import { useCotacao, useCotacoes } from "@/hooks/use-cotacoes";
import { Id } from "@/convex/_generated/dataModel";
import { FileUpload } from "./file-upload";

interface CotacaoResponseModalProps {
  cotacaoId: Id<"cotacoes">;
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userId?: Id<"users">;
}

interface ItemResponse {
  itemId: Id<"cotacaoItens">;
  precoUnitario: string;
  prazoEntrega: string;
  fornecedor: string;
  observacoes: string;
  codigoSankhya: string; // Código Sankhya para itens que precisam de cadastro
}

export function CotacaoResponseModal({
  cotacaoId,
  isOpen,
  onClose,
  userRole,
  userId,
}: CotacaoResponseModalProps) {
  const { cotacao, isLoading } = useCotacao(cotacaoId);
  const { responderCotacao } = useCotacoes();
  
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [itensResposta, setItensResposta] = useState<ItemResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para upload de arquivos
  const [cotacaoFile, setCotacaoFile] = useState<File | null>(null);
  const [propostaTecnicaFile, setPropostaTecnicaFile] = useState<File | null>(null);
  const [isUploadingCotacao, setIsUploadingCotacao] = useState(false);
  const [isUploadingProposta, setIsUploadingProposta] = useState(false);

  // Inicializar respostas dos itens quando a cotação carregar
  useEffect(() => {
    if (cotacao?.itens) {
      setItensResposta(
        cotacao.itens.map(item => ({
          itemId: item._id,
          precoUnitario: item.precoUnitario?.toString() || "",
          prazoEntrega: item.prazoEntrega || "",
          fornecedor: item.fornecedor || "",
          observacoes: item.observacoes || "",
          codigoSankhya: item.codigoSankhya || "", // Inicializar com valor existente ou vazio
        }))
      );
    }
  }, [cotacao]);

  const updateItemResponse = (itemId: Id<"cotacaoItens">, field: keyof ItemResponse, value: string) => {
    setItensResposta(prev => 
      prev.map(item => 
        item.itemId === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = (quantidade: number, precoUnitario: string) => {
    const preco = parseFloat(precoUnitario) || 0;
    return (quantidade * preco).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getGrandTotal = () => {
    if (!cotacao?.itens) return "R$ 0,00";
    
    const total = cotacao.itens.reduce((sum, item) => {
      const resposta = itensResposta.find(r => r.itemId === item._id);
      const preco = parseFloat(resposta?.precoUnitario || "0") || 0;
      return sum + (item.quantidade * preco);
    }, 0);

    return total.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const copyToClipboard = async () => {
    if (!cotacao) return;

    let texto = `COTAÇÃO #${cotacao.numeroSequencial}\n`;
    texto += `********************************\n\n`;
    
    texto += `Data: ${new Date(cotacao.createdAt).toLocaleDateString('pt-BR')}\n\n`;
    
    texto += `ITENS SOLICITADOS:\n`;
    texto += `********************************\n`;
    
    cotacao.itens?.forEach((item, index) => {
      texto += `\n${index + 1}. ${item.codigoPeca}\n`;
      texto += `   ${item.descricao}\n`;
      texto += `   Quantidade: ${item.quantidade}\n`;
      if (item.observacoes) {
        texto += `   Observações: ${item.observacoes}\n`;
      }
    });
    
    if (cotacao.observacoes) {
      texto += `\nOBSERVAÇÕES GERAIS:\n`;
      texto += `${cotacao.observacoes}\n`;
    }
    
    texto += `\nPor favor, envie sua melhor cotação com preços e prazos de entrega.\n`;
    texto += `\nObrigado!`;

    try {
      await navigator.clipboard.writeText(texto);
      alert('Cotação copiada para a área de transferência!');
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Cotação copiada para a área de transferência!');
    }
  };

  const validateForm = () => {
    // Verificar se todos os itens têm preço
    for (const resposta of itensResposta) {
      const preco = parseFloat(resposta.precoUnitario);
      if (!resposta.precoUnitario || isNaN(preco) || preco <= 0) {
        return "Todos os itens devem ter um preço unitário válido";
      }
      
      // Verificar se itens que precisam de cadastro têm código Sankhya
      const item = cotacao?.itens?.find(i => i._id === resposta.itemId);
      if (item?.precisaCadastro && !resposta.codigoSankhya?.trim()) {
        return `O item "${item.codigoPeca} - ${item.descricao}" precisa de cadastro. Informe o código Sankhya correspondente.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
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
      // Atualizar estados de upload
      if (cotacaoFile) setIsUploadingCotacao(true);
      if (propostaTecnicaFile) setIsUploadingProposta(true);

      const itensFormatados = itensResposta.map(resposta => ({
        itemId: resposta.itemId,
        precoUnitario: parseFloat(resposta.precoUnitario),
        prazoEntrega: resposta.prazoEntrega || undefined,
        fornecedor: resposta.fornecedor || undefined,
        observacoes: resposta.observacoes || undefined,
        codigoSankhya: resposta.codigoSankhya || undefined,
      }));

      await responderCotacao(
        cotacaoId,
        userId,
        itensFormatados,
        observacoesGerais || undefined,
        cotacaoFile || undefined,
        propostaTecnicaFile || undefined
      );

      onClose();
    } catch (error) {
      console.error("Erro ao responder cotação:", error);
    } finally {
      setIsSubmitting(false);
      setIsUploadingCotacao(false);
      setIsUploadingProposta(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full bg-blue-600/70 border-white/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Carregando Cotação
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando dados da cotação...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!cotacao) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full bg-blue-600/70 border-white/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Erro
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-red-300">Cotação não encontrada.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full bg-blue-600/70 border-white/30 text-white p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="break-words">Responder Cotação #{cotacao.numeroSequencial}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                     {/* Informações da Cotação */}
           <div className="p-3 sm:p-4 bg-blue-600/70 border border-white/30 rounded-lg">
             <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Informações da Cotação</h3>
             <div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                 {cotacao.numeroOS && (
                   <div>
                     <Label className="text-sm font-medium text-white">Número da OS</Label>
                     <p className="mt-1 font-mono text-white font-semibold">{cotacao.numeroOS}</p>
                   </div>
                 )}
                 {cotacao.numeroOrcamento && (
                   <div>
                     <Label className="text-sm font-medium text-white">Número do Orçamento</Label>
                     <p className="mt-1 font-mono text-white font-semibold">{cotacao.numeroOrcamento}</p>
                   </div>
                 )}
                 {cotacao.cliente && (
                   <div>
                     <Label className="text-sm font-medium text-white">Cliente</Label>
                     <p className="mt-1 text-white font-semibold">{cotacao.cliente}</p>
                   </div>
                 )}
               </div>
               <div className="mt-4">
                 <Label className="text-sm font-medium text-white">Solicitante</Label>
                 <p className="mt-1 text-white font-semibold">{cotacao.solicitante?.name}</p>
               </div>
            </div>
          </div>

          {/* Itens para Cotação */}
          <div className="p-3 sm:p-4 bg-blue-600/70 border border-white/30 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
               <h3 className="text-base sm:text-lg font-semibold text-white">Itens para Cotação</h3>
               <div className="flex items-center gap-2 bg-blue-600/70 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                 <Calculator className="h-4 w-4 text-white" />
                 <span className="text-base sm:text-lg font-bold text-white">
                   Total: {getGrandTotal()}
                 </span>
               </div>
             </div>
            
            {/* Verificar se algum item precisa de cadastro */}
            {cotacao.itens?.some(item => item.precisaCadastro) && (
              <div className="mb-4 p-3 bg-blue-600/70 border border-white/30 rounded-lg">
                <p className="text-white text-sm">
                  <strong>⚠️ Atenção:</strong> Alguns itens marcados como "Cadastro" requerem o código Sankhya obrigatório. 
                  Estes códigos devem ser informados para que a cotação possa ser respondida.
                </p>
              </div>
            )}
            
            <div>
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                                     <TableHeader>
                     <TableRow className="hover:!bg-transparent border-blue-700">
                       <TableHead className="min-w-[120px] text-white font-semibold px-2 sm:px-4 text-xs sm:text-sm">Código</TableHead>
                       <TableHead className="min-w-[200px] text-white font-semibold px-2 sm:px-4 text-xs sm:text-sm">Descrição</TableHead>
                       <TableHead className="w-20 text-white font-semibold px-2 sm:px-4 text-xs sm:text-sm">Qtd</TableHead>
                       <TableHead className="w-32 text-white font-semibold px-2 sm:px-4 text-xs sm:text-sm">Preço Unit. *</TableHead>
                       <TableHead className="w-32 text-white font-semibold px-2 sm:px-4 text-xs sm:text-sm">Total</TableHead>
                       <TableHead className="min-w-[120px] text-white font-semibold px-2 sm:px-4 text-xs sm:text-sm">Prazo</TableHead>
                       <TableHead className="min-w-[150px] text-white font-semibold px-2 sm:px-4 text-xs sm:text-sm">Fornecedor</TableHead>
                       <TableHead className="min-w-[120px] text-white font-semibold px-2 sm:px-4 text-xs sm:text-sm">Cód. Sankhya</TableHead>
                       <TableHead className="min-w-[150px] text-white font-semibold px-2 sm:px-4 text-xs sm:text-sm">Observações</TableHead>
                     </TableRow>
                   </TableHeader>
                  <TableBody>
                    {cotacao.itens?.map((item, index) => {
                      const resposta = itensResposta.find(r => r.itemId === item._id);
                                             return (
                         <TableRow key={item._id} className="border-white/30 hover:bg-blue-600/70">
                           <TableCell className="font-mono font-semibold text-white px-2 sm:px-4 text-xs sm:text-sm">
                             {item.codigoPeca}
                           </TableCell>
                           <TableCell className="text-white px-2 sm:px-4 text-xs sm:text-sm">
                             {item.descricao}
                             {item.precisaCadastro && (
                               <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/70 text-white border border-white/30">
                                 Cadastro
                               </span>
                             )}
                           </TableCell>
                           <TableCell className="text-center font-semibold text-white px-2 sm:px-4 text-xs sm:text-sm">
                             {item.quantidade}
                           </TableCell>
                                                     <TableCell className="px-2 sm:px-4">
                             <Input
                               type="number"
                               step="0.01"
                               min="0"
                               placeholder="0,00"
                               value={resposta?.precoUnitario || ""}
                               onChange={(e) => updateItemResponse(item._id, "precoUnitario", e.target.value)}
                               className="w-full bg-blue-600/70 border-white/30 text-white"
                               required
                             />
                           </TableCell>
                           <TableCell className="font-semibold text-white bg-blue-600/70">
                             {calculateTotal(item.quantidade, resposta?.precoUnitario || "0")}
                           </TableCell>
                                                     <TableCell className="px-2 sm:px-4">
                             <Input
                               placeholder="Ex: 15 dias"
                               value={resposta?.prazoEntrega || ""}
                               onChange={(e) => updateItemResponse(item._id, "prazoEntrega", e.target.value)}
                               className="w-full bg-blue-600/70 border-white/30 text-white"
                             />
                           </TableCell>
                           <TableCell className="px-2 sm:px-4">
                             <Input
                               placeholder="Nome do fornecedor"
                               value={resposta?.fornecedor || ""}
                               onChange={(e) => updateItemResponse(item._id, "fornecedor", e.target.value)}
                               className="w-full bg-blue-600/70 border-white/30 text-white"
                             />
                           </TableCell>
                           <TableCell>
                             {item.precisaCadastro ? (
                               <Input
                                 placeholder="Código Sankhya *"
                                 value={resposta?.codigoSankhya || ""}
                                 onChange={(e) => updateItemResponse(item._id, "codigoSankhya", e.target.value)}
                                 className="w-full bg-blue-600/70 border-white/30 text-white"
                                 required
                               />
                             ) : (
                               <span className="text-blue-400 text-sm">-</span>
                             )}
                           </TableCell>
                           <TableCell className="px-2 sm:px-4">
                             <Input
                               placeholder="Observações"
                               value={resposta?.observacoes || ""}
                               onChange={(e) => updateItemResponse(item._id, "observacoes", e.target.value)}
                               className="w-full bg-blue-600/70 border-white/30 text-white"
                             />
                           </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

                     {/* Observações Gerais */}
           <div className="p-4 bg-blue-600/70 border border-white/30 rounded-lg">
             <h3 className="text-lg font-semibold text-white mb-4">Observações Gerais</h3>
             <div>
               <Textarea
                 placeholder="Observações gerais sobre a cotação respondida..."
                 value={observacoesGerais}
                 onChange={(e) => setObservacoesGerais(e.target.value)}
                 rows={4}
                 className="bg-blue-600/70 border-white/30 text-white"
               />
             </div>
           </div>

          {/* Upload de Arquivos */}
          <div className="p-4 bg-blue-600/70 border border-white/30 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Anexos da Resposta</h3>
            <div className="space-y-4">
              <p className="text-sm text-white mb-4">
                Você pode anexar um PDF com a cotação detalhada e/ou uma proposta técnica/catálogo. 
                Os arquivos são opcionais, mas recomendamos anexar pelo menos a cotação para melhor documentação.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Upload de Cotação */}
                <FileUpload
                  label="Cotação (PDF)"
                  accept=".pdf"
                  maxSizeMB={10}
                  onFileSelect={setCotacaoFile}
                  selectedFile={cotacaoFile}
                  isUploading={isUploadingCotacao}
                  placeholder="PDF com cotação detalhada"
                />

                {/* Upload de Proposta Técnica */}
                <FileUpload
                  label="Proposta Técnica / Catálogo"
                  accept=".pdf"
                  maxSizeMB={10}
                  onFileSelect={setPropostaTecnicaFile}
                  selectedFile={propostaTecnicaFile}
                  isUploading={isUploadingProposta}
                  placeholder="PDF com especificações técnicas"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={copyToClipboard}
              disabled={isSubmitting}
              className="border-blue-600 text-blue-600 hover:bg-blue-600/70 hover:text-blue-100"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Cotação
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-blue-600 text-blue-600 hover:bg-blue-600/70 hover:text-blue-100"
            >
              Cancelar
            </Button>
                         <Button
               type="submit"
               disabled={isSubmitting}
               className="bg-blue-600 hover:bg-blue-600/70 text-white font-semibold"
             >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/30 mr-2"></div>
                  Enviando Resposta...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enviar Resposta
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 