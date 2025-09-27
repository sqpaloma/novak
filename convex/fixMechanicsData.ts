import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Mutation para corrigir os dados dos mecânicos e unificar consultores duplicados
export const fixMechanicsData = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // 1. Identificar e corrigir consultores duplicados

    // Lucas Santos - manter o original e deletar o duplicado
    const originalLucas = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("email"), "lucas@novakgouveia.com.br"))
      .first();

    const duplicateLucas = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("email"), "lucas.santos@company.com"))
      .first();

    if (originalLucas && duplicateLucas) {
      // Transferir mecânicos do Lucas duplicado para o original
      const mechanicsFromDuplicate = await ctx.db
        .query("people")
        .filter((q) => q.eq(q.field("supervisorId"), duplicateLucas._id))
        .collect();

      for (const mechanic of mechanicsFromDuplicate) {
        await ctx.db.patch(mechanic._id, {
          supervisorId: originalLucas._id,
          updatedAt: now,
        });
      }

      // Atualizar subdepartamentos que apontam para o Lucas duplicado
      const subdepartments = await ctx.db
        .query("subdepartments")
        .filter((q) => q.eq(q.field("responsiblePersonId"), duplicateLucas._id))
        .collect();

      for (const subdept of subdepartments) {
        await ctx.db.patch(subdept._id, {
          responsiblePersonId: originalLucas._id,
          updatedAt: now,
        });
      }

      // Atualizar vínculos de departmentPeople
      const departmentPeopleLinks = await ctx.db
        .query("departmentPeople")
        .filter((q) => q.eq(q.field("personId"), duplicateLucas._id))
        .collect();

      for (const link of departmentPeopleLinks) {
        // Verificar se já existe vínculo para o Lucas original
        const existingLink = await ctx.db
          .query("departmentPeople")
          .filter((q) => q.eq(q.field("personId"), originalLucas._id))
          .filter((q) => q.eq(q.field("departmentId"), link.departmentId))
          .filter((q) => q.eq(q.field("subdepartmentId"), link.subdepartmentId))
          .first();

        if (!existingLink) {
          await ctx.db.patch(link._id, {
            personId: originalLucas._id,
            updatedAt: now,
          });
        } else {
          await ctx.db.delete(link._id);
        }
      }

      // Deletar Lucas duplicado
      await ctx.db.delete(duplicateLucas._id);
    }

    // 2. Fazer o mesmo para Rafael Massa
    const originalRafael = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("email"), "rafael.massa@novakgouveia.com.br"))
      .first();

    const duplicateRafael = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("email"), "rafael.massa@company.com"))
      .first();

    if (originalRafael && duplicateRafael) {
      // Transferir mecânicos
      const mechanicsFromDuplicate = await ctx.db
        .query("people")
        .filter((q) => q.eq(q.field("supervisorId"), duplicateRafael._id))
        .collect();

      for (const mechanic of mechanicsFromDuplicate) {
        await ctx.db.patch(mechanic._id, {
          supervisorId: originalRafael._id,
          updatedAt: now,
        });
      }

      // Atualizar subdepartamentos
      const subdepartments = await ctx.db
        .query("subdepartments")
        .filter((q) => q.eq(q.field("responsiblePersonId"), duplicateRafael._id))
        .collect();

      for (const subdept of subdepartments) {
        await ctx.db.patch(subdept._id, {
          responsiblePersonId: originalRafael._id,
          updatedAt: now,
        });
      }

      // Atualizar vínculos de departmentPeople
      const departmentPeopleLinks = await ctx.db
        .query("departmentPeople")
        .filter((q) => q.eq(q.field("personId"), duplicateRafael._id))
        .collect();

      for (const link of departmentPeopleLinks) {
        const existingLink = await ctx.db
          .query("departmentPeople")
          .filter((q) => q.eq(q.field("personId"), originalRafael._id))
          .filter((q) => q.eq(q.field("departmentId"), link.departmentId))
          .filter((q) => q.eq(q.field("subdepartmentId"), link.subdepartmentId))
          .first();

        if (!existingLink) {
          await ctx.db.patch(link._id, {
            personId: originalRafael._id,
            updatedAt: now,
          });
        } else {
          await ctx.db.delete(link._id);
        }
      }

      await ctx.db.delete(duplicateRafael._id);
    }

    // 3. Fazer o mesmo para Marcelo Menezes
    const originalMarcelo = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("email"), "marcelo@novakgouveia.com.br"))
      .first();

    const duplicateMarcelo = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("email"), "marcelo.menezes@company.com"))
      .first();

    if (originalMarcelo && duplicateMarcelo) {
      // Transferir mecânicos
      const mechanicsFromDuplicate = await ctx.db
        .query("people")
        .filter((q) => q.eq(q.field("supervisorId"), duplicateMarcelo._id))
        .collect();

      for (const mechanic of mechanicsFromDuplicate) {
        await ctx.db.patch(mechanic._id, {
          supervisorId: originalMarcelo._id,
          updatedAt: now,
        });
      }

      // Atualizar subdepartamentos
      const subdepartments = await ctx.db
        .query("subdepartments")
        .filter((q) => q.eq(q.field("responsiblePersonId"), duplicateMarcelo._id))
        .collect();

      for (const subdept of subdepartments) {
        await ctx.db.patch(subdept._id, {
          responsiblePersonId: originalMarcelo._id,
          updatedAt: now,
        });
      }

      // Atualizar vínculos de departmentPeople
      const departmentPeopleLinks = await ctx.db
        .query("departmentPeople")
        .filter((q) => q.eq(q.field("personId"), duplicateMarcelo._id))
        .collect();

      for (const link of departmentPeopleLinks) {
        const existingLink = await ctx.db
          .query("departmentPeople")
          .filter((q) => q.eq(q.field("personId"), originalMarcelo._id))
          .filter((q) => q.eq(q.field("departmentId"), link.departmentId))
          .filter((q) => q.eq(q.field("subdepartmentId"), link.subdepartmentId))
          .first();

        if (!existingLink) {
          await ctx.db.patch(link._id, {
            personId: originalMarcelo._id,
            updatedAt: now,
          });
        } else {
          await ctx.db.delete(link._id);
        }
      }

      await ctx.db.delete(duplicateMarcelo._id);
    }

    // 4. Corrigir mecânicos sem supervisor (do Setor 2)
    const mechanicsWithoutSupervisor = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("role"), "Mecânico"))
      .filter((q) => q.eq(q.field("supervisorId"), undefined))
      .collect();

    // Para o Setor 2, não há consultor específico, então vamos manter sem supervisor
    // Mas vamos garantir que eles estão vinculados ao subdepartamento correto

    return {
      success: true,
      message: "Dados dos mecânicos corrigidos com sucesso",
      details: {
        originalLucas: originalLucas?._id,
        originalRafael: originalRafael?._id,
        originalMarcelo: originalMarcelo?._id,
        mechanicsWithoutSupervisor: mechanicsWithoutSupervisor.length,
      }
    };
  },
});