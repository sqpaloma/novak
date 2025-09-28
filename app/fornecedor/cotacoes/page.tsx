"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, FileText, Clock, CheckCircle, LogOut, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FornecedorData {
  id: any;
  nomeEmpresa: string;
  loginUsuario: string;
}

export default function FornecedorCotacoesPage() {
  const [fornecedorData, setFornecedorData] = useState<FornecedorData | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<"pendentes" | "respondidas" | "finalizadas" | "todas">("pendentes");
  const router = useRouter();

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

  // Buscar cotações do fornecedor
  const cotacoes: any = [];

  // Debug: verificar quando os dados mudam
  useEffect(() => {
    if (cotacoes) {
      console.log("Cotações carregadas:", cotacoes);
      console.log("Status das cotações:", cotacoes.map((c: any) => ({ id: c._id, numero: c.numeroSequencial, status: c.status })));
    }
  }, [cotacoes]);

  useEffect(() => {
    console.log("Filtro Status mudou para:", filtroStatus);
  }, [filtroStatus]);

  const handleLogout = () => {
    localStorage.removeItem("fornecedor");
    router.push("/auth");
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      novo: { label: "Nova", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      em_cotacao: { label: "Em Cotação", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      respondida: { label: "Respondida", variant: "outline" as const, color: "bg-green-100 text-green-800" },
      aprovada_para_compra: { label: "Aprovada", variant: "default" as const, color: "bg-purple-100 text-purple-800" },
      comprada: { label: "Comprada", variant: "default" as const, color: "bg-green-100 text-green-800" },
      cancelada: { label: "Cancelada", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    };

    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const, color: "bg-gray-100 text-gray-800" };
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
    });
  };

  const getPriorityColor = (status: string) => {
    if (["novo", "em_cotacao"].includes(status)) return "border-l-yellow-500";
    if (status === "respondida") return "border-l-green-500";
    return "border-l-blue-500";
  };

  if (!fornecedorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // Estatísticas das cotações
  const totalCotacoes = cotacoes?.length || 0;
  const cotacoesPendentes = cotacoes?.filter((c: any) => ["novo", "em_cotacao"].includes(c.status)).length || 0;
  const cotacoesRespondidas = cotacoes?.filter((c: any) => c.status === "respondida").length || 0;
  const cotacoesConcluidas = cotacoes?.filter((c: any) => ["comprada"].includes(c.status)).length || 0;

  // Separar cotações para exibição baseado no filtro selecionado
  const getCotacoesParaExibir = () => {
    if (!cotacoes) return [];

    // Sempre filtrar por pendentes por padrão, independente do filtroStatus
    if (filtroStatus === "pendentes") {
      return cotacoes.filter((c: any) => ["novo", "em_cotacao"].includes(c.status));
    } else if (filtroStatus === "respondidas") {
      return cotacoes.filter((c: any) => c.status === "respondida");
    } else if (filtroStatus === "finalizadas") {
      return cotacoes.filter((c: any) => ["comprada"].includes(c.status));
    } else if (filtroStatus === "todas") {
      return cotacoes;
    } else {
      // Fallback para pendentes
      return cotacoes.filter((c: any) => ["novo", "em_cotacao"].includes(c.status));
    }
  };

  const cotacoesParaExibir = getCotacoesParaExibir();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header simplificado com apenas logo e sair */}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className={`bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors ${
              filtroStatus === "todas" ? "ring-2 ring-white/50" : ""
            }`}
            onClick={() => setFiltroStatus("todas")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-300" />
                <div>
                  <p className="text-white/70 text-sm">Total de Cotações</p>
                  <p className="text-2xl font-bold text-white">{totalCotacoes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors ${
              filtroStatus === "pendentes" ? "ring-2 ring-white/50" : ""
            }`}
            onClick={() => setFiltroStatus("pendentes")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-300" />
                <div>
                  <p className="text-white/70 text-sm">Aguardando Resposta</p>
                  <p className="text-2xl font-bold text-white">{cotacoesPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors ${
              filtroStatus === "respondidas" ? "ring-2 ring-white/50" : ""
            }`}
            onClick={() => setFiltroStatus("respondidas")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-blue-300" />
                <div>
                  <p className="text-white/70 text-sm">Respondidas</p>
                  <p className="text-2xl font-bold text-white">{cotacoesRespondidas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors ${
              filtroStatus === "finalizadas" ? "ring-2 ring-white/50" : ""
            }`}
            onClick={() => setFiltroStatus("finalizadas")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-300" />
                <div>
                  <p className="text-white/70 text-sm">Finalizadas</p>
                  <p className="text-2xl font-bold text-white">{cotacoesConcluidas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cotações Table */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Solicitações de Cotação
              {filtroStatus !== "todas" && (
                <span className="text-sm font-normal text-white/70">
                  - {filtroStatus === "pendentes" ? "Pendentes" :
                     filtroStatus === "respondidas" ? "Respondidas" : "Finalizadas"}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cotacoesParaExibir.length === 0 ? (
              <div className="text-center py-12 text-white/70">
                <FileText className="h-12 w-12 mx-auto mb-4 text-white/50" />
                <p className="text-lg mb-2">
                  {filtroStatus === "pendentes" ? "Nenhuma cotação pendente" :
                   filtroStatus === "respondidas" ? "Nenhuma cotação respondida" :
                   filtroStatus === "finalizadas" ? "Nenhuma cotação finalizada" :
                   "Nenhuma cotação encontrada"}
                </p>
                <p className="text-sm">
                  {totalCotacoes === 0
                    ? "Aguarde novas solicitações de cotação serem enviadas."
                    : filtroStatus === "pendentes"
                    ? "Todas as cotações foram respondidas. Clique nos cards acima para ver cotações respondidas ou finalizadas."
                    : "Clique nos outros cards acima para ver cotações em diferentes status."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cotacoesParaExibir.map((cotacao: any) => (
                  <Card key={cotacao._id} className={`bg-white/5 border-white/10 border-l-4 ${getPriorityColor(cotacao.status)} hover:bg-white/10 transition-colors`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-white font-semibold text-lg">Cotação #{cotacao.numeroSequencial}</h3>
                            <p className="text-white/70 text-sm">Cliente: {cotacao.cliente || "Não informado"}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getTipoSolicitacaoBadge(cotacao.tipoSolicitacao || "")}
                            {getStatusBadge(cotacao.status)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-white/70 text-sm">Data da solicitação</p>
                            <p className="text-white text-sm">{formatDate(cotacao.createdAt)}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/30 text-blue-600 hover:bg-white/10 hover:text-white"
                            onClick={() => router.push(`/fornecedor/cotacao/${cotacao._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-white/70">
                            <strong className="text-white">{cotacao.itens.length}</strong> {cotacao.itens.length === 1 ? "item" : "itens"}
                          </span>
                          {cotacao.solicitante && (
                            <span className="text-white/70">
                              Solicitante: <strong className="text-white">{cotacao.solicitante.nome}</strong>
                            </span>
                          )}
                        </div>
                        {cotacao.observacoes && (
                          <span className="text-white/70 max-w-md truncate">
                            "{cotacao.observacoes}"
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}