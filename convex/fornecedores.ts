import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
// import bcrypt from "bcryptjs"; // Removido temporariamente por causa do runtime do Convex

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

// ===== QUERIES =====

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fornecedores").collect();
  },
});

export const getById = query({
  args: { id: v.id("fornecedores") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByLogin = query({
  args: { login: v.string() },
  handler: async (ctx, { login }) => {
    return await ctx.db
      .query("fornecedores")
      .withIndex("by_login", (q) => q.eq("loginUsuario", login))
      .first();
  },
});

export const getAtivos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("fornecedores")
      .filter((q) => q.eq(q.field("ativo"), true))
      .collect();
  },
});

// ===== MUTATIONS =====

export const create = mutation({
  args: {
    nomeEmpresa: v.string(),
    loginUsuario: v.string(),
    senha: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { nomeEmpresa, loginUsuario, senha, email }) => {
    // Verificar se o login já existe
    const existingFornecedor = await ctx.db
      .query("fornecedores")
      .withIndex("by_login", (q) => q.eq("loginUsuario", loginUsuario))
      .first();

    if (existingFornecedor) {
      throw new Error("Login já existe");
    }

    // Verificar se o email já existe na tabela de usuários
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("Email já está cadastrado no sistema");
    }

    // Hash da senha usando a mesma função do sistema principal
    const senhaHash = await hashPassword(senha);

    const now = Date.now();

    // Criar usuário no sistema principal com email como login
    const userId = await ctx.db.insert("users", {
      name: nomeEmpresa,
      email: email,
      role: "fornecedor",
      hashedPassword: senhaHash,
      createdAt: now,
      updatedAt: now,
    });

    // Criar configurações padrão para o usuário fornecedor
    await ctx.db.insert("userSettings", {
      userId: userId,
      // Privacy
      profileVisibility: "private",
      dataSharing: false,
      analyticsTracking: false,
      // Appearance
      theme: "dark",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      // System
      autoSave: true,
      backupFrequency: "never",
      sessionTimeout: "60min",
      updatedAt: now,
    });

    // Criar fornecedor
    const fornecedorId = await ctx.db.insert("fornecedores", {
      nomeEmpresa,
      loginUsuario: email, // usar email como login
      senhaHash,
      ativo: true,
      userId: userId, // referência ao usuário criado
      createdAt: now,
      updatedAt: now,
    });

    return fornecedorId;
  },
});

