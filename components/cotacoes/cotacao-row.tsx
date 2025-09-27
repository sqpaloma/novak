import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
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

interface CotacaoRowProps {
  cotacao: any;
  isPendente: boolean;
  availableActions: string[];
  onRowAction: (cotacao: any, action: string) => void;
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

export const CotacaoRow = ({ cotacao, isPendente, availableActions, onRowAction }: CotacaoRowProps) => {
  const statusInfo = getStatusInfo(cotacao.status);

  return (
    <TableRow className={`${isPendente ? "bg-blue-600/20 border-blue-400/50" : ""} hover:!bg-blue-600/30 transition-colors text-white hover:text-white border-0`}>
      <TableCell className="px-2 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <Badge className={`text-xs ${cotacao.tipo === "cadastro" ? "bg-blue-600/70 text-white border-white/30" : "bg-blue-600/70 text-white border-white/30"}`}>
            {cotacao.tipo === "cadastro" ? "Cadastro" : "Cotação"}
          </Badge>
          {cotacao.tipo === "cotacao" && cotacao.temItensPrecisaCadastro && (
            <Badge className="bg-blue-600/70 text-white border-white/30 text-xs">
              Cadastro
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="px-2 sm:px-4">
        <div className="flex items-center gap-2">
          {isPendente && <Clock className="h-4 w-4 text-white" />}
          <span className="font-mono font-semibold">
            #{cotacao.numeroSequencial}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-2 sm:px-4">
        <div className="space-y-1">
          {cotacao.tipo === "cadastro" ? (
            <>
              <div className="text-sm font-medium">{cotacao.descricao}</div>
              {cotacao.marca && (
                <div className="text-sm text-white">Marca: {cotacao.marca}</div>
              )}
              {cotacao.codigoSankhya && (
                <div className="text-sm text-white font-mono">Sankhya: {cotacao.codigoSankhya}</div>
              )}
              {cotacao.anexoNome && (
                <div className="text-xs text-white">📎 {cotacao.anexoNome}</div>
              )}
            </>
          ) : (
            <>
              {cotacao.numeroOS && (
                <div className="text-sm">OS: {cotacao.numeroOS}</div>
              )}
              {cotacao.numeroOrcamento && (
                <div className="text-sm text-white">Orç: {cotacao.numeroOrcamento}</div>
              )}
              {cotacao.cliente && (
                <div className="text-sm text-white">{cotacao.cliente}</div>
              )}
            </>
          )}
        </div>
      </TableCell>
      <TableCell className="px-2 sm:px-4">
        <Badge className={`${statusInfo.color} bg-blue-600/70 text-white border-white/30`}>
          {statusInfo.label}
        </Badge>
      </TableCell>
      <TableCell className="px-2 sm:px-4">
        <div className="space-y-1">
          <div className="text-sm">{cotacao.solicitante?.name}</div>
          {cotacao.comprador && (
            <div className="text-xs text-white">Comprador: {cotacao.comprador.name}</div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">
        {cotacao.totalItens}
      </TableCell>
      <TableCell className="text-right">
        {cotacao.valorTotal > 0 ? (
          <span className={`font-semibold ${["respondida", "aprovada_para_compra", "comprada"].includes(cotacao.status)
              ? "text-white"
              : "text-blue-600/70"
            }`}>
            {formatCurrency(cotacao.valorTotal)}
          </span>
        ) : "-"}
      </TableCell>
      <TableCell className="text-sm text-white">
        {formatDate(cotacao.createdAt)}
      </TableCell>
      <TableCell className="text-sm text-white">
        {cotacao.prazoEntrega}
      </TableCell>
      <TableCell className="px-2 sm:px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableActions.map((action) => (
              <DropdownMenuItem
                key={action}
                onClick={() => onRowAction(cotacao, action)}
                className={["cancelar", "excluir"].includes(action) ? "text-red-400" : ""}
              >
                {getActionIcon(action)}
                <span className="ml-2">{getActionLabel(action)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};