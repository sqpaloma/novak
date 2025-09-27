import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query para listar subdepartamentos de um departamento
export const listSubdepartmentsByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const subdepartments = await ctx.db
      .query("subdepartments")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();

    // Enriquecer com informações do responsável
    const enrichedSubdepartments = [];
    for (const subdept of subdepartments) {
      let responsible = null;
      if (subdept.responsiblePersonId) {
        responsible = await ctx.db.get(subdept.responsiblePersonId);
      }

      enrichedSubdepartments.push({
        ...subdept,
        responsible,
      });
    }

    return enrichedSubdepartments;
  },
});

// Query para obter um subdepartamento específico
export const getSubdepartment = query({
  args: { id: v.id("subdepartments") },
  handler: async (ctx, args) => {
    const subdepartment = await ctx.db.get(args.id);
    if (!subdepartment) return null;

    // Buscar departamento pai
    const department = await ctx.db.get(subdepartment.departmentId);

    // Buscar responsável
    let responsible = null;
    if (subdepartment.responsiblePersonId) {
      responsible = await ctx.db.get(subdepartment.responsiblePersonId);
    }

    // Buscar pessoas vinculadas
    const people = await ctx.db
      .query("departmentPeople")
      .withIndex("by_subdepartment", (q) => q.eq("subdepartmentId", args.id))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const enrichedPeople = [];
    for (const link of people) {
      const person = await ctx.db.get(link.personId);
      if (person && person.active) {
        enrichedPeople.push({
          ...person,
          isResponsible: link.isResponsible,
          linkId: link._id,
        });
      }
    }

    return {
      ...subdepartment,
      department,
      responsible,
      people: enrichedPeople,
    };
  },
});

