"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  userId: Id<"users">;
  name: string;
  email: string;
  position?: string;
  department?: string;
  isAdmin?: boolean;
  role?:
    | "consultor"
    | "qualidade_pcp"
    | "gerente"
    | "diretor"
    | "admin"
    | string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mutations
  const login = useMutation(api.auth.login);
  const createInitialUser = useMutation(api.auth.createInitialUser);

  // Queries
  const hasUsers = useQuery(api.auth.hasUsers);
  const allowNewUsers = useQuery(api.auth.allowNewUsers);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    console.log("DEBUG useAuth init:", { savedUser, hasUser: !!savedUser });
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const derivedRole =
          parsedUser.role || (parsedUser.isAdmin ? "admin" : "consultor");
        const normalizedUser = { ...parsedUser, role: derivedRole } as User;
        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        console.log("DEBUG useAuth user set:", normalizedUser);
      } catch (error) {
        console.log("DEBUG useAuth parse error:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string, autoReload = false) => {
    try {
      const result = await login({ email, password });
      const derivedRole =
        result.role || (result.isAdmin ? "admin" : "consultor");
      const userData: User = {
        userId: result.userId,
        name: result.name,
        email: result.email,
        position: result.position,
        department: result.department,
        isAdmin: result.isAdmin || false,
        role: derivedRole,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("DEBUG signIn success:", userData);

      if (autoReload) {
        // Força reload da página para garantir atualização completa do estado
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao fazer login",
      };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const createUser = async (userData: {
    name: string;
    email: string;
    password: string;
    position?: string;
    department?: string;
    isAdmin?: boolean;
    role?: User["role"];
  }) => {
    try {
      const result = await createInitialUser({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        password: userData.password,
      });
      const derivedRole =
        result.role || (result.isAdmin ? "admin" : "consultor");
      const userDataResult: User = {
        userId: result.userId,
        name: result.name,
        email: result.email,
        position: result.position,
        department: result.department,
        isAdmin: result.isAdmin || false,
        role: derivedRole,
      };

      setUser(userDataResult);
      localStorage.setItem("user", JSON.stringify(userDataResult));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar usuário",
      };
    }
  };

  return {
    user,
    isLoading,
    signIn,
    signOut,
    createUser,
    hasUsers,
    allowNewUsers,
    isAuthenticated: !!user,
  };
}
