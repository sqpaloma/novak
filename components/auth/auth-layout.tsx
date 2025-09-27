"use client";

import { useAuth } from "@/hooks/use-auth";
import AuthPage from "@/app/auth/page";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Verificar se é uma rota de fornecedor
  const isFornecedorRoute = pathname?.startsWith("/fornecedor");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Se for rota de fornecedor, não aplicar autenticação padrão
  if (isFornecedorRoute) {
    return <>{children}</>;
  }

  // Evita problemas de hidratação
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <>{children}</>;
}