// Mutation para criar um subdepartamento
export const createSubdepartment = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    departmentId: v.id("departments"),
    responsiblePersonId: v.optional(v.id("people")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verificar se o departamento existe
    const department = await ctx.db.get(args.departmentId);
    if (!department || !department.active) {
      throw new Error("Departamento não encontrado ou inativo");
    }

    // Verificar se já existe subdepartamento com esse nome no departamento
    const existing = await ctx.db
      .query("subdepartments")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (existing) {
      throw new Error("Já existe um subdepartamento com esse nome neste departamento");
    }

    // Verificar se a pessoa responsável existe (se fornecido)
    if (args.responsiblePersonId) {
      const responsible = await ctx.db.get(args.responsiblePersonId);
      if (!responsible || !responsible.active) {
        throw new Error("Pessoa responsável não encontrada ou inativa");
      }
    }

    return await ctx.db.insert("subdepartments", {
      name: args.name.trim(),
      description: args.description?.trim(),
      departmentId: args.departmentId,
      responsiblePersonId: args.responsiblePersonId,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation para atualizar um subdepartamento
export const updateSubdepartment = mutation({
  args: {
    id: v.id("subdepartments"),
    name: v.string(),
    description: v.optional(v.string()),
    responsiblePersonId: v.optional(v.id("people")),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Buscar o subdepartamento atual
    const subdepartment = await ctx.db.get(args.id);
    if (!subdepartment) {
      throw new Error("Subdepartamento não encontrado");
    }

    // Verificar se já existe outro subdepartamento com esse nome no mesmo departamento
    const existing = await ctx.db
      .query("subdepartments")
      .withIndex("by_department", (q) => q.eq("departmentId", subdepartment.departmentId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (existing && existing._id !== args.id) {
      throw new Error("Já existe um subdepartamento com esse nome neste departamento");
    }

    // Verificar se a pessoa responsável existe (se fornecido)
    if (args.responsiblePersonId) {
      const responsible = await ctx.db.get(args.responsiblePersonId);
      if (!responsible || !responsible.active) {
        throw new Error("Pessoa responsável não encontrada ou inativa");
      }
    }

    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      description: args.description?.trim(),
      responsiblePersonId: args.responsiblePersonId,
      active: args.active,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Mutation para ativar/desativar um subdepartamento
export const toggleSubdepartmentStatus = mutation({
  args: {
    id: v.id("subdepartments"),
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

// Mutation para definir responsável de um subdepartamento
export const setSubdepartmentResponsible = mutation({
  args: {
    subdepartmentId: v.id("subdepartments"),
    personId: v.optional(v.id("people")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verificar se o subdepartamento existe
    const subdepartment = await ctx.db.get(args.subdepartmentId);
    if (!subdepartment || !subdepartment.active) {
      throw new Error("Subdepartamento não encontrado ou inativo");
    }

    // Verificar se a pessoa existe (se fornecido)
    if (args.personId) {
      const person = await ctx.db.get(args.personId);
      if (!person || !person.active) {
        throw new Error("Pessoa não encontrada ou inativa");
      }
    }

    // Atualizar o subdepartamento
    await ctx.db.patch(args.subdepartmentId, {
      responsiblePersonId: args.personId,
      updatedAt: now,
    });

    // Se há uma pessoa sendo definida como responsável, criar/atualizar vínculo
    if (args.personId) {
      // Verificar se já existe vínculo
      const existingLink = await ctx.db
        .query("departmentPeople")
        .withIndex("by_person", (q) => q.eq("personId", args.personId!))
        .filter((q) => q.eq(q.field("subdepartmentId"), args.subdepartmentId))
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
          departmentId: subdepartment.departmentId,
          subdepartmentId: args.subdepartmentId,
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

// Query para obter todos os subdepartamentos com suas hierarquias
export const getAllSubdepartmentsWithHierarchy = query({
  handler: async (ctx) => {
    // Buscar todos os departamentos
    const departments = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const result = [];
    for (const dept of departments) {
      // Buscar subdepartamentos do departamento
      const subdepartments = await ctx.db
        .query("subdepartments")
        .withIndex("by_department", (q) => q.eq("departmentId", dept._id))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      // Enriquecer subdepartamentos com responsáveis e pessoas
      const enrichedSubdepartments = [];
      for (const subdept of subdepartments) {
        let responsible = null;
        if (subdept.responsiblePersonId) {
          responsible = await ctx.db.get(subdept.responsiblePersonId);
        }

        // Buscar pessoas vinculadas ao subdepartamento
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
            });
          }
        }

        enrichedSubdepartments.push({
          ...subdept,
          responsible,
          people,
        });
      }

      // Buscar responsável do departamento
      let deptResponsible = null;
      if (dept.responsiblePersonId) {
        deptResponsible = await ctx.db.get(dept.responsiblePersonId);
      }

      result.push({
        ...dept,
        responsible: deptResponsible,
        subdepartments: enrichedSubdepartments,
      });
    }

    return result;
  },
});

// Query para obter subdepartamentos que uma pessoa é responsável
export const getSubdepartmentsByResponsible = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const subdepartments = await ctx.db
      .query("subdepartments")
      .filter((q) => q.eq(q.field("responsiblePersonId"), args.personId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Enriquecer com informações do departamento
    const enrichedSubdepartments = [];
    for (const subdept of subdepartments) {
      const department = await ctx.db.get(subdept.departmentId);
      enrichedSubdepartments.push({
        ...subdept,
        department,
      });
    }

    return enrichedSubdepartments;
  },
});

// Query para obter estatísticas de subdepartamentos
export const getSubdepartmentStats = query({
  handler: async (ctx) => {
    const departments = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const stats = [];
    for (const dept of departments) {
      const subdepartments = await ctx.db
        .query("subdepartments")
        .withIndex("by_department", (q) => q.eq("departmentId", dept._id))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      const subdepartmentsWithResponsible = subdepartments.filter(s => s.responsiblePersonId);
      const totalPeople = await ctx.db
        .query("departmentPeople")
        .withIndex("by_department", (q) => q.eq("departmentId", dept._id))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      stats.push({
        department: dept,
        totalSubdepartments: subdepartments.length,
        subdepartmentsWithResponsible: subdepartmentsWithResponsible.length,
        totalPeople: totalPeople.length,
      });
    }

    return stats;
  },
});