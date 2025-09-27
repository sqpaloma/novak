import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query para listar todos os departamentos
export const listDepartments = query({
  handler: async (ctx) => {
    const departments = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();

    // Enriquecer com informações do responsável
    const enrichedDepartments = [];
    for (const dept of departments) {
      let responsible = null;
      if (dept.responsiblePersonId) {
        responsible = await ctx.db.get(dept.responsiblePersonId);
      }

      enrichedDepartments.push({
        ...dept,
        responsible,
      });
    }

    return enrichedDepartments;
  },
});

// Query para listar todos os departamentos (incluindo inativos) - apenas para admin
export const listAllDepartments = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("departments")
      .order("asc")
      .collect();
  },
});

// Query para obter um departamento específico
export const getDepartment = query({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation para criar um novo departamento
export const createDepartment = mutation({
  args: {
    name: v.string(),
    defaultRole: v.string(),
    description: v.optional(v.string()),
    responsiblePersonId: v.optional(v.id("people")),
  },
  handler: async (ctx, args) => {
    // Verificar se já existe um departamento com esse nome
    const existing = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      throw new Error("Já existe um departamento com esse nome");
    }

    // Verificar se a pessoa responsável existe (se fornecido)
    if (args.responsiblePersonId) {
      const responsible = await ctx.db.get(args.responsiblePersonId);
      if (!responsible || !responsible.active) {
        throw new Error("Pessoa responsável não encontrada ou inativa");
      }
    }

    // Definir permissões padrão baseadas no papel
    const getDefaultPermissions = (role: string) => {
      switch (role) {
        case "admin":
          return {
            accessDashboard: true,
            accessChat: true,
            accessManual: true,
            accessIndicadores: true,
            accessAnalise: true,
            accessSettings: true,
            dashboardDataScope: "all",
            dashboardFilterVisible: true,
            chatDataScope: "all",
          };
        case "diretor":
        case "gerente":
          return {
            accessDashboard: true,
            accessChat: true,
            accessManual: true,
            accessIndicadores: true,
            accessAnalise: true,
            accessSettings: false,
            dashboardDataScope: "all",
            dashboardFilterVisible: true,
            chatDataScope: "all",
          };
        case "compras":
          return {
            accessDashboard: false,
            accessChat: true,
            accessManual: true,
            accessIndicadores: false,
            accessAnalise: false,
            accessSettings: false,
            dashboardDataScope: "own",
            dashboardFilterVisible: false,
            chatDataScope: "all",
          };
        case "consultor":
        default:
          return {
            accessDashboard: true,
            accessChat: true,
            accessManual: true,
            accessIndicadores: false,
            accessAnalise: false,
            accessSettings: false,
            dashboardDataScope: "own",
            dashboardFilterVisible: false,
            chatDataScope: "all",
          };
      }
    };

    const permissions = getDefaultPermissions(args.defaultRole);

    return await ctx.db.insert("departments", {
      name: args.name,
      defaultRole: args.defaultRole,
      description: args.description,
      responsiblePersonId: args.responsiblePersonId,
      active: true,
      ...permissions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mutation para atualizar um departamento
export const updateDepartment = mutation({
  args: {
    id: v.id("departments"),
    name: v.string(),
    defaultRole: v.string(),
    description: v.optional(v.string()),
    responsiblePersonId: v.optional(v.id("people")),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verificar se já existe outro departamento com esse nome
    const existing = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing && existing._id !== args.id) {
      throw new Error("Já existe um departamento com esse nome");
    }

    // Verificar se a pessoa responsável existe (se fornecido)
    if (args.responsiblePersonId) {
      const responsible = await ctx.db.get(args.responsiblePersonId);
      if (!responsible || !responsible.active) {
        throw new Error("Pessoa responsável não encontrada ou inativa");
      }
    }

    // Definir permissões padrão baseadas no papel
    const getDefaultPermissions = (role: string) => {
      switch (role) {
        case "admin":
          return {
            accessDashboard: true,
            accessChat: true,
            accessManual: true,
            accessIndicadores: true,
            accessAnalise: true,
            accessSettings: true,
            dashboardDataScope: "all",
            dashboardFilterVisible: true,
            chatDataScope: "all",
          };
        case "diretor":
        case "gerente":
          return {
            accessDashboard: true,
            accessChat: true,
            accessManual: true,
            accessIndicadores: true,
            accessAnalise: true,
            accessSettings: false,
            dashboardDataScope: "all",
            dashboardFilterVisible: true,
            chatDataScope: "all",
          };
        case "compras":
          return {
            accessDashboard: false,
            accessChat: true,
            accessManual: true,
            accessIndicadores: false,
            accessAnalise: false,
            accessSettings: false,
            dashboardDataScope: "own",
            dashboardFilterVisible: false,
            chatDataScope: "all",
          };
        case "consultor":
        default:
          return {
            accessDashboard: true,
            accessChat: true,
            accessManual: true,
            accessIndicadores: false,
            accessAnalise: false,
            accessSettings: false,
            dashboardDataScope: "own",
            dashboardFilterVisible: false,
            chatDataScope: "all",
          };
      }
    };

    const permissions = getDefaultPermissions(args.defaultRole);

    await ctx.db.patch(args.id, {
      name: args.name,
      defaultRole: args.defaultRole,
      description: args.description,
      responsiblePersonId: args.responsiblePersonId,
      active: args.active,
      ...permissions,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation para ativar/desativar um departamento
export const toggleDepartmentStatus = mutation({
  args: {
    id: v.id("departments"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      active: args.active,
      updatedAt: Date.now(),
    });
  },
});

// Mutation para deletar um departamento (soft delete)
export const deleteDepartment = mutation({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    // Verificar se existem usuários usando este departamento
    const usersInDepartment = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("department"), args.id))
      .collect();

    if (usersInDepartment.length > 0) {
      throw new Error(
        "Não é possível deletar um departamento que possui usuários associados"
      );
    }

    return await ctx.db.patch(args.id, {
      active: false,
      updatedAt: Date.now(),
    });
  },
});

// Mutation para inicializar departamentos padrão
export const initializeDefaultDepartments = mutation({
  handler: async (ctx) => {
    // Verificar se já existem departamentos
    const existingDepartments = await ctx.db.query("departments").collect();

    if (existingDepartments.length > 0) {
      return {
        success: false,
        message: "Departamentos já foram inicializados",
      };
    }

    const defaultDepartments = [
      {
        name: "consultor",
        defaultRole: "consultor",
        description: "Consultores e vendedores",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: false,
        accessAnalise: false,
        accessSettings: false,
        dashboardDataScope: "own",
        dashboardFilterVisible: false,
        chatDataScope: "own",
      },
      {
        name: "qualidade_pcp",
        defaultRole: "qualidade_pcp",
        description: "Departamento de qualidade e planejamento",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true,
        accessAnalise: true,
        accessSettings: false,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
      {
        name: "compras",
        defaultRole: "compras",
        description: "Departamento de compras e suprimentos",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: false,
        accessAnalise: false,
        accessSettings: false,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
      {
        name: "gerente",
        defaultRole: "gerente",
        description: "Gerência",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true,
        accessAnalise: true,
        accessSettings: true,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
      {
        name: "diretor",
        defaultRole: "diretor",
        description: "Diretoria",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true,
        accessAnalise: true,
        accessSettings: true,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
      {
        name: "admin",
        defaultRole: "admin",
        description: "Administradores do sistema",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true,
        accessAnalise: true,
        accessSettings: true,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
    ];

    const createdDepartments = [];

    for (const dept of defaultDepartments) {
      const departmentId = await ctx.db.insert("departments", {
        name: dept.name,
        defaultRole: dept.defaultRole,
        description: dept.description,
        active: true,
        accessDashboard: dept.accessDashboard,
        accessChat: dept.accessChat,
        accessManual: dept.accessManual,
        accessIndicadores: dept.accessIndicadores,
        accessAnalise: dept.accessAnalise,
        accessSettings: dept.accessSettings,
        dashboardDataScope: dept.dashboardDataScope,
        dashboardFilterVisible: dept.dashboardFilterVisible,
        chatDataScope: dept.chatDataScope,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      createdDepartments.push(departmentId);
    }

    return {
      success: true,
      message: `${createdDepartments.length} departamentos criados com sucesso`,
      departments: createdDepartments,
    };
  },
});

// Query para obter departamento por nome
export const getDepartmentByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("name"), args.name))
      .filter((q) => q.eq(q.field("active"), true))
      .first();
  },
});

// Query para listar usuários de um departamento específico
export const getUsersByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .collect();
  },
});

// Query para obter estatísticas de usuários por departamento
export const getDepartmentStats = query({
  handler: async (ctx) => {
    const departments = await ctx.db.query("departments").collect();
    const stats = [];

    for (const dept of departments) {
      const users = await ctx.db
        .query("users")
        .withIndex("by_department", (q) => q.eq("departmentId", dept._id))
        .collect();

      const activeUsers = users.filter(user => user.lastLogin &&
        (Date.now() - user.lastLogin) < (30 * 24 * 60 * 60 * 1000) // últimos 30 dias
      ).length;

      stats.push({
        department: dept,
        totalUsers: users.length,
        activeUsers,
        users: users.map(user => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          position: user.position,
          lastLogin: user.lastLogin,
          isAdmin: user.isAdmin || false,
        })),
      });
    }

    return stats;
  },
});

// Mutation para mover usuário entre departamentos
export const moveUserToDepartment = mutation({
  args: {
    userId: v.id("users"),
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    // Buscar o departamento
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Atualizar o usuário - o role agora é o mesmo nome do departamento
    await ctx.db.patch(args.userId, {
      departmentId: args.departmentId,
      role: department.name, // O papel é o nome do departamento
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Query para obter permissões de um departamento pelo nome (role)
export const getDepartmentPermissions = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const department = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("name"), args.role))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!department) {
      return null;
    }

    return {
      role: department.name,
      accessDashboard: department.accessDashboard,
      accessChat: department.accessChat,
      accessManual: department.accessManual,
      accessIndicadores: department.accessIndicadores,
      accessAnalise: department.accessAnalise,
      accessSettings: department.accessSettings,
      dashboardDataScope: department.dashboardDataScope,
      dashboardFilterVisible: department.dashboardFilterVisible,
      chatDataScope: department.chatDataScope,
    };
  },
});

// Mutation para limpar e recriar departamentos
export const resetDepartments = mutation({
  handler: async (ctx) => {
    // Deletar todos os departamentos existentes
    const existingDepartments = await ctx.db.query("departments").collect();
    for (const dept of existingDepartments) {
      await ctx.db.delete(dept._id);
    }

    // Recriar os departamentos com a nova estrutura
    const defaultDepartments = [
      {
        name: "consultor",
        defaultRole: "consultor",
        description: "Consultores e vendedores",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: false,
        accessAnalise: false,
        accessSettings: false,
        dashboardDataScope: "own",
        dashboardFilterVisible: false,
        chatDataScope: "own",
      },
      {
        name: "qualidade_pcp",
        defaultRole: "qualidade_pcp",
        description: "Departamento de qualidade e planejamento",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true,
        accessAnalise: true,
        accessSettings: false,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
      {
        name: "compras",
        defaultRole: "compras",
        description: "Departamento de compras e suprimentos",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: false,
        accessAnalise: false,
        accessSettings: false,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
      {
        name: "gerente",
        defaultRole: "gerente",
        description: "Gerência",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true,
        accessAnalise: true,
        accessSettings: true,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
      {
        name: "diretor",
        defaultRole: "diretor",
        description: "Diretoria",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true,
        accessAnalise: true,
        accessSettings: true,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
      {
        name: "admin",
        defaultRole: "admin",
        description: "Administradores do sistema",
        accessDashboard: true,
        accessChat: true,
        accessManual: true,
        accessIndicadores: true,
        accessAnalise: true,
        accessSettings: true,
        dashboardDataScope: "all",
        dashboardFilterVisible: true,
        chatDataScope: "all",
      },
    ];

    const createdDepartments = [];

    for (const dept of defaultDepartments) {
      const departmentId = await ctx.db.insert("departments", {
        name: dept.name,
        defaultRole: dept.defaultRole,
        description: dept.description,
        active: true,
        accessDashboard: dept.accessDashboard,
        accessChat: dept.accessChat,
        accessManual: dept.accessManual,
        accessIndicadores: dept.accessIndicadores,
        accessAnalise: dept.accessAnalise,
        accessSettings: dept.accessSettings,
        dashboardDataScope: dept.dashboardDataScope,
        dashboardFilterVisible: dept.dashboardFilterVisible,
        chatDataScope: dept.chatDataScope,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      createdDepartments.push(departmentId);
    }

    return {
      success: true,
      message: `${createdDepartments.length} departamentos recriados com sucesso`,
      departments: createdDepartments,
    };
  },
});

// Funções para gerenciar membros dos departamentos

// Listar membros de um departamento
export const listDepartmentMembers = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("departmentMembers")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .collect();
  },
});

// Adicionar membro ao departamento
export const addDepartmentMember = mutation({
  args: {
    departmentId: v.id("departments"),
    userId: v.id("users"),
    role: v.optional(v.string()),
    supervisorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verificar se o departamento existe
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Verificar se o usuário existe
    const user = await ctx.db.get(args.userId);
    if (!user) {
      // Retornar permissões padrão para usuários não encontrados
      return {
        canSeeAllData: false,
        canSeeResponsavelFilter: false,
        isSpecialUser: false,
        department: "consultor",
        permissions: {
          accessDashboard: true,
          accessChat: true,
          accessManual: true,
          accessIndicadores: false,
          accessAnalise: false,
          accessSettings: false,
        }
      };
    }

    // Verificar se o supervisor existe (se fornecido)
    if (args.supervisorId) {
      const supervisor = await ctx.db.get(args.supervisorId);
      if (!supervisor) {
        throw new Error("Supervisor não encontrado");
      }
    }

    // Verificar se o membro já existe no departamento
    const existingMember = await ctx.db
      .query("departmentMembers")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingMember) {
      throw new Error("Usuário já é membro deste departamento");
    }

    const memberId = await ctx.db.insert("departmentMembers", {
      departmentId: args.departmentId,
      userId: args.userId,
      name: user.name,
      role: args.role?.trim(),
      supervisorId: args.supervisorId,
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, memberId };
  },
});

// Atualizar membro do departamento
export const updateDepartmentMember = mutation({
  args: {
    memberId: v.id("departmentMembers"),
    name: v.string(),
    role: v.optional(v.string()),
    supervisorId: v.optional(v.id("users")),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verificar se o supervisor existe (se fornecido)
    if (args.supervisorId) {
      const supervisor = await ctx.db.get(args.supervisorId);
      if (!supervisor) {
        throw new Error("Supervisor não encontrado");
      }
    }

    await ctx.db.patch(args.memberId, {
      name: args.name.trim(),
      role: args.role?.trim(),
      supervisorId: args.supervisorId,
      active: args.active,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Remover membro do departamento
export const removeDepartmentMember = mutation({
  args: { memberId: v.id("departmentMembers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.memberId);
    return { success: true };
  },
});

// Alternar status do membro
export const toggleMemberStatus = mutation({
  args: {
    memberId: v.id("departmentMembers"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.memberId, {
      active: args.active,
      updatedAt: now,
    });

    return { success: true };
  },
});
// Query para verificar permissões do usuário baseadas no departamento
export const getUserPermissions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      // Retornar permissões padrão para usuários não encontrados
      return {
        canSeeAllData: false,
        canSeeResponsavelFilter: false,
        isSpecialUser: false,
        department: "consultor",
        permissions: {
          accessDashboard: true,
          accessChat: true,
          accessManual: true,
          accessIndicadores: false,
          accessAnalise: false,
          accessSettings: false,
        }
      };
    }

    // Buscar departamento do usuário
    const department = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("name"), user.department))
      .first();

    if (!department) {
      // Se não encontrar departamento, usar permissões padrão de consultor
      return {
        canSeeAllData: false,
        canSeeResponsavelFilter: false,
        isSpecialUser: false,
        department: user.department || "consultor"
      };
    }

    return {
      canSeeAllData: department.dashboardDataScope === "all",
      canSeeResponsavelFilter: department.dashboardFilterVisible,
      isSpecialUser: department.name === "gerente" || department.name === "diretor" || department.name === "admin",
      department: department.name,
      permissions: {
        accessDashboard: department.accessDashboard,
        accessChat: department.accessChat,
        accessManual: department.accessManual,
        accessIndicadores: department.accessIndicadores,
        accessAnalise: department.accessAnalise,
        accessSettings: department.accessSettings,
      }
    };
  },
});

// Query para verificar se usuário tem permissões especiais
export const hasSpecialPermissions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      // Retornar permissões padrão para usuários não encontrados
      return {
        canSeeAllData: false,
        canSeeResponsavelFilter: false,
        isSpecialUser: false,
        department: "consultor",
        permissions: {
          accessDashboard: true,
          accessChat: true,
          accessManual: true,
          accessIndicadores: false,
          accessAnalise: false,
          accessSettings: false,
        }
      };
    }

    // Buscar departamento do usuário
    const department = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("name"), user.department))
      .first();

    if (!department) {
      return false;
    }

    return department.name === "gerente" || department.name === "diretor" || department.name === "admin" || department.dashboardDataScope === "all";
  },
});

