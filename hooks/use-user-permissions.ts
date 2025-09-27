import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "./use-auth";
import { useAdmin } from "./use-admin";

export function useUserPermissions() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  
  const permissions = useQuery(
    api.departments.getUserPermissions,
    user?.userId ? { userId: user.userId } : "skip"
  );

  const isLoading = !user || permissions === undefined;

  return {
    permissions,
    isLoading,
    // Helpers para facilitar o uso - Admin tem todas as permissões
    canSeeAllData: isAdmin ? true : (permissions?.canSeeAllData ?? false),
    canSeeResponsavelFilter: isAdmin ? true : (permissions?.canSeeResponsavelFilter ?? false),
    isSpecialUser: isAdmin ? true : (permissions?.isSpecialUser ?? false),
    department: permissions?.department ?? "consultor",
    hasDashboardAccess: isAdmin ? true : (permissions?.permissions?.accessDashboard ?? true),
    hasChatAccess: isAdmin ? true : (permissions?.permissions?.accessChat ?? true),
    hasManualAccess: isAdmin ? true : (permissions?.permissions?.accessManual ?? true),
    hasIndicadoresAccess: isAdmin ? true : (permissions?.permissions?.accessIndicadores ?? false),
    hasAnaliseAccess: isAdmin ? true : (permissions?.permissions?.accessAnalise ?? false),
    hasSettingsAccess: isAdmin ? true : (permissions?.permissions?.accessSettings ?? false),
  };
}
