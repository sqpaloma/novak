import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Mutation para criar dados dos mecânicos nos subdepartamentos
export const seedMechanicsData = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Primeiro, buscar ou criar o departamento principal (assumindo que existe um departamento de "oficina" ou similar)
    let mainDepartment = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("name"), "oficina"))
      .first();

    if (!mainDepartment) {
      // Criar departamento principal se não existir
      const departmentId = await ctx.db.insert("departments", {
        name: "oficina",
        defaultRole: "mecanico",
        description: "Departamento da Oficina - Manutenção e Reparos",
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
      mainDepartment = await ctx.db.get(departmentId);
    }

    if (!mainDepartment) {
      throw new Error("Falha ao criar departamento principal");
    }

    // Dados dos consultores responsáveis
    const consultores = [
      { name: "Lucas Santos", email: "lucas.santos@company.com" },
      { name: "Rafael Massa", email: "rafael.massa@company.com" },
      { name: "Marcelo Menezes", email: "marcelo.menezes@company.com" },
    ];

    // Criar consultores
    const consultorIds: Record<string, any> = {};
    for (const consultor of consultores) {
      // Verificar se já existe
      let existingConsultor = await ctx.db
        .query("people")
        .filter((q) => q.eq(q.field("email"), consultor.email))
        .filter((q) => q.eq(q.field("active"), true))
        .first();

      if (!existingConsultor) {
        const consultorId = await ctx.db.insert("people", {
          name: consultor.name,
          email: consultor.email,
          role: "Consultor",
          active: true,
          createdAt: now,
          updatedAt: now,
        });
        existingConsultor = await ctx.db.get(consultorId);
      }
      consultorIds[consultor.name] = existingConsultor;
    }

    // Dados dos subdepartamentos e mecânicos
    const subdepartmentData = [
      {
        name: "Setor 1 - Bombas e Motores de Grande Porte",
        responsavel: "Lucas Santos",
        mecanicos: ["Alexandre", "Alexsandro", "Kaua", "Marcelino", "Roberto P", "Cris"]
      },
      {
        name: "Setor 2 - Bombas e Motores de Circuito Fechado",
        responsavel: null, // Sem consultor responsável especificado
        mecanicos: ["Eduardo", "Guilherme", "Gustavobel", "Yuri", "Reinaldo"]
      },
      {
        name: "Setor 3 - Bombas e Motores Circuito Aberto",
        responsavel: "Rafael Massa",
        mecanicos: ["Fabio F", "Vagner", "Nivaldo", "Reinaldo"]
      },
      {
        name: "Setor 4 - Comandos e Valvulas de Pequeno Porte",
        responsavel: "Marcelo Menezes",
        mecanicos: ["Nicolas C", "Alziro", "Henrique", "G Simao", "Ronald", "Vinicius", "Daniel G", "Matheus"]
      },
      {
        name: "Setor 5 - Comando e Valvulas de Grande Porte",
        responsavel: "Lucas Santos",
        mecanicos: ["L Miguel", "Leandro", "Rodrigo N", "Luismiguel", "Thiago"]
      }
    ];

    const createdSubdepartments = [];

    for (const subdeptData of subdepartmentData) {
      // Criar subdepartamento
      const responsiblePerson = subdeptData.responsavel ? consultorIds[subdeptData.responsavel] : null;

      const subdepartmentId = await ctx.db.insert("subdepartments", {
        name: subdeptData.name,
        description: `Subdepartamento especializado em ${subdeptData.name.toLowerCase()}`,
        departmentId: mainDepartment._id,
        responsiblePersonId: responsiblePerson?._id,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      // Vincular responsável ao subdepartamento (se existir)
      if (responsiblePerson) {
        await ctx.db.insert("departmentPeople", {
          personId: responsiblePerson._id,
          departmentId: mainDepartment._id,
          subdepartmentId: subdepartmentId,
          isResponsible: true,
          active: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Criar mecânicos e vincular ao subdepartamento
      const createdMecanicos = [];
      for (const mecanicoName of subdeptData.mecanicos) {
        // Verificar se já existe mecânico com esse nome
        let existingMecanico = await ctx.db
          .query("people")
          .filter((q) => q.eq(q.field("name"), mecanicoName))
          .filter((q) => q.eq(q.field("role"), "Mecânico"))
          .filter((q) => q.eq(q.field("active"), true))
          .first();

        if (!existingMecanico) {
          // Criar novo mecânico
          const mecanicoId = await ctx.db.insert("people", {
            name: mecanicoName,
            role: "Mecânico",
            supervisorId: responsiblePerson?._id, // Vincular ao consultor responsável
            active: true,
            createdAt: now,
            updatedAt: now,
          });
          existingMecanico = await ctx.db.get(mecanicoId);
        }

        if (existingMecanico) {
          // Vincular mecânico ao subdepartamento
          // Verificar se já existe vínculo
          const existingLink = await ctx.db
            .query("departmentPeople")
            .withIndex("by_person", (q) => q.eq("personId", existingMecanico._id))
            .filter((q) => q.eq(q.field("subdepartmentId"), subdepartmentId))
            .filter((q) => q.eq(q.field("active"), true))
            .first();

          if (!existingLink) {
            await ctx.db.insert("departmentPeople", {
              personId: existingMecanico._id,
              departmentId: mainDepartment._id,
              subdepartmentId: subdepartmentId,
              isResponsible: false,
              active: true,
              createdAt: now,
              updatedAt: now,
            });
          }

          createdMecanicos.push(existingMecanico);
        }
      }

      createdSubdepartments.push({
        subdepartment: await ctx.db.get(subdepartmentId),
        responsible: responsiblePerson,
        mecanicos: createdMecanicos,
      });
    }

    return {
      success: true,
      message: `Criados ${createdSubdepartments.length} subdepartamentos com seus mecânicos`,
      department: mainDepartment,
      subdepartments: createdSubdepartments,
      consultores: Object.values(consultorIds),
    };
  },
});

// Mutation para limpar dados dos mecânicos (útil para testes)
export const clearMechanicsData = mutation({
  handler: async (ctx) => {
    // Limpar vínculos de departmentPeople
    const departmentPeopleLinks = await ctx.db
      .query("departmentPeople")
      .collect();

    for (const link of departmentPeopleLinks) {
      await ctx.db.delete(link._id);
    }

    // Limpar subdepartamentos
    const subdepartments = await ctx.db
      .query("subdepartments")
      .collect();

    for (const subdept of subdepartments) {
      await ctx.db.delete(subdept._id);
    }

    // Limpar pessoas (mecânicos e consultores)
    const people = await ctx.db
      .query("people")
      .collect();

    for (const person of people) {
      await ctx.db.delete(person._id);
    }

    // Limpar departamento da oficina
    const officeDept = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("name"), "oficina"))
      .first();

    if (officeDept) {
      await ctx.db.delete(officeDept._id);
    }

    return {
      success: true,
      message: "Dados dos mecânicos limpos com sucesso",
    };
  },
});