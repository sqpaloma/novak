"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface ResponsavelFilterProps {
  onFilterChange: (responsavel: string | null) => void;
  processedItems: any[];
}

export function ResponsavelFilter({
  onFilterChange,
  processedItems,
}: ResponsavelFilterProps) {
  const uniqueResponsaveisData: any = [];
  const dashboardData: any = [];
  
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [selectedResponsavel, setSelectedResponsavel] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadResponsaveis();
  }, [processedItems, uniqueResponsaveisData]);

  const loadResponsaveis = async () => {
    try {
      setIsLoading(true);

      const responsaveisFromDB = uniqueResponsaveisData || [];

      if (responsaveisFromDB.length > 0) {
        // Filtrar e ordenar responsáveis do banco de dados
        const responsaveisCompletos = responsaveisFromDB
          .filter((nome: any) => nome && nome.trim() !== "" && nome !== "Não informado")
          .sort((a: any, b: any) => {
            // Colocar gerentes primeiro (se houver lógica específica)
            return a.localeCompare(b);
          });
        setResponsaveis(responsaveisCompletos);
        return;
      }

      const localResponsaveis = Array.from(
        new Set(
          processedItems
            .map((item) => item.responsavel)
            .filter(
              (responsavel) =>
                responsavel &&
                responsavel.trim() !== "" &&
                responsavel !== "Não informado"
            )
        )
      ).sort((a, b) => {
        return a.localeCompare(b);
      });
      setResponsaveis(localResponsaveis);
    } catch (error) {
      const localResponsaveis = Array.from(
        new Set(
          processedItems
            .map((item) => item.responsavel)
            .filter(
              (responsavel) =>
                responsavel &&
                responsavel.trim() !== "" &&
                responsavel !== "Não informado"
            )
        )
      ).sort((a, b) => {
        return a.localeCompare(b);
      });
      setResponsaveis(localResponsaveis);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByResponsavel = async (responsavel: string) => {
    try {
      setIsLoading(true);
      setSelectedResponsavel(responsavel);
      onFilterChange(responsavel);
    } catch (error) {
      // Silently handle error
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilter = () => {
    setSelectedResponsavel(null);
    onFilterChange(null);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedResponsavel || ""}
        onValueChange={handleFilterByResponsavel}
        disabled={isLoading}
      >
        <SelectTrigger className="w-64 h-10 text-sm border-white/30 text-white placeholder:text-white/80 hover:bg-white/30 transition-colors bg-white/20">
          <SelectValue placeholder="Filtrar por..." />
        </SelectTrigger>
        <SelectContent className="max-h-48 overflow-y-auto">
          {responsaveis.map((responsavel) => (
            <SelectItem key={responsavel} value={responsavel}>
              {responsavel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedResponsavel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilter}
          className="h-8 px-2 text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