// Query para listar consultores para vincular como supervisores
export const listConsultors = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "consultor"))
      .filter((q) => q.neq(q.field("isAdmin"), true))
      .collect();
  },
});

// Query para obter membros supervisionados por um consultor
export const getMembersBySupervisor = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("departmentMembers")
      .withIndex("by_supervisor", (q) => q.eq("supervisorId", args.supervisorId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Enriquecer com dados do departamento
    const enrichedMembers = [];
    for (const member of members) {
      const department = await ctx.db.get(member.departmentId);
      enrichedMembers.push({
        ...member,
        departmentName: department?.name || "Departamento não encontrado"
      });
    }

    return enrichedMembers;
  },
});

// Query para obter estatísticas da equipe de um consultor
export const getTeamStats = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("departmentMembers")
      .withIndex("by_supervisor", (q) => q.eq("supervisorId", args.supervisorId))
      .collect();

    const activeMembers = members.filter(m => m.active);
    const inactiveMembers = members.filter(m => !m.active);

    // Agrupar por função/role
    const roleStats = activeMembers.reduce((acc, member) => {
      const role = member.role || "Sem função";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      inactiveMembers: inactiveMembers.length,
      roleDistribution: roleStats,
      members: activeMembers.map(m => ({
        id: m._id,
        name: m.name,
        role: m.role || "Sem função",
        departmentId: m.departmentId
      }))
    };
  },
});

