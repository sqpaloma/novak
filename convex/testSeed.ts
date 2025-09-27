import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Função simples para testar a criação de pessoas e estrutura
export const createTestStructure = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    try {
      // 1. Criar departamento consultor se não existir
      let consultorDept = await ctx.db
        .query("departments")
        .filter((q) => q.eq(q.field("name"), "consultor"))
        .first();

      if (!consultorDept) {
        const deptId = await ctx.db.insert("departments", {
          name: "consultor",
          defaultRole: "consultor",
          description: "Departamento de Consultores e Mecânicos",
          active: true,
          accessDashboard: true,
          accessChat: true,
          accessManual: true,
          accessIndicadores: false,
          accessAnalise: false,
          accessSettings: false,
          dashboardDataScope: "own",
          dashboardFilterVisible: false,
          chatDataScope: "own",
          createdAt: now,
          updatedAt: now,
        });
        consultorDept = await ctx.db.get(deptId);
      }

      if (!consultorDept) {
        throw new Error("Falha ao criar departamento");
      }

      // 2. Criar Giovanni (Gerente)
      const giovanniId = await ctx.db.insert("people", {
        name: "Giovanni",
        role: "Gerente",
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      // 3. Criar alguns consultores
      const lucasId = await ctx.db.insert("people", {
        name: "Lucas Santos",
        role: "Consultor",
        supervisorId: giovanniId,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      const rafaelId = await ctx.db.insert("people", {
        name: "Rafael Massa",
        role: "Consultor",
        supervisorId: giovanniId,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      // 4. Criar subdepartamento de teste
      const subdeptId = await ctx.db.insert("subdepartments", {
        name: "Setor 1 - Bombas e Motores de Grande Porte",
        description: "Setor gerenciado por Lucas Santos",
        departmentId: consultorDept._id,
        responsiblePersonId: lucasId,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      // 5. Criar alguns mecânicos
      const alexandreId = await ctx.db.insert("people", {
        name: "Alexandre",
        role: "Mecânico",
        supervisorId: lucasId,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      const alexsandroId = await ctx.db.insert("people", {
        name: "Alexsandro",
        role: "Mecânico",
        supervisorId: lucasId,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      // 6. Criar vínculos
      await ctx.db.insert("departmentPeople", {
        personId: giovanniId,
        departmentId: consultorDept._id,
        isResponsible: true,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("departmentPeople", {
        personId: lucasId,
        departmentId: consultorDept._id,
        subdepartmentId: subdeptId,
        isResponsible: true,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("departmentPeople", {
        personId: alexandreId,
        departmentId: consultorDept._id,
        subdepartmentId: subdeptId,
        isResponsible: false,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("departmentPeople", {
        personId: alexsandroId,
        departmentId: consultorDept._id,
        subdepartmentId: subdeptId,
        isResponsible: false,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        message: "Estrutura teste criada com sucesso!",
        data: {
          giovanni: giovanniId,
          lucas: lucasId,
          rafael: rafaelId,
          subdepartamento: subdeptId,
          mecanicos: [alexandreId, alexsandroId],
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Erro: ${error}`,
      };
    }
  },
});