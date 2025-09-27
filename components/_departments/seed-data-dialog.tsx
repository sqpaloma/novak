"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, RefreshCw, Users, Building2 } from "lucide-react";
import { toast } from "sonner";

export function SeedDataDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const createBasicStructure = useMutation(api.simpleSeed.createBasicStructure);
  const clearTestData = useMutation(api.simpleSeed.clearTestData);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await createBasicStructure();
      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro ao criar estrutura: ${error}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResetAndSeed = async () => {
    setIsResetting(true);
    try {
      // First clear existing data
      const clearResult = await clearTestData();
      if (!clearResult.success) {
        toast.error(clearResult.message);
        return;
      }

      // Then create new structure
      const result = await createBasicStructure();
      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro ao recriar estrutura: ${error}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleTestStructure = async () => {
    setIsSeeding(true);
    try {
      const result = await createBasicStructure();
      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro ao criar estrutura teste: ${error}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-white border-white/30 bg-white/10 hover:bg-white/20 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Popular Estrutura Real
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Popular Estrutura Departamental Real
          </DialogTitle>
          <DialogDescription>
            Esta ação irá criar toda a estrutura hierárquica real da empresa no banco de dados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>Estrutura que será criada:</strong>
              <br />
              • <strong>Gerente:</strong> Giovanni
              <br />
              • <strong>Consultores:</strong> Lucas Santos, Rafael Massa, Marcelo Menezes
              <br />
              • <strong>1 Subdepartamento:</strong> Setor 1 - Bombas e Motores de Grande Porte
              <br />
              • <strong>Mecânicos:</strong> Alexandre, Alexsandro, Kaua
              <br />
              • <strong>Hierarquia básica</strong> com vínculos entre pessoas e setores
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Subdepartamento:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                <li>• Setor 1 - Bombas e Motores de Grande Porte (Lucas Santos)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Total de pessoas:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                <li>• 1 Gerente (Giovanni)</li>
                <li>• 3 Consultores</li>
                <li>• 3 Mecânicos no Setor 1</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleTestStructure}
              disabled={isSeeding || isResetting}
              className="w-full"
              variant="secondary"
            >
              {isSeeding ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Criando teste...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Criar Estrutura Básica (Rápido)
                </>
              )}
            </Button>

            <Button
              onClick={handleSeed}
              disabled={isSeeding || isResetting}
              className="w-full"
            >
              {isSeeding ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Criando estrutura...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Criar Estrutura Básica
                </>
              )}
            </Button>

            <Button
              onClick={handleResetAndSeed}
              disabled={isSeeding || isResetting}
              variant="destructive"
              className="w-full"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Limpando e recriando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar e Recriar Tudo
                </>
              )}
            </Button>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Nota:</strong> Esta função cria uma estrutura básica inicial. Após criar,
              você pode adicionar mais subdepartamentos e mecânicos através das abas de
              gerenciamento. Use esta opção para começar rapidamente.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}