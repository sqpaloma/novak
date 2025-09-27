"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Package, Plus, Trash2 } from "lucide-react";

interface ItemComprado {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacoes: string;
}

interface JaCompreiFormProps {
  isOpen: boolean;
  onClose: () => void;
  solicitanteId?: string;
}

export function JaCompreiForm({ isOpen, onClose, solicitanteId }: JaCompreiFormProps) {
  const [fornecedor, setFornecedor] = useState("");
  const [numeroOrcamento, setNumeroOrcamento] = useState("");
  const [dataCompra, setDataCompra] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [prazoEntrega, setPrazoEntrega] = useState("");
  const [itens, setItens] = useState<ItemComprado[]>([
    {
      id: "1",
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      observacoes: "",
    },
  ]);
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [anexos, setAnexos] = useState<File[]>([]);

  const adicionarItem = () => {
    const newItem: ItemComprado = {
      id: Date.now().toString(),
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      observacoes: "",
    };
    setItens([...itens, newItem]);
  };

  const removerItem = (id: string) => {
    if (itens.length > 1) {
      setItens(itens.filter(item => item.id !== id));
    }
  };

  const atualizarItem = (id: string, field: keyof ItemComprado, value: string | number) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Recalcular valor total quando quantidade ou valor unitário mudam
        if (field === "quantidade" || field === "valorUnitario") {
          updatedItem.valorTotal = updatedItem.quantidade * updatedItem.valorUnitario;
        }

        return updatedItem;
      }
      return item;
    }));
  };

  const calcularValorTotalGeral = () => {
    return itens.reduce((total, item) => total + item.valorTotal, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAnexos([...anexos, ...newFiles]);
    }
  };

  const removerAnexo = (index: number) => {
    setAnexos(anexos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!fornecedor.trim()) {
      alert("Fornecedor é obrigatório");
      return;
    }

    if (!numeroOrcamento.trim()) {
      alert("Número do orçamento é obrigatório");
      return;
    }

    if (!itens.some(item => item.descricao.trim())) {
      alert("Pelo menos um item deve ter descrição");
      return;
    }

    // Aqui implementaria a lógica para salvar no banco
    console.log("Dados da compra realizada:", {
      fornecedor,
      numeroOrcamento,
      dataCompra,
      formaPagamento,
      prazoEntrega,
      itens,
      observacoesGerais,
      anexos: anexos.map(file => file.name),
      valorTotalGeral: calcularValorTotalGeral(),
      solicitanteId,
      tipo: "ja_comprei"
    });

    alert("Registro de compra realizada salvo com sucesso!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/25" onClick={onClose} />

        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-500/30">
            <div className="flex items-center">
              <Plus className="h-6 w-6 text-white mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  + Já Comprei
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 text-white">
            {/* Informações da Compra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Fornecedor *
                </label>
                <Input
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                  placeholder="Nome do fornecedor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Número do Orçamento *
                </label>
                <Input
                  value={numeroOrcamento}
                  onChange={(e) => setNumeroOrcamento(e.target.value)}
                  placeholder="Ex: ORC-2024-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Data da Compra
                </label>
                <Input
                  type="date"
                  value={dataCompra}
                  onChange={(e) => setDataCompra(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Forma de Pagamento
                </label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full border-blue-400/30 bg-blue-600/30 text-white placeholder-blue-200 focus:ring-blue-400 focus:border-blue-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="boleto">Boleto</option>
                  <option value="pix">PIX</option>
                  <option value="transferencia">Transferência</option>
                  <option value="cartao">Cartão</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="prazo">A prazo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Prazo de Entrega
                </label>
                <Input
                  value={prazoEntrega}
                  onChange={(e) => setPrazoEntrega(e.target.value)}
                  placeholder="Ex: 15 dias, 30/10/2024"
                />
              </div>
            </div>

            {/* Lista de Itens Comprados */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Itens Comprados</h3>
                <Button
                  type="button"
                  onClick={adicionarItem}
                  variant="outline"
                  size="sm"
                  className="text-white border-blue-400/50 hover:bg-blue-500/30 bg-blue-500/20"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Item
                </Button>
              </div>

              {itens.map((item, index) => (
                <div key={item.id} className="border border-blue-400/30 bg-blue-600/20 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Item {index + 1}</h4>
                    {itens.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerItem(item.id)}
                        className="text-red-300 hover:text-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Descrição do Item *
                      </label>
                      <Textarea
                        value={item.descricao}
                        onChange={(e) => atualizarItem(item.id, "descricao", e.target.value)}
                        placeholder="Descreva o item comprado..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Quantidade *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => atualizarItem(item.id, "quantidade", parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Valor Unitário (R$) *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.valorUnitario}
                          onChange={(e) => atualizarItem(item.id, "valorUnitario", parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Valor Total (R$)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.valorTotal.toFixed(2)}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Observações do Item
                    </label>
                    <Textarea
                      value={item.observacoes}
                      onChange={(e) => atualizarItem(item.id, "observacoes", e.target.value)}
                      placeholder="Observações sobre este item..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Upload de Anexos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Anexos (Print do orçamento, nota fiscal, etc.)
              </label>
              <div className="border-2 border-dashed border-blue-400/30 bg-blue-600/30 text-white placeholder-blue-200 focus:ring-blue-400 focus:border-blue-400 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">
                      Clique para fazer upload
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF, DOC até 10MB cada
                  </p>
                </div>

                {anexos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {anexos.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-500/30 border border-blue-400/30 p-2 rounded">
                        <span className="text-sm text-white">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removerAnexo(index)}
                          className="text-red-300 hover:text-red-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Observações Gerais */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Observações Gerais
              </label>
              <Textarea
                value={observacoesGerais}
                onChange={(e) => setObservacoesGerais(e.target.value)}
                placeholder="Observações sobre a compra em geral..."
                rows={3}
              />
            </div>

            {/* Valor Total */}
            <div className="mb-6 bg-blue-500/30 border border-blue-400/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-white">Valor Total Geral:</span>
                <span className="text-xl font-bold text-blue-600">
                  R$ {calcularValorTotalGeral().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="sm:w-auto text-white border-blue-400/50 hover:bg-blue-500/30"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold sm:w-auto"
              >
                Criar Registro
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}