export const update = mutation({
  args: {
    id: v.id("fornecedores"),
    nomeEmpresa: v.optional(v.string()),
    loginUsuario: v.optional(v.string()),
    senha: v.optional(v.string()),
    ativo: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, nomeEmpresa, loginUsuario, senha, ativo }) => {
    const existingFornecedor = await ctx.db.get(id);
    if (!existingFornecedor) {
      throw new Error("Fornecedor não encontrado");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (nomeEmpresa !== undefined) {
      updates.nomeEmpresa = nomeEmpresa;
    }

    if (loginUsuario !== undefined) {
      // Verificar se o novo login já existe (exceto para este fornecedor)
      const existingLogin = await ctx.db
        .query("fornecedores")
        .withIndex("by_login", (q) => q.eq("loginUsuario", loginUsuario))
        .first();

      if (existingLogin && existingLogin._id !== id) {
        throw new Error("Login já existe");
      }
      updates.loginUsuario = loginUsuario;
    }

    if (senha !== undefined) {
      updates.senhaHash = await hashPassword(senha);
    }

    if (ativo !== undefined) {
      updates.ativo = ativo;
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("fornecedores") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ===== AUTENTICAÇÃO =====

export const authenticate = mutation({
  args: {
    email: v.string(),
    senha: v.string(),
  },
  handler: async (ctx, { email, senha }) => {
    // Buscar fornecedor pelo email (que agora é usado como loginUsuario)
    const fornecedor = await ctx.db
      .query("fornecedores")
      .withIndex("by_login", (q) => q.eq("loginUsuario", email))
      .first();

    if (!fornecedor || !fornecedor.ativo) {
      throw new Error("Credenciais inválidas");
    }

    // Verificar senha usando hash
    const senhaHash = await hashPassword(senha);
    if (senhaHash !== fornecedor.senhaHash) {
      throw new Error("Credenciais inválidas");
    }

    // Buscar informações do usuário se existir
    let userData = null;
    if (fornecedor.userId) {
      userData = await ctx.db.get(fornecedor.userId);
    }

    return {
      id: fornecedor._id,
      nomeEmpresa: fornecedor.nomeEmpresa,
      loginUsuario: fornecedor.loginUsuario,
      email: fornecedor.loginUsuario, // email é o loginUsuario
      userId: fornecedor.userId,
      userData: userData ? {
        name: userData.name,
        email: userData.email,
        role: userData.role
      } : null,
    };
  },
});

// ===== RESPONSÁVEIS =====

export const getResponsaveis = query({
  args: { fornecedorId: v.id("fornecedores") },
  handler: async (ctx, { fornecedorId }) => {
    return await ctx.db
      .query("fornecedorResponsaveis")
      .withIndex("by_fornecedor", (q) => q.eq("fornecedorId", fornecedorId))
      .filter((q) => q.eq(q.field("ativo"), true))
      .collect();
  },
});

export const addResponsavel = mutation({
  args: {
    fornecedorId: v.id("fornecedores"),
    nome: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { fornecedorId, nome, email }) => {
    // Verificar se o email já existe para este fornecedor
    const existingResponsavel = await ctx.db
      .query("fornecedorResponsaveis")
      .withIndex("by_fornecedor", (q) => q.eq("fornecedorId", fornecedorId))
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (existingResponsavel) {
      throw new Error("Email já cadastrado para este fornecedor");
    }

    const now = Date.now();
    return await ctx.db.insert("fornecedorResponsaveis", {
      fornecedorId,
      nome,
      email,
      ativo: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateResponsavel = mutation({
  args: {
    id: v.id("fornecedorResponsaveis"),
    nome: v.optional(v.string()),
    email: v.optional(v.string()),
    ativo: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, nome, email, ativo }) => {
    const responsavel = await ctx.db.get(id);
    if (!responsavel) {
      throw new Error("Responsável não encontrado");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (nome !== undefined) {
      updates.nome = nome;
    }

    if (email !== undefined) {
      // Verificar se o email já existe para este fornecedor (exceto para este responsável)
      const existingEmail = await ctx.db
        .query("fornecedorResponsaveis")
        .withIndex("by_fornecedor", (q) => q.eq("fornecedorId", responsavel.fornecedorId))
        .filter((q) => q.eq(q.field("email"), email))
        .first();

      if (existingEmail && existingEmail._id !== id) {
        throw new Error("Email já cadastrado para este fornecedor");
      }
      updates.email = email;
    }

    if (ativo !== undefined) {
      updates.ativo = ativo;
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const removeResponsavel = mutation({
  args: { id: v.id("fornecedorResponsaveis") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ===== MIGRAÇÃO DE SENHAS =====

export const migrateFornecedorPasswords = mutation({
  handler: async (ctx) => {
    const fornecedores = await ctx.db.query("fornecedores").collect();
    const results = [];

    for (const fornecedor of fornecedores) {
      // Verificar se a senha parece ser um hash (64 caracteres hexadecimais)
      const isAlreadyHashed = /^[a-f0-9]{64}$/i.test(fornecedor.senhaHash);

      if (!isAlreadyHashed) {
        // Aplicar hash na senha
        const hashedPassword = await hashPassword(fornecedor.senhaHash);
        await ctx.db.patch(fornecedor._id, {
          senhaHash: hashedPassword,
          updatedAt: Date.now(),
        });

        results.push({
          fornecedor: fornecedor.nomeEmpresa,
          migrated: true,
        });
      } else {
        results.push({
          fornecedor: fornecedor.nomeEmpresa,
          migrated: false,
          reason: "already_hashed",
        });
      }
    }

    return {
      success: true,
      migrated: results.filter(r => r.migrated).length,
      total: results.length,
      results,
    };
  },
});

// ===== QUERIES PARA VISUALIZAÇÃO DE FORNECEDORES =====

export const getCotacoesFornecedor = query({
  args: { fornecedorId: v.id("fornecedores") },
  handler: async (ctx, { fornecedorId }) => {
    // Buscar cotações destinadas a este fornecedor
    const cotacoes = await ctx.db
      .query("cotacoes")
      .withIndex("by_fornecedor", (q) => q.eq("fornecedorId", fornecedorId))
      .collect();

    // Para cada cotação, buscar os itens e informações do solicitante
    const cotacoesComDetalhes = await Promise.all(
      cotacoes.map(async (cotacao) => {
        const itens = await ctx.db
          .query("cotacaoItens")
          .withIndex("by_cotacao", (q) => q.eq("cotacaoId", cotacao._id))
          .collect();

        const solicitante = await ctx.db.get(cotacao.solicitanteId);

        return {
          ...cotacao,
          itens,
          solicitante: solicitante ? {
            nome: solicitante.name,
            email: solicitante.email,
          } : null,
        };
      })
    );

    return cotacoesComDetalhes;
  },
});

export const getCotacaoFornecedor = query({
  args: {
    cotacaoId: v.id("cotacoes"),
    fornecedorId: v.id("fornecedores")
  },
  handler: async (ctx, { cotacaoId, fornecedorId }) => {
    // Buscar a cotação
    const cotacao = await ctx.db.get(cotacaoId);
    if (!cotacao || cotacao.fornecedorId !== fornecedorId) {
      throw new Error("Cotação não encontrada ou não pertence a este fornecedor");
    }

    // Buscar os itens
    const itens = await ctx.db
      .query("cotacaoItens")
      .withIndex("by_cotacao", (q) => q.eq("cotacaoId", cotacaoId))
      .collect();

    // Buscar informações do solicitante (sem dados sensíveis)
    const solicitante = await ctx.db.get(cotacao.solicitanteId);

    // Remover campos que não devem ser visíveis para fornecedores
    const cotacaoFornecedor = {
      _id: cotacao._id,
      numeroSequencial: cotacao.numeroSequencial,
      // NÃO incluir numeroOS e numeroOrcamento para fornecedores
      cliente: cotacao.cliente,
      status: cotacao.status,
      observacoes: cotacao.observacoes,
      tipoSolicitacao: cotacao.tipoSolicitacao,
      dataResposta: cotacao.dataResposta,
      createdAt: cotacao.createdAt,
    };

    return {
      cotacao: cotacaoFornecedor,
      itens,
      solicitante: solicitante ? {
        nome: solicitante.name,
        email: solicitante.email,
      } : null,
    };
  },
});

// Responder cotação pelo fornecedor
export const responderCotacaoFornecedor = mutation({
  args: {
    cotacaoId: v.id("cotacoes"),
    fornecedorId: v.id("fornecedores"),
    itensResposta: v.array(v.object({
      itemId: v.id("cotacaoItens"),
      precoUnitario: v.optional(v.number()),
      prazoEntrega: v.optional(v.string()),
      observacoes: v.optional(v.string()),
    })),
    observacoesGerais: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verificar se a cotação existe e pertence ao fornecedor
    const cotacao = await ctx.db.get(args.cotacaoId);
    if (!cotacao || cotacao.fornecedorId !== args.fornecedorId) {
      throw new Error("Cotação não encontrada ou não pertence a este fornecedor");
    }

    // Verificar se a cotação pode ser respondida
    if (!["novo", "em_cotacao"].includes(cotacao.status)) {
      throw new Error("Esta cotação não pode mais ser respondida");
    }

    // Atualizar itens com as respostas do fornecedor
    for (const itemResposta of args.itensResposta) {
      const item = await ctx.db.get(itemResposta.itemId);
      if (!item || item.cotacaoId !== args.cotacaoId) {
        continue; // Pular itens inválidos
      }

      const updates: any = {
        updatedAt: Date.now(),
      };

      if (itemResposta.precoUnitario !== undefined) {
        updates.precoUnitario = itemResposta.precoUnitario;
        updates.precoTotal = itemResposta.precoUnitario * item.quantidade;
      }

      if (itemResposta.prazoEntrega !== undefined) {
        updates.prazoEntrega = itemResposta.prazoEntrega;
      }

      if (itemResposta.observacoes !== undefined) {
        updates.observacoes = itemResposta.observacoes;
      }

      await ctx.db.patch(itemResposta.itemId, updates);
    }

    // Atualizar status da cotação para "respondida"
    await ctx.db.patch(args.cotacaoId, {
      status: "respondida",
      dataResposta: Date.now(),
      observacoes: args.observacoesGerais || cotacao.observacoes,
      updatedAt: Date.now(),
    });

    // Criar histórico
    await ctx.db.insert("cotacaoHistorico", {
      cotacaoId: args.cotacaoId,
      usuarioId: cotacao.solicitanteId, // Usar o solicitante como referência no histórico
      acao: "respondida_fornecedor",
      statusAnterior: cotacao.status,
      statusNovo: "respondida",
      observacoes: `Cotação respondida pelo fornecedor`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});