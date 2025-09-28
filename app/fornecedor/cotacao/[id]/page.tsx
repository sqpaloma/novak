"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, LogOut, ArrowLeft, User, Calendar, Package, Send } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";



export default function FornecedorCotacaoDetailsPage() {
  const [fornecedorData, setFornecedorData] = useState<any | null>(null);
  const [respostas, setRespostas] = useState<Record<string, { precoUnitario: string; prazoEntrega: string; observacoes: string }>>({});
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const cotacaoId = params?.id as any;

  const responderCotacao = () => {};

  // Verificar autenticação e carregar dados do fornecedor
  useEffect(() => {
    const data = localStorage.getItem("fornecedor");
    if (!data) {
      router.push("/auth");
      return;
    }

    try {
      const parsed = JSON.parse(data);
      setFornecedorData(parsed);
    } catch {
      router.push("/auth");
    }
  }, [router]);

  // Buscar detalhes da cotação
  const cotacaoDetails: any = [];

  const handleLogout = () => {
    localStorage.removeItem("fornecedor");
    router.push("/auth");
  };

  const handleRespostaChange = (itemId: string, field: string, value: string) => {
    setRespostas(prev => ({
      ...prev,
      [itemId]: {
        precoUnitario: prev[itemId]?.precoUnitario || "",
        prazoEntrega: prev[itemId]?.prazoEntrega || "",
        observacoes: prev[itemId]?.observacoes || "",
        [field]: value
      }
    }));
  };

  const handleSubmitResposta = async () => {
    if (!fornecedorData || !cotacaoDetails) return;

    setIsSubmitting(true);
    try {
      const itensResposta = Object.entries(respostas).map(([itemId, resposta]) => ({
        itemId: itemId as any,
        precoUnitario: resposta.precoUnitario ? parseFloat(resposta.precoUnitario) : undefined,
        prazoEntrega: resposta.prazoEntrega || undefined,
        observacoes: resposta.observacoes || undefined,
      })).filter(item =>
        item.precoUnitario !== undefined ||
        item.prazoEntrega !== undefined ||
        item.observacoes !== undefined
      );

      await responderCotacao();

      toast.success("Cotação respondida com sucesso!");
      router.push("/fornecedor/cotacoes");
    } catch (error) {
      console.error("Erro ao responder cotação:", error);
      toast.error("Erro ao responder cotação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      novo: { label: "Nova", color: "bg-blue-100 text-blue-800" },
      em_cotacao: { label: "Em Cotação", color: "bg-yellow-100 text-yellow-800" },
      respondida: { label: "Respondida", color: "bg-green-100 text-green-800" },
      aprovada_para_compra: { label: "Aprovada", color: "bg-purple-100 text-purple-800" },
      comprada: { label: "Comprada", color: "bg-green-100 text-green-800" },
      cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
    };

    const config = statusMap[status as keyof typeof statusMap] || { label: status, color: "bg-gray-100 text-gray-800" };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTipoSolicitacaoBadge = (tipo: string) => {
    const tipoMap = {
      cotacao: { label: "Cotação", color: "bg-blue-100 text-blue-800" },
      especificacao_tecnica: { label: "Especificação Técnica", color: "bg-green-100 text-green-800" },
      ambos: { label: "Cotação + Especificação", color: "bg-purple-100 text-purple-800" },
    };

    const config = tipoMap[tipo as keyof typeof tipoMap] || { label: tipo, color: "bg-gray-100 text-gray-800" };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!fornecedorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!cotacaoDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600/20 p-2 rounded-lg">
                <Image
                src="/logo.png"
                alt="Novak & Gouveia"
                width={48}
                height={48}
                className="rounded-full border-2 border-green-400 bg-blue-700 object-cover"
                priority
              />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Novak & Gouveia</h1>
                  <p className="text-white/70">Portal do Fornecedor</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white/70 text-sm">{fornecedorData.nomeEmpresa}</span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-white/30 text-blue-600 hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Carregando detalhes da cotação...</p>
          </div>
        </div>
      </div>
    );
  }

  const { cotacao, itens, solicitante } = cotacaoDetails as any;
  const podeResponder = ["novo", "em_cotacao"].includes(cotacao.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Image
                src="/logo.png"
                alt="Novak & Gouveia"
                width={48}
                height={48}
                className="rounded-full border-2 border-green-400 bg-blue-700 object-cover"
                priority
              />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Novak & Gouveia</h1>
                <p className="text-white/70">Portal do Fornecedor</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/70 text-sm">{fornecedorData.nomeEmpresa}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-white/30 text-blue-600 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => router.push("/fornecedor/cotacoes")}
          variant="outline"
          className="mb-6 border-white/30 hover:bg-white/1 text-blue-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cotações
        </Button>

        {/* Cotação Info */}
        <Card className="bg-white/10 border-white/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cotação #{cotacao.numeroSequencial}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {getTipoSolicitacaoBadge(cotacao.tipoSolicitacao || "")}
                {getStatusBadge(cotacao.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                

                {solicitante && (
                  <div className="flex items-center space-x-2 text-white">
                    <User className="h-4 w-4 text-white/70" />
                    <div>
                      <p className="text-white/70 text-sm">Solicitante</p>
                      <p className="font-medium">{solicitante.nome}</p>
                      <p className="text-white/70 text-xs">{solicitante.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-white">
                  <Calendar className="h-4 w-4 text-white/70" />
                  <div>
                    <p className="text-white/70 text-sm">Data da Solicitação</p>
                    <p className="font-medium">{formatDate(cotacao.createdAt)}</p>
                  </div>
                </div>

                {cotacao.dataResposta && (
                  <div className="flex items-center space-x-2 text-white">
                    <Calendar className="h-4 w-4 text-white/70" />
                    <div>
                      <p className="text-white/70 text-sm">Data de Resposta</p>
                      <p className="font-medium">{formatDate(cotacao.dataResposta)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-white">
                  <Package className="h-4 w-4 text-white/70" />
                  <div>
                    <p className="text-white/70 text-sm">Total de Itens</p>
                    <p className="font-medium">{itens.length} {itens.length === 1 ? "item" : "itens"}</p>
                  </div>
                </div>
              </div>
            </div>

            {cotacao.observacoes && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <p className="text-white/70 text-sm mb-1">Observações</p>
                <p className="text-white">{cotacao.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itens da Cotação */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5" />
              {podeResponder ? "Responder Cotação" : "Itens da Cotação"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {podeResponder ? (
              // Formulário de resposta
              <div className="space-y-4">
                {itens.map((item: any) => (
                  <Card key={item._id} className="bg-white/5 border-white/10">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-white font-semibold">{item.codigoPeca}</h4>
                          <p className="text-white/70 text-sm">{item.descricao}</p>
                          <p className="text-white/60 text-xs">Quantidade: {item.quantidade}</p>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-white/70 text-sm block mb-1">
                              Preço Unitário (R$)
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              value={respostas[item._id]?.precoUnitario || ""}
                              onChange={(e) => handleRespostaChange(item._id, "precoUnitario", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>
                          <div>
                            <label className="text-white/70 text-sm block mb-1">
                              Prazo de Entrega
                            </label>
                            <Input
                              type="text"
                              placeholder="Ex: 15 dias úteis"
                              value={respostas[item._id]?.prazoEntrega || ""}
                              onChange={(e) => handleRespostaChange(item._id, "prazoEntrega", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>
                          <div>
                            <label className="text-white/70 text-sm block mb-1">
                              Observações do Item
                            </label>
                            <Textarea
                              placeholder="Observações específicas para este item"
                              value={respostas[item._id]?.observacoes || ""}
                              onChange={(e) => handleRespostaChange(item._id, "observacoes", e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                      {respostas[item._id]?.precoUnitario && (
                        <div className="text-right">
                          <span className="text-white/70 text-sm">
                            Preço Total: R$ {(parseFloat(respostas[item._id]?.precoUnitario || "0") * item.quantidade).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Observações Gerais */}
                <div className="mt-6">
                  <label className="text-white/70 text-sm block mb-2">
                    Observações Gerais da Cotação
                  </label>
                  <Textarea
                    placeholder="Observações gerais sobre a cotação (opcional)"
                    value={observacoesGerais}
                    onChange={(e) => setObservacoesGerais(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    rows={3}
                  />
                </div>

                {/* Botão de Envio */}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSubmitResposta}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Enviando..." : "Enviar Resposta"}
                  </Button>
                </div>
              </div>
            ) : (
              // Visualização somente leitura
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white">Código</TableHead>
                    <TableHead className="text-white">Descrição</TableHead>
                    <TableHead className="text-white">Quantidade</TableHead>
                    <TableHead className="text-white">Preço Unit.</TableHead>
                    <TableHead className="text-white">Preço Total</TableHead>
                    <TableHead className="text-white">Prazo</TableHead>
                    <TableHead className="text-white">Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item: any) => (
                    <TableRow key={item._id} className="border-white/20">
                      <TableCell className="text-white font-medium">
                        {item.codigoPeca}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.descricao}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.quantidade}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.precoUnitario ? `R$ ${item.precoUnitario.toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.precoTotal ? `R$ ${item.precoTotal.toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.prazoEntrega || "-"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.observacoes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Instruções para o fornecedor */}
            {!podeResponder && (
              <div className="mt-6 p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
                <h4 className="text-white font-semibold mb-2">Status da Cotação</h4>
                <div className="text-white/80 text-sm space-y-1">
                  {cotacao.status === "respondida" && (
                    <p>• Esta cotação já foi respondida e está sendo analisada pelo solicitante.</p>
                  )}
                  {cotacao.status === "aprovada_para_compra" && (
                    <p>• Esta cotação foi aprovada e está sendo processada para compra.</p>
                  )}
                  {cotacao.status === "comprada" && (
                    <p>• Esta cotação foi finalizada com sucesso.</p>
                  )}
                  {cotacao.status === "cancelada" && (
                    <p>• Esta cotação foi cancelada.</p>
                  )}
                </div>
              </div>
            )}

            {podeResponder && (
              <div className="mt-6 p-4 bg-green-600/20 rounded-lg border border-green-500/30">
                <h4 className="text-white font-semibold mb-2">Como Responder</h4>
                <div className="text-white/80 text-sm space-y-1">
                  <p>• Preencha os campos de preço unitário, prazo de entrega e observações para cada item.</p>
                  <p>• Os campos são opcionais - você pode responder apenas alguns itens se necessário.</p>
                  <p>• Use o campo de observações gerais para informações adicionais sobre a cotação.</p>
                  {cotacao.tipoSolicitacao === "ambos" && (
                    <p>• Esta solicitação requer tanto cotação de preços quanto especificação técnica.</p>
                  )}
                  <p>• Após enviar, o solicitante será notificado da sua resposta.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}