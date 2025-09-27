"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from "lucide-react";

interface PecaCompraDirecta {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  fornecedor: string;
  observacoes: string;
}

interface CompraDirectaFormProps {
  isOpen: boolean;
  onClose: () => void;
  solicitanteId?: string;
}

export function CompraDirectaForm({ isOpen, onClose, solicitanteId }: CompraDirectaFormProps) {
  const [pecas, setPecas] = useState<PecaCompraDirecta[]>([
    {
      id: "1",
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      fornecedor: "",
      observacoes: "",
    },
  ]);

  const [justificativa, setJustificativa] = useState("");
  const [urgencia, setUrgencia] = useState("normal");

  const adicionarPeca = () => {
    const newPeca: PecaCompraDirecta = {
      id: Date.now().toString(),
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      fornecedor: "",
      observacoes: "",
    };
    setPecas([...pecas, newPeca]);
  };

  const removerPeca = (id: string) => {
    if (pecas.length > 1) {
      setPecas(pecas.filter(peca => peca.id !== id));
    }
  };

  const atualizarPeca = (id: string, field: keyof PecaCompraDirecta, value: string | number) => {
    setPecas(pecas.map(peca =>
      peca.id === id ? { ...peca, [field]: value } : peca
    ));
  };

  const calcularValorTotal = () => {
    return pecas.reduce((total, peca) => total + (peca.quantidade * peca.valorUnitario), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!pecas.some(peca => peca.descricao.trim())) {
      alert("Pelo menos uma peça deve ter descrição");
      return;
    }

    // Aqui implementaria a lógica para salvar no banco
    console.log("Dados da compra direta:", {
      pecas,
      justificativa,
      urgencia,
      valorTotal: calcularValorTotal(),
      solicitanteId,
      tipo: "compra_direta"
    });

    alert("Compra direta registrada com sucesso!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/25" onClick={onClose} />

        <div className="relative rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-blue-600/70">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/30">
            <div className="flex items-center">
              <Plus className="h-6 w-6 text-white mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Compra Direta
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
            {/* Justificativa para compra direta */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Justificativa para Compra Direta *
              </label>
              <Textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Descreva por que esta compra precisa ser feita diretamente sem cotação..."
                className="w-full bg-gray-600/30 border-blue-400/30 text-white placeholder-white "
                rows={3}
                required
              />
            </div>

            {/* Urgência */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Nível de Urgência
              </label>
              <select
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value)}
                className="w-full bg-blue-600/30 border-blue-400/30 text-white focus:ring-blue-400 focus:border-blue-400 rounded-md"
              >
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
                <option value="critico">Crítico</option>
              </select>
            </div>

            {/* Lista de Peças */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Informações das Peças</h3>
                <Button
                  type="button"
                  onClick={adicionarPeca}
                  variant="outline"
                  size="sm"
                  className="text-white border-blue-400/50 hover:bg-blue-500/30 bg-blue-500/20"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Peça
                </Button>
              </div>

              {pecas.map((peca, index) => (
                <div key={peca.id} className="border border-blue-400/30 rounded-lg p-4 space-y-4 bg-blue-600/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Peça {index + 1}</h4>
                    {pecas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerPeca(peca.id)}
                        className="text-red-300 hover:text-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Descrição da Peça *
                      </label>
                      <Textarea
                        value={peca.descricao}
                        onChange={(e) => atualizarPeca(peca.id, "descricao", e.target.value)}
                        placeholder="Descreva a peça com detalhes..."
                        className="bg-blue-600/30 border-blue-400/30 text-white placeholder-blue-200 focus:ring-blue-400 focus:border-blue-400"
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
                          value={peca.quantidade}
                          onChange={(e) => atualizarPeca(peca.id, "quantidade", parseInt(e.target.value) || 1)}
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder-blue-200 focus:ring-blue-400 focus:border-blue-400"
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
                          value={peca.valorUnitario}
                          onChange={(e) => atualizarPeca(peca.id, "valorUnitario", parseFloat(e.target.value) || 0)}
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder-blue-200 focus:ring-blue-400 focus:border-blue-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Fornecedor *
                        </label>
                        <Input
                          value={peca.fornecedor}
                          onChange={(e) => atualizarPeca(peca.id, "fornecedor", e.target.value)}
                          placeholder="Nome do fornecedor"
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder-blue-200 focus:ring-blue-400 focus:border-blue-400"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Observações
                    </label>
                    <Textarea
                      value={peca.observacoes}
                      onChange={(e) => atualizarPeca(peca.id, "observacoes", e.target.value)}
                      placeholder="Observações adicionais sobre esta peça..."
                      className="bg-blue-600/30 border-blue-400/30 text-white placeholder-blue-200 focus:ring-blue-400 focus:border-blue-400"
                      rows={2}
                    />
                  </div>

                  <div className="bg-blue-500/30 p-3 rounded-md border border-blue-400/30">
                    <p className="text-sm font-medium text-white">
                      Subtotal: R$ {(peca.quantidade * peca.valorUnitario).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Valor Total */}
            <div className="mt-6 bg-blue-500/30 p-4 rounded-lg border border-blue-400/30">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-white">Valor Total:</span>
                <span className="text-xl font-bold text-white">
                  R$ {calcularValorTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botões */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
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
                className="bg-white text-blue-700 hover:bg-blue-50 sm:w-auto font-semibold"
              >
                Criar Compra Direta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}