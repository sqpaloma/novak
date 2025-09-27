"use client";

import { useAuth } from "./use-auth";

export function useAdmin() {
  const { user, isAuthenticated } = useAuth();

  const isAdminFlag = user?.isAdmin === true;
  const isAdminRole = user?.role === "admin";
  const isSpecialAdmin = user?.email === "admin@empresa.com.br";

  const isAdmin = isAdminFlag || isAdminRole || isSpecialAdmin;

  return {
    isAdmin,
    isAuthenticated,
    user,
    canAccessAdminPages: isAuthenticated && isAdmin,
  };
}
