import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreVertical,
  MessageSquare,
  CheckCircle,
  ShoppingCart,
  XCircle,
  Edit,
  Clock,
  Trash2,
} from "lucide-react";
import { getStatusInfo } from "@/hooks/use-cotacoes";
import { formatCurrency, formatDate } from "./table-utils";

interface CotacaoCardProps {
  cotacao: any;
  isPendente: boolean;
  availableActions: string[];
  onCardAction: (cotacao: any, action: string) => void;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "responder": return <MessageSquare className="h-4 w-4" />;
    case "aprovar": return <CheckCircle className="h-4 w-4" />;
    case "concluir": return <CheckCircle className="h-4 w-4" />;
    case "comprar": return <ShoppingCart className="h-4 w-4" />;
    case "cancelar": return <XCircle className="h-4 w-4" />;
    case "editar": return <Edit className="h-4 w-4" />;
    case "excluir": return <Trash2 className="h-4 w-4" />;
    default: return <Eye className="h-4 w-4" />;
  }
};

const getActionLabel = (action: string) => {
  switch (action) {
    case "responder": return "Responder";
    case "aprovar": return "Aprovar";
    case "concluir": return "Concluir";
    case "comprar": return "Comprar";
    case "cancelar": return "Cancelar";
    case "editar": return "Editar";
    case "excluir": return "Excluir";
    default: return "Visualizar";
  }
};

export const CotacaoCard = ({ cotacao, isPendente, availableActions, onCardAction }: CotacaoCardProps) => {
  const statusInfo = getStatusInfo(cotacao.status);

  return (
    <Card className={`border-blue-700 mb-4 ${isPendente ? "bg-blue-600/70 border-white/30" : "bg-blue-600/70 border-white/30"}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header do card */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${cotacao.tipo === "cadastro" ? "bg-blue-600/70 text-white border-white/30" : "bg-blue-600/70 text-white border-white/30"}`}>
                  {cotacao.tipo === "cadastro" ? "Cadastro" : "Cotação"}
                </Badge>
                {cotacao.tipo === "cotacao" && cotacao.temItensPrecisaCadastro && (
                  <Badge className="bg-blue-600/70 text-white border-white/30 text-xs">
                    Cadastro
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  {isPendente && <Clock className="h-3 w-3 text-white" />}
                  <span className="font-mono font-bold text-white">#{cotacao.numeroSequencial}</span>
                </div>
              </div>

              <Badge className={`${statusInfo.color} bg-blue-600/70 text-white border-white/30`}>
                {statusInfo.label}
              </Badge>
            </div>

            {/* Menu de ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-blue-800 border-blue-600">
                {availableActions.map((action) => (
                  <DropdownMenuItem
                    key={action}
                    onClick={() => onCardAction(cotacao, action)}
                    className={`text-blue-100 hover:bg-blue-700 ${["cancelar", "excluir"].includes(action) ? "text-red-400 hover:text-red-300" : ""}`}
                  >
                    {getActionIcon(action)}
                    <span className="ml-2">{getActionLabel(action)}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Conteúdo principal */}
          <div className="space-y-2 text-sm">
            {cotacao.tipo === "cadastro" ? (
              <>
                <div className="text-white font-medium">{cotacao.descricao}</div>
                {cotacao.marca && (
                  <div className="text-white">
                    <span className="text-white font-medium">Marca:</span> {cotacao.marca}
                  </div>
                )}
                {cotacao.codigoSankhya && (
                  <div className="text-white font-mono text-xs">
                    <span className="text-white font-medium">Sankhya:</span> {cotacao.codigoSankhya}
                  </div>
                )}
                {cotacao.anexoNome && (
                  <div className="text-white text-xs">📎 {cotacao.anexoNome}</div>
                )}
              </>
            ) : (
              <>
                {cotacao.numeroOS && (
                  <div className="text-white">
                    <span className="text-white font-medium">OS:</span> {cotacao.numeroOS}
                  </div>
                )}
                {cotacao.numeroOrcamento && (
                  <div className="text-white">
                    <span className="text-white font-medium">Orçamento:</span> {cotacao.numeroOrcamento}
                  </div>
                )}
                {cotacao.cliente && (
                  <div className="text-white">
                    <span className="text-white font-medium">Cliente:</span> {cotacao.cliente}
                  </div>
                )}
                {cotacao.totalItens > 0 && (
                  <div className="text-white">
                    <span className="text-white font-medium">Itens:</span> {cotacao.totalItens}
                  </div>
                )}
                {cotacao.valorTotal > 0 && (
                  <div className="text-white font-semibold">
                    <span className="text-white font-medium">Valor:</span> {formatCurrency(cotacao.valorTotal)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer com responsáveis e data */}
          <div className="pt-2 border-t border-white space-y-1 text-xs">
            <div className="text-white">
              <span className="text-white font-medium">Solicitante:</span> {cotacao.solicitante?.name}
            </div>
            {cotacao.comprador && (
                <div className="text-white">
                <span className="text-white font-medium">Comprador:</span> {cotacao.comprador.name}
              </div>
            )}
            <div className="text-white">
              <span className="text-white font-medium">Data:</span> {formatDate(cotacao.createdAt)}
            </div>
            {cotacao.prazoEntrega && (
              <div className="text-white">
                <span className="text-white font-medium">Prazo:</span> {cotacao.prazoEntrega}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};