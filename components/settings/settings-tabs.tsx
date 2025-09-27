"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsProfile } from "./settings-profile";
import { SettingsDataManagement } from "./settings-data-management";

import { Id } from "@/convex/_generated/dataModel";
import { useAdmin } from "@/hooks/use-admin";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FileSpreadsheet, User, Users, Building, Building2, UserCheck } from "lucide-react";
import { SettingsUserManagement } from "./settings-user-management";
import { SettingsFornecedores } from "./settings-fornecedores";
import { SettingsDepartments } from "./settings-departments";
import { TeamDashboard } from "./team-dashboard";

export interface UserSettings {
  // Profile
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  location: string;
  company: string;


  // Appearance
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;

  // System
  autoSave: boolean;
  backupFrequency: string;
  sessionTimeout: string;
}

interface SettingsTabsProps {
  userSettings: UserSettings;
  onSettingChange: (key: keyof UserSettings, value: any) => void;
  defaultTab?: string;
  userId?: Id<"users">;
  isLoading?: boolean;
}

export function SettingsTabs({
  userSettings,
  onSettingChange,
  defaultTab = "profile",
  userId,
  isLoading = false,
}: SettingsTabsProps) {
  const { isAdmin, user } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const featureFlag = false;

  // Determinar abas permitidas baseado no tipo de usuário
  const getUserAllowedTabs = () => {
    const baseTabs = ["profile"];

    if (isAdmin) {
      return [...baseTabs, "data", "users", "departments", "fornecedores"];
    }

    // Se for consultor, adicionar aba de equipe
    if (user?.role === "consultor") {
      return [...baseTabs, "team"];
    }

    return baseTabs;
  };

  const allowedTabs = getUserAllowedTabs();

  const initialTab = allowedTabs.includes(defaultTab) ? defaultTab : "profile";

  const adaptOnChange = (_category: string, setting: string, value: any) => {
    onSettingChange(setting as keyof UserSettings, value);
  };

  const onTabChange = (value: string) => {
    const search = new URLSearchParams(params?.toString());
    search.set("tab", value);
    router.replace(`${pathname}?${search.toString()}`);
  };

  const listBase =
    "grid w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-1";
  const triggerBase =
    "text-white/80 hover:text-white data-[state=active]:text-white data-[state=active]:bg-white/20 rounded-lg transition-colors";

  // Determinar número de colunas baseado nas abas permitidas
  const getGridCols = () => {
    const tabCount = allowedTabs.length;
    if (tabCount <= 1) return "grid-cols-1";
    if (tabCount <= 2) return "grid-cols-2";
    if (tabCount <= 3) return "grid-cols-3";
    if (tabCount <= 4) return "grid-cols-4";
    if (tabCount <= 5) return "grid-cols-5";
    return "grid-cols-6";
  };

  return (
    <Tabs
      defaultValue={initialTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList
        className={`${listBase} ${getGridCols()}`}
      >
        <TabsTrigger value="profile" className={triggerBase}>
          <User className="h-4 w-4 mr-2" />
          Perfil
        </TabsTrigger>
        {user?.role === "consultor" && (
          <TabsTrigger value="team" className={triggerBase}>
            <UserCheck className="h-4 w-4 mr-2" />
            Minha Equipe
          </TabsTrigger>
        )}
        {isAdmin && (
          <TabsTrigger value="data" className={triggerBase}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Dados
          </TabsTrigger>
        )}
        {isAdmin && (
          <TabsTrigger value="users" className={triggerBase}>
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
        )}
        {(isAdmin && featureFlag) && (
          <TabsTrigger value="departments" className={triggerBase}>
            <Building2 className="h-4 w-4 mr-2" />
            Departamentos
          </TabsTrigger>
        )}
        {isAdmin && (
          <TabsTrigger value="fornecedores" className={triggerBase}>
            <Building className="h-4 w-4 mr-2" />
            Fornecedores
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <SettingsProfile
          userSettings={userSettings}
          onSettingChange={adaptOnChange}
          userId={userId}
          isLoading={isLoading}
        />
      </TabsContent>

      {user?.role === "consultor" && (
        <TabsContent value="team" className="space-y-6">
          <TeamDashboard />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="data" className="space-y-6">
          <SettingsDataManagement />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="users" className="space-y-6">
          <SettingsUserManagement />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="departments" className="space-y-6">
          <SettingsDepartments />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="fornecedores" className="space-y-6">
          <SettingsFornecedores />
        </TabsContent>
      )}
    </Tabs>
  );
}
