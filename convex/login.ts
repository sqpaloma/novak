import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Hash simples para demonstração - mesma função usada em auth.ts
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Login unificado que detecta se é usuário interno ou fornecedor
export const unifiedLogin = mutation({
  args: {
    email: v.string(),
    senha: v.string(),
  },
  handler: async (ctx, { email, senha }) => {
    // Primeiro, verificar se é um fornecedor
    const fornecedor = await ctx.db
      .query("fornecedores")
      .withIndex("by_login", (q) => q.eq("loginUsuario", email))
      .first();

    if (fornecedor) {
      // É fornecedor - verificar se está ativo
      if (!fornecedor.ativo) {
        throw new Error("Fornecedor inativo");
      }

      // Verificar senha do fornecedor
      const senhaHash = await hashPassword(senha);
      if (senhaHash !== fornecedor.senhaHash) {
        throw new Error("Senha incorreta");
      }

      // Buscar informações do usuário se existir
      let userData = null;
      if (fornecedor.userId) {
        userData = await ctx.db.get(fornecedor.userId);
      }

      return {
        type: "supplier",
        supplier: {
          id: fornecedor._id,
          nomeEmpresa: fornecedor.nomeEmpresa,
          loginUsuario: fornecedor.loginUsuario,
          email: fornecedor.loginUsuario,
          userId: fornecedor.userId,
          userData: userData ? {
            name: userData.name,
            email: userData.email,
            role: userData.role
          } : null,
        },
      };
    }

    // Se não é fornecedor, verificar se é usuário interno
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("Email não encontrado no sistema");
    }

    // É usuário interno - verificar senha
    if (!user.hashedPassword) {
      throw new Error("Usuário não possui senha configurada");
    }

    const hashedPassword = await hashPassword(senha);
    if (user.hashedPassword !== hashedPassword) {
      throw new Error("Senha incorreta");
    }

    // Atualizar último login
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
    });

    // Determinar role
    const isManager = (user.email || "").toLowerCase() === "gerente@empresa.com.br";
    const isQualityUser = (user.email || "").toLowerCase() === "qualidade@empresa.com.br";
    const isControlUser = (user.email || "").toLowerCase() === "controle@empresa.com.br";

    const derivedRole = isManager
      ? "gerente"
      : isQualityUser || isControlUser
        ? "qualidade_pcp"
        : user.role || (user.isAdmin ? "admin" : "consultor");

    return {
      type: "internal",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        position: user.position,
        department: user.department,
        isAdmin: user.isAdmin || false,
        role: derivedRole,
      },
    };
  },
});