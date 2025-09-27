"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { ResponsiveLayout } from "@/components/responsive-layout";

interface AdminProtectionProps {
  children: ReactNode;
  allowedRoles?: (
    | "consultor"
    | "qualidade_pcp"
    | "compras"
    | "gerente"
    | "diretor"
    | "admin"
    | string
  )[];
}

export function AdminProtection({
  children,
  allowedRoles = ["admin"],
}: AdminProtectionProps) {
  const { canAccessAdminPages, isAuthenticated, user, isAdmin } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();

  // Debug logs
  console.log("DEBUG AdminProtection:", {
    isAuthenticated,
    isAdmin,
    userRole: user?.role,
    userName: user?.name,
    pathname,
    allowedRoles,
    canAccessAdminPages
  });

  // Special restriction for "compras" role - only allow access to cotacoes routes
  useEffect(() => {
    if (user?.role === "compras" && pathname && !pathname.startsWith("/cotacoes")) {
      router.push("/cotacoes");
    }
  }, [user, pathname, router]);

  // Redirect to auth page if not authenticated (but not if we're already on auth page)
  useEffect(() => {
    if (!isAuthenticated && pathname !== "/auth") {
      // Pequeno delay para dar tempo dos estados carregarem
      const timer = setTimeout(() => {
        console.log("DEBUG: Redirecting to auth because not authenticated");
        router.push("/auth");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router, pathname]);

  if (!isAuthenticated) {
    return null; // Return null while redirecting
  }

  if (user?.role === "compras") {
    const isOnCotacoesRoute = pathname?.startsWith("/cotacoes");
    if (!isOnCotacoesRoute) {
      return null; // Will redirect via useEffect
    }
  }

  const roleAllowed = user?.role ? allowedRoles.includes(user.role) : false;
  const isAllowed = isAdmin || roleAllowed; // Admin sempre tem acesso

  if (!isAllowed) {
    return (
      <ResponsiveLayout title="Acesso Restrito">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Você não possui permissão para acessar esta página.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Usuário atual: {user?.name} ({user?.email})
            </p>
          </CardContent>
        </Card>
      </ResponsiveLayout>
    );
  }

  return <>{children}</>;
}