// Query para obter todos os consultores e suas equipes
export const getConsultorsWithTeams = query({
  handler: async (ctx) => {
    // Busca todos os consultores
    const consultors = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "consultor"))
      .filter((q) => q.neq(q.field("isAdmin"), true))
      .collect();

    const consultorTeams = [];

    for (const consultor of consultors) {
      // Busca membros supervisionados por este consultor
      const members = await ctx.db
        .query("departmentMembers")
        .withIndex("by_supervisor", (q) => q.eq("supervisorId", consultor._id))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      consultorTeams.push({
        consultor: {
          _id: consultor._id,
          name: consultor.name,
          email: consultor.email,
          role: consultor.role
        },
        teamMembers: members.map(member => ({
          _id: member._id,
          name: member.name,
          role: member.role,
          active: member.active
        }))
      });
    }

    return consultorTeams;
  },
});

// Mutation para vincular membro a supervisor
export const assignSupervisorToMember = mutation({
  args: {
    memberId: v.id("departmentMembers"),
    supervisorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verificar se o supervisor existe
    const supervisor = await ctx.db.get(args.supervisorId);
    if (!supervisor) {
      throw new Error("Supervisor não encontrado");
    }

    // Verificar se o membro existe
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Membro não encontrado");
    }

    await ctx.db.patch(args.memberId, {
      supervisorId: args.supervisorId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation para remover supervisor de um membro
export const removeSupervisorFromMember = mutation({
  args: {
    memberId: v.id("departmentMembers"),
  },
  handler: async (ctx, args) => {
    // Verificar se o membro existe
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Membro não encontrado");
    }

    await ctx.db.patch(args.memberId, {
      supervisorId: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Query para obter estrutura completa de departamentos com hierarquias
export const getDepartmentHierarchy = query({
  handler: async (ctx) => {
    const departments = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const result = [];
    for (const dept of departments) {
      // Buscar responsável do departamento
      let responsible = null;
      if (dept.responsiblePersonId) {
        responsible = await ctx.db.get(dept.responsiblePersonId);
      }

      // Buscar subdepartamentos
      const subdepartments = await ctx.db
        .query("subdepartments")
        .withIndex("by_department", (q) => q.eq("departmentId", dept._id))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      const enrichedSubdepartments = [];
      for (const subdept of subdepartments) {
        let subResponsible = null;
        if (subdept.responsiblePersonId) {
          subResponsible = await ctx.db.get(subdept.responsiblePersonId);
        }

        // Buscar pessoas do subdepartamento
        const peopleLinks = await ctx.db
          .query("departmentPeople")
          .withIndex("by_subdepartment", (q) => q.eq("subdepartmentId", subdept._id))
          .filter((q) => q.eq(q.field("active"), true))
          .collect();

        const people = [];
        for (const link of peopleLinks) {
          const person = await ctx.db.get(link.personId);
          if (person && person.active) {
            people.push({
              ...person,
              isResponsible: link.isResponsible,
              linkId: link._id,
            });
          }
        }

        enrichedSubdepartments.push({
          ...subdept,
          responsible: subResponsible,
          people,
        });
      }

      // Buscar pessoas do departamento (sem subdepartamento específico)
      const deptPeopleLinks = await ctx.db
        .query("departmentPeople")
        .withIndex("by_department", (q) => q.eq("departmentId", dept._id))
        .filter((q) => q.eq(q.field("subdepartmentId"), undefined))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      const deptPeople = [];
      for (const link of deptPeopleLinks) {
        const person = await ctx.db.get(link.personId);
        if (person && person.active) {
          deptPeople.push({
            ...person,
            isResponsible: link.isResponsible,
            linkId: link._id,
          });
        }
      }

      result.push({
        ...dept,
        responsible,
        people: deptPeople,
        subdepartments: enrichedSubdepartments,
      });
    }

    return result;
  },
});

// Query para obter dados de dashboard baseados na hierarquia de pessoas
export const getDashboardDataByTeam = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.personId);
    if (!person) return null;

    // Buscar todas as pessoas sob responsabilidade desta pessoa (recursivamente)
    const getTeamMembersRecursive = async (personId: Id<"people">): Promise<Id<"people">[]> => {
      const directSubordinates = await ctx.db
        .query("people")
        .withIndex("by_supervisor", (q) => q.eq("supervisorId", personId))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      let allMembers = [personId];
      for (const subordinate of directSubordinates) {
        const subMembers = await getTeamMembersRecursive(subordinate._id);
        allMembers = allMembers.concat(subMembers);
      }
      return allMembers;
    };

    const teamMemberIds = await getTeamMembersRecursive(args.personId);

    // Buscar nomes dos membros da equipe (pessoas que têm usuários associados)
    const teamMembers: string[] = [];
    for (const memberId of teamMemberIds) {
      const member = await ctx.db.get(memberId);
      if (member && member.userId) {
        const user = await ctx.db.get(member.userId);
        if (user) {
          teamMembers.push(user.name);
        }
      } else if (member) {
        teamMembers.push(member.name);
      }
    }

    // Buscar itens do dashboard para os membros da equipe
    const dashboardItems = await ctx.db
      .query("dashboardItens")
      .collect();

    // Filtrar itens por responsáveis da equipe
    const teamItems = dashboardItems.filter(item =>
      item.responsavel && teamMembers.includes(item.responsavel)
    );

    // Agregar por status
    const statusCounts = teamItems.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Agregar por responsável
    const responsibleCounts = teamItems.reduce((acc, item) => {
      if (item.responsavel) {
        acc[item.responsavel] = (acc[item.responsavel] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      person,
      teamMembers,
      totalItems: teamItems.length,
      statusBreakdown: statusCounts,
      responsibleBreakdown: responsibleCounts,
      items: teamItems,
    };
  },
});

// Mutation para definir responsável de departamento
export const setDepartmentResponsible = mutation({
  args: {
    departmentId: v.id("departments"),
    personId: v.optional(v.id("people")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verificar se o departamento existe
    const department = await ctx.db.get(args.departmentId);
    if (!department || !department.active) {
      throw new Error("Departamento não encontrado ou inativo");
    }

    // Verificar se a pessoa existe (se fornecido)
    if (args.personId) {
      const person = await ctx.db.get(args.personId);
      if (!person || !person.active) {
        throw new Error("Pessoa não encontrada ou inativa");
      }
    }

    // Atualizar o departamento
    await ctx.db.patch(args.departmentId, {
      responsiblePersonId: args.personId,
      updatedAt: now,
    });

    // Se há uma pessoa sendo definida como responsável, criar/atualizar vínculo
    if (args.personId) {
      // Verificar se já existe vínculo
      const existingLink = await ctx.db
        .query("departmentPeople")
        .withIndex("by_person", (q) => q.eq("personId", args.personId!))
        .filter((q) => q.eq(q.field("departmentId"), args.departmentId))
        .filter((q) => q.eq(q.field("subdepartmentId"), undefined))
        .filter((q) => q.eq(q.field("active"), true))
        .first();

      if (existingLink) {
        // Atualizar para responsável
        await ctx.db.patch(existingLink._id, {
          isResponsible: true,
          updatedAt: now,
        });
      } else {
        // Criar novo vínculo
        await ctx.db.insert("departmentPeople", {
          personId: args.personId,
          departmentId: args.departmentId,
          subdepartmentId: undefined,
          isResponsible: true,
          active: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { success: true };
  },
});

// Query para listar membros disponíveis para supervisão (sem supervisor)
export const getUnassignedMembers = query({
  handler: async (ctx) => {
    const members = await ctx.db
      .query("departmentMembers")
      .filter((q) => q.eq(q.field("active"), true))
      .filter((q) => q.eq(q.field("supervisorId"), undefined))
      .collect();

    // Enriquecer com dados do departamento
    const enrichedMembers = [];
    for (const member of members) {
      const department = await ctx.db.get(member.departmentId);
      enrichedMembers.push({
        ...member,
        departmentName: department?.name || "Departamento não encontrado"
      });
    }

    return enrichedMembers;
  },
});