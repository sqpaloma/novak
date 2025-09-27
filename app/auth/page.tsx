"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { signIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const unifiedLogin = useMutation(api.login.unifiedLogin);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const result = await unifiedLogin({
        email: email,
        senha: password,
      });

      if (result.type === "internal") {
        // É usuário interno - usar o sistema de auth existente
        const authResult = await signIn(email, password);

        if (authResult.success) {
          toast.success("Login realizado com sucesso!");

          // Redirecionar baseado no role do usuário
          try {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            const userRole = userData?.role;

            // Usar replace ao invés de push para evitar voltar para login
            if (userRole === "compras") {
              router.replace("/cotacoes");
            } else {
              router.replace("/");
            }
          } catch (parseError) {
            console.error("Erro ao fazer parse dos dados do usuário:", parseError);
            router.replace("/");
          }
        } else {
          toast.error(authResult.error || "Erro ao fazer login");
        }
      } else if (result.type === "supplier" && result.supplier) {
        // É fornecedor - salvar dados e redirecionar
        localStorage.setItem("fornecedor", JSON.stringify(result.supplier));
        toast.success(`Bem-vindo, ${result.supplier.nomeEmpresa}!`);

        // Redirecionar para área do fornecedor
        router.replace("/fornecedor/cotacoes");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 flex items-center justify-center relative">
              <Image
                src="/logo.png"
                alt="Logo Novak & Gouveia"
                width={80}
                height={80}
                className="rounded-full border-2 border-green-400 bg-blue-700 object-cover"
                priority
              />
            </div>
          </div>
          <div className="flex justify-center items-center space-x-2 mb-2">
            <span className="text-3xl font-bold text-white">novak</span>
            <span className="text-3xl font-bold text-white">&</span>
            <span className="text-3xl font-bold text-white">gouveia</span>
            <span className="text-3xl font-light text-green-400">consultoria</span>
          </div>
          <p className="text-blue-200 text-sm">Dashboard de Novak & Gouveia</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Fazer Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 pr-10"
                    placeholder="Sua senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-white/10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
