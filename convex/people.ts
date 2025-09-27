import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query para listar todas as pessoas
export const listPeople = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();
  },
});

// Query para listar pessoas por função/cargo
export const listPeopleByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("people")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();
  },
});

// Query para obter uma pessoa específica
export const getPerson = query({
  args: { id: v.id("people") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query para obter pessoas supervisionadas por alguém
export const getSubordinates = query({
  args: { supervisorId: v.id("people") },
  handler: async (ctx, args) => {
    const subordinates = await ctx.db
      .query("people")
      .withIndex("by_supervisor", (q) => q.eq("supervisorId", args.supervisorId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Enriquecer com departamentos/subdepartamentos
    const enrichedSubordinates = [];
    for (const person of subordinates) {
      const departments = await ctx.db
        .query("departmentPeople")
        .withIndex("by_person", (q) => q.eq("personId", person._id))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      enrichedSubordinates.push({
        ...person,
        departments,
      });
    }

    return enrichedSubordinates;
  },
});

// Query para obter hierarquia completa a partir de uma pessoa
export const getPersonHierarchy = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.personId);
    if (!person) return null;

    // Buscar subordinados diretos
    const directSubordinates = await ctx.db
      .query("people")
      .withIndex("by_supervisor", (q) => q.eq("supervisorId", args.personId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Recursivamente buscar subordinados dos subordinados
    const getAllSubordinates = async (personId: Id<"people">): Promise<any[]> => {
      const subs = await ctx.db
        .query("people")
        .withIndex("by_supervisor", (q) => q.eq("supervisorId", personId))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      const result = [];
      for (const sub of subs) {
        const subSubordinates = await getAllSubordinates(sub._id);
        result.push({
          ...sub,
          subordinates: subSubordinates,
        });
      }
      return result;
    };

    const allSubordinates = await getAllSubordinates(args.personId);

    return {
      ...person,
      subordinates: allSubordinates,
    };
  },
});

// Mutation para criar uma nova pessoa
export const createPerson = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    role: v.string(),
    userId: v.optional(v.id("users")),
    supervisorId: v.optional(v.id("people")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Email é obrigatório para todos exceto Mecânico
    const roleLower = args.role.toLowerCase();
    const isMechanicRole = roleLower.includes("mecânico") || roleLower.includes("mecanico");

    if (!isMechanicRole && !args.email) {
      throw new Error("Email é obrigatório para esta função");
    }

    // Verificar se já existe pessoa com esse email (se fornecido)
    if (args.email) {
      const existing = await ctx.db
        .query("people")
        .filter((q) => q.eq(q.field("email"), args.email))
        .filter((q) => q.eq(q.field("active"), true))
        .first();

      if (existing) {
        throw new Error("Já existe uma pessoa com esse email");
      }
    }

    // Verificar se o supervisor existe (se fornecido)
    if (args.supervisorId) {
      const supervisor = await ctx.db.get(args.supervisorId);
      if (!supervisor || !supervisor.active) {
        throw new Error("Supervisor não encontrado ou inativo");
      }
    }

    // Verificar se o usuário existe (se fornecido)
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
    }

    return await ctx.db.insert("people", {
      name: args.name.trim(),
      email: args.email?.trim(),
      role: args.role.trim(),
      userId: args.userId,
      supervisorId: args.supervisorId,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation para atualizar uma pessoa
export const updatePerson = mutation({
  args: {
    id: v.id("people"),
    name: v.string(),
    email: v.optional(v.string()),
    role: v.string(),
    userId: v.optional(v.id("users")),
    supervisorId: v.optional(v.id("people")),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Email é obrigatório para todos exceto Mecânico
    const roleLower = args.role.toLowerCase();
    const isMechanicRole = roleLower.includes("mecânico") || roleLower.includes("mecanico");

    if (!isMechanicRole && !args.email) {
      throw new Error("Email é obrigatório para esta função");
    }

    // Verificar se já existe outra pessoa com esse email (se fornecido)
    if (args.email) {
      const existing = await ctx.db
        .query("people")
        .filter((q) => q.eq(q.field("email"), args.email))
        .filter((q) => q.eq(q.field("active"), true))
        .first();

      if (existing && existing._id !== args.id) {
        throw new Error("Já existe uma pessoa com esse email");
      }
    }

    // Verificar se o supervisor existe (se fornecido)
    if (args.supervisorId) {
      const supervisor = await ctx.db.get(args.supervisorId);
      if (!supervisor || !supervisor.active) {
        throw new Error("Supervisor não encontrado ou inativo");
      }

      // Verificar se não está criando ciclo hierárquico
      if (args.supervisorId === args.id) {
        throw new Error("Uma pessoa não pode ser supervisora de si mesma");
      }
    }

    // Verificar se o usuário existe (se fornecido)
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
    }

    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      email: args.email?.trim(),
      role: args.role.trim(),
      userId: args.userId,
      supervisorId: args.supervisorId,
      active: args.active,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Mutation para ativar/desativar uma pessoa
export const togglePersonStatus = mutation({
  args: {
    id: v.id("people"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      active: args.active,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation para vincular pessoa a departamento/subdepartamento
export const linkPersonToDepartment = mutation({
  args: {
    personId: v.id("people"),
    departmentId: v.optional(v.id("departments")),
    subdepartmentId: v.optional(v.id("subdepartments")),
    isResponsible: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verificar se a pessoa existe
    const person = await ctx.db.get(args.personId);
    if (!person || !person.active) {
      throw new Error("Pessoa não encontrada ou inativa");
    }

    // Verificar se o departamento existe (se fornecido)
    if (args.departmentId) {
      const department = await ctx.db.get(args.departmentId);
      if (!department || !department.active) {
        throw new Error("Departamento não encontrado ou inativo");
      }
    }

    // Verificar se o subdepartamento existe (se fornecido)
    if (args.subdepartmentId) {
      const subdepartment = await ctx.db.get(args.subdepartmentId);
      if (!subdepartment || !subdepartment.active) {
        throw new Error("Subdepartamento não encontrado ou inativo");
      }
    }

    // Verificar se já existe vínculo
    const existingLink = await ctx.db
      .query("departmentPeople")
      .withIndex("by_person", (q) => q.eq("personId", args.personId))
      .filter((q) => q.eq(q.field("departmentId"), args.departmentId))
      .filter((q) => q.eq(q.field("subdepartmentId"), args.subdepartmentId))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (existingLink) {
      throw new Error("Pessoa já está vinculada a este departamento/subdepartamento");
    }

    return await ctx.db.insert("departmentPeople", {
      personId: args.personId,
      departmentId: args.departmentId,
      subdepartmentId: args.subdepartmentId,
      isResponsible: args.isResponsible,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation para desvincular pessoa de departamento/subdepartamento
export const unlinkPersonFromDepartment = mutation({
  args: {
    linkId: v.id("departmentPeople"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.linkId, {
      active: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Query para obter pessoas vinculadas a um departamento
export const getPeopleByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("departmentPeople")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const peopleWithRoles = [];
    for (const link of links) {
      const person = await ctx.db.get(link.personId);
      if (person && person.active) {
        peopleWithRoles.push({
          ...person,
          isResponsible: link.isResponsible,
          linkId: link._id,
        });
      }
    }

    return peopleWithRoles;
  },
});

// Query para obter pessoas vinculadas a um subdepartamento
export const getPeopleBySubdepartment = query({
  args: { subdepartmentId: v.id("subdepartments") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("departmentPeople")
      .withIndex("by_subdepartment", (q) => q.eq("subdepartmentId", args.subdepartmentId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const peopleWithRoles = [];
    for (const link of links) {
      const person = await ctx.db.get(link.personId);
      if (person && person.active) {
        peopleWithRoles.push({
          ...person,
          isResponsible: link.isResponsible,
          linkId: link._id,
        });
      }
    }

    return peopleWithRoles;
  },
});

// Query para obter todas as pessoas organizadas por função
export const getPeopleByRoleHierarchy = query({
  handler: async (ctx) => {
    const allPeople = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Organizar por função hierárquica
    const hierarchy = {
      diretor: [] as any[],
      gerente: [] as any[],
      consultor: [] as any[],
      mecanico: [] as any[],
      outros: [] as any[],
    };

    for (const person of allPeople) {
      const role = person.role.toLowerCase();
      if (role.includes("diretor")) {
        hierarchy.diretor.push(person);
      } else if (role.includes("gerente")) {
        hierarchy.gerente.push(person);
      } else if (role.includes("consultor")) {
        hierarchy.consultor.push(person);
      } else if (role.includes("mecânico") || role.includes("mecanico")) {
        hierarchy.mecanico.push(person);
      } else {
        hierarchy.outros.push(person);
      }
    }

    return hierarchy;
  },
});

// Query para obter equipe completa de uma pessoa (inclui subordinados recursivamente)
export const getPersonTeam = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.personId);
    if (!person) return null;

    // Função recursiva para buscar toda a hierarquia
    const getTeamRecursive = async (personId: Id<"people">): Promise<any[]> => {
      const directSubordinates = await ctx.db
        .query("people")
        .withIndex("by_supervisor", (q) => q.eq("supervisorId", personId))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      const result = [];
      for (const subordinate of directSubordinates) {
        const subTeam = await getTeamRecursive(subordinate._id);
        result.push({
          ...subordinate,
          team: subTeam,
        });
      }
      return result;
    };

    const team = await getTeamRecursive(args.personId);

    // Agregar estatísticas da equipe
    const getAllTeamMembers = (teamArray: any[]): any[] => {
      let members = [...teamArray];
      for (const member of teamArray) {
        if (member.team && member.team.length > 0) {
          members = members.concat(getAllTeamMembers(member.team));
        }
      }
      return members;
    };

    const allTeamMembers = getAllTeamMembers(team);
    const roleStats = allTeamMembers.reduce((acc, member) => {
      const role = member.role || "Sem função";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      person,
      team,
      stats: {
        totalMembers: allTeamMembers.length,
        roleDistribution: roleStats,
      },
    };
  },
});