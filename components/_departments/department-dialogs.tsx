import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Department } from "@/hooks/use-departments";

interface DepartmentDialogsProps {
  // Create dialog
  showCreateDialog: boolean;
  setShowCreateDialog: (show: boolean) => void;
  onCreateDepartment: () => void;
  isCreating: boolean;

  // Form data
  name: string;
  setName: (name: string) => void;
  defaultRole: string;
  setDefaultRole: (role: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  roles: Array<{ value: string; label: string }>;
  resetForm: () => void;

  // Departments data
  departments?: Department[];
}

export function DepartmentDialogs({
  showCreateDialog,
  setShowCreateDialog,
  onCreateDepartment,
  isCreating,
  name,
  setName,
  defaultRole,
  setDefaultRole,
  description,
  setDescription,
  roles,
  resetForm,
  departments,
}: DepartmentDialogsProps) {
  return (
    <>
      {/* Create Department Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={departments === undefined}
          >
            <Plus className="h-4 w-4" />
            Novo Departamento
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Departamento</DialogTitle>
            <DialogDescription>
              Adicione um novo departamento ao sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Departamento *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Vendas, Compras, etc."
                aria-required="true"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultRole">Papel Padrão *</Label>
              <Select value={defaultRole} onValueChange={setDefaultRole}>
                <SelectTrigger id="defaultRole" aria-required="true">
                  <SelectValue placeholder="Selecione o papel padrão" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do departamento..."
                rows={3}
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowCreateDialog(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={onCreateDepartment} disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}