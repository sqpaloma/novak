import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Função simplificada para criar a estrutura básica
export const createBasicStructure = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    try {
      // 1. Buscar ou criar departamento consultor
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

      // 2. Criar Giovanni se não existir
      let giovanni = await ctx.db
        .query("people")
        .filter((q) => q.eq(q.field("name"), "Giovanni"))
        .filter((q) => q.eq(q.field("role"), "Gerente"))
        .first();

      if (!giovanni) {
        const giovanniId = await ctx.db.insert("people", {
          name: "Giovanni",
          role: "Gerente",
          active: true,
          createdAt: now,
          updatedAt: now,
        });
        giovanni = await ctx.db.get(giovanniId);

        if (giovanni) {
          // Vincular Giovanni ao departamento
          await ctx.db.insert("departmentPeople", {
            personId: giovanni._id,
            departmentId: consultorDept._id,
            isResponsible: true,
            active: true,
            createdAt: now,
            updatedAt: now,
          });

          // Atualizar departamento
          await ctx.db.patch(consultorDept._id, {
            responsiblePersonId: giovanni._id,
            updatedAt: now,
          });
        }
      }

      // 3. Criar consultores básicos
      const consultores = [
        "Lucas Santos",
        "Rafael Massa",
        "Marcelo Menezes"
      ];

      const consultorIds = [];
      for (const nome of consultores) {
        let consultor = await ctx.db
          .query("people")
          .filter((q) => q.eq(q.field("name"), nome))
          .filter((q) => q.eq(q.field("role"), "Consultor"))
          .first();

        if (!consultor && giovanni) {
          const consultorId = await ctx.db.insert("people", {
            name: nome,
            role: "Consultor",
            supervisorId: giovanni._id,
            active: true,
            createdAt: now,
            updatedAt: now,
          });

          // Vincular ao departamento
          await ctx.db.insert("departmentPeople", {
            personId: consultorId,
            departmentId: consultorDept._id,
            isResponsible: false,
            active: true,
            createdAt: now,
            updatedAt: now,
          });

          consultorIds.push(consultorId);
        } else if (consultor) {
          consultorIds.push(consultor._id);
        }
      }

      // 4. Criar um subdepartamento de exemplo
      const subdeptId = await ctx.db.insert("subdepartments", {
        name: "Setor 1 - Bombas e Motores de Grande Porte",
        description: "Setor gerenciado por Lucas Santos",
        departmentId: consultorDept._id,
        responsiblePersonId: consultorIds[0], // Lucas Santos
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      // 5. Criar alguns mecânicos
      const mecanicos = ["Alexandre", "Alexsandro", "Kaua"];
      const mecanicoIds = [];

      for (const nome of mecanicos) {
        let mecanico = await ctx.db
          .query("people")
          .filter((q) => q.eq(q.field("name"), nome))
          .filter((q) => q.eq(q.field("role"), "Mecânico"))
          .first();

        if (!mecanico && consultorIds[0]) {
          const mecanicoId = await ctx.db.insert("people", {
            name: nome,
            role: "Mecânico",
            supervisorId: consultorIds[0], // Lucas Santos
            active: true,
            createdAt: now,
            updatedAt: now,
          });

          // Vincular ao subdepartamento
          await ctx.db.insert("departmentPeople", {
            personId: mecanicoId,
            departmentId: consultorDept._id,
            subdepartmentId: subdeptId,
            isResponsible: false,
            active: true,
            createdAt: now,
            updatedAt: now,
          });

          mecanicoIds.push(mecanicoId);
        }
      }

      return {
        success: true,
        message: `Estrutura criada! Giovanni (Gerente), ${consultores.length} consultores, 1 subdepartamento, ${mecanicos.length} mecânicos.`,
        data: {
          departamento: consultorDept.name,
          gerente: "Giovanni",
          consultores: consultores,
          subdepartamentos: ["Setor 1 - Bombas e Motores de Grande Porte"],
          mecanicos: mecanicos,
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

// Função para limpar dados de teste
export const clearTestData = mutation({
  handler: async (ctx) => {
    try {
      // Limpar vínculos
      const links = await ctx.db.query("departmentPeople").collect();
      for (const link of links) {
        await ctx.db.delete(link._id);
      }

      // Limpar pessoas
      const people = await ctx.db.query("people").collect();
      for (const person of people) {
        await ctx.db.delete(person._id);
      }

      // Limpar subdepartamentos
      const subdepts = await ctx.db.query("subdepartments").collect();
      for (const subdept of subdepts) {
        await ctx.db.delete(subdept._id);
      }

      return {
        success: true,
        message: "Dados de teste limpos com sucesso!"
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao limpar: ${error}`
      };
    }
  },
});