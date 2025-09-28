"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, FileText, Clock, CheckCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FornecedorData {
  id: any;
  nomeEmpresa: string;
  loginUsuario: string;
}

export default function FornecedorDashboardPage() {
  const [fornecedorData, setFornecedorData] = useState<FornecedorData | null>(null);
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

  const handleLogout = () => {
    localStorage.removeItem("fornecedor");
    router.push("/auth");
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      novo: { label: "Nova", variant: "default" as const },
      em_cotacao: { label: "Em Cotação", variant: "secondary" as const },
      respondida: { label: "Respondida", variant: "outline" as const },
      aprovada_para_compra: { label: "Aprovada", variant: "default" as const },
      comprada: { label: "Comprada", variant: "default" as const },
      cancelada: { label: "Cancelada", variant: "destructive" as const },
    };

    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.png"
                alt="Novak & Gouveia"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{fornecedorData.nomeEmpresa}</h1>
                <p className="text-white/70">Portal de Cotações</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
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

          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-300" />
                <div>
                  <p className="text-white/70 text-sm">Pendentes</p>
                  <p className="text-2xl font-bold text-white">{cotacoesPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
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

          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-300" />
                <div>
                  <p className="text-white/70 text-sm">Concluídas</p>
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
              Minhas Cotações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-white">Número</TableHead>
                  <TableHead className="text-white">Cliente</TableHead>
                  <TableHead className="text-white">Tipo</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Data</TableHead>
                  <TableHead className="text-white">Itens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotacoes?.map((cotacao: any  ) => (
                  <TableRow key={cotacao._id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white font-medium">
                      #{cotacao.numeroSequencial}
                    </TableCell>
                    <TableCell className="text-white/80">
                      {cotacao.cliente || "Não informado"}
                    </TableCell>
                    <TableCell>
                      {getTipoSolicitacaoBadge(cotacao.tipoSolicitacao || "")}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(cotacao.status)}
                    </TableCell>
                    <TableCell className="text-white/80">
                      {formatDate(cotacao.createdAt)}
                    </TableCell>
                    <TableCell className="text-white/80">
                      {cotacao.itens.length} {cotacao.itens.length === 1 ? "item" : "itens"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {(!cotacoes || cotacoes.length === 0) && (
              <div className="text-center py-8 text-white/70">
                Nenhuma cotação encontrada.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}