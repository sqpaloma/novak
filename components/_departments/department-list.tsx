import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Save,
  X,
  Workflow,
} from "lucide-react";
import { Department } from "@/hooks/use-departments";

interface DepartmentListProps {
  departments?: Department[];
  editingDepartment: Department | null;
  isUpdating: boolean;

  // Form data
  name: string;
  setName: (name: string) => void;
  defaultRole: string;
  setDefaultRole: (role: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  roles: Array<{ value: string; label: string }>;

  // Functions
  onEditDepartment: (dept: Department) => void;
  onUpdateDepartment: () => void;
  onToggleStatus: (dept: Department) => void;
  onViewFlowchart: (dept: Department) => void;
  getRoleBadgeColor: (role?: string) => string;
  getRoleLabel: (role?: string) => string;
  resetForm: () => void;
}

export function DepartmentList({
  departments,
  editingDepartment,
  isUpdating,
  name,
  setName,
  defaultRole,
  setDefaultRole,
  description,
  setDescription,
  roles,
  onEditDepartment,
  onUpdateDepartment,
  onToggleStatus,
  onViewFlowchart,
  getRoleBadgeColor,
  getRoleLabel,
  resetForm,
}: DepartmentListProps) {
  if (!departments?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {departments.map((department) => (
        <Card key={department._id} className="border-white/30">
          <CardContent className="pt-4">
            {editingDepartment && editingDepartment._id === department._id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Departamento</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Papel Padrão</Label>
                    <Select
                      value={defaultRole}
                      onValueChange={setDefaultRole}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                  <div className="space-y-2 md:col-span-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={onUpdateDepartment}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/30 mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h4 className="font-medium text-white text-lg">
                      {department.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={getRoleBadgeColor(department.defaultRole)}
                        variant="outline"
                      >
                        {getRoleLabel(department.defaultRole)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/80">Status:</span>
                        <Switch
                          checked={department.active}
                          onCheckedChange={() => onToggleStatus(department)}
                          aria-label={`${department.active ? "Desativar" : "Ativar"} departamento ${department.name}`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            department.active
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {department.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {department.description && (
                    <p className="text-sm text-white/80 leading-relaxed">
                      {department.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewFlowchart(department)}
                    className="w-auto"
                    title="Ver Fluxograma"
                  >
                    <Workflow className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditDepartment(department)}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}