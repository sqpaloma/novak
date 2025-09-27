import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Mutation para popular o banco com a estrutura real dos departamentos
export const seedDepartmentHierarchy = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    try {
      // 1. Primeiro, criar o departamento principal "consultor" se não existir
      let consultorDept = await ctx.db
        .query("departments")
        .filter((q) => q.eq(q.field("name"), "consultor"))
        .first();

      if (!consultorDept) {
        const consultorDeptId = await ctx.db.insert("departments", {
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
        consultorDept = await ctx.db.get(consultorDeptId);
      }

      if (!consultorDept) throw new Error("Erro ao criar departamento consultor");

      // 2. Criar o Gerente Giovanni
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

        // Vincular Giovanni como responsável pelo departamento
        await ctx.db.insert("departmentPeople", {
          personId: giovanniId,
          departmentId: consultorDept._id,
          isResponsible: true,
          active: true,
          createdAt: now,
          updatedAt: now,
        });

        // Atualizar o departamento para ter Giovanni como responsável
        await ctx.db.patch(consultorDept._id, {
          responsiblePersonId: giovanniId,
          updatedAt: now,
        });
      }

      if (!giovanni) throw new Error("Erro ao criar pessoa Giovanni");

      // 3. Criar os consultores
      const consultores = [
        { name: "Lucas Santos", subdepts: ["Setor 1", "Setor 5"] },
        { name: "Rafael Massa", subdepts: ["Setor 3"] },
        { name: "Marcelo Menezes", subdepts: ["Setor 4"] },
      ];

      const consultorPeople = [];
      for (const consultor of consultores) {
        let person = await ctx.db
          .query("people")
          .filter((q) => q.eq(q.field("name"), consultor.name))
          .filter((q) => q.eq(q.field("role"), "Consultor"))
          .first();

        if (!person) {
          const personId = await ctx.db.insert("people", {
            name: consultor.name,
            role: "Consultor",
            supervisorId: giovanni._id,
            active: true,
            createdAt: now,
            updatedAt: now,
          });
          person = await ctx.db.get(personId);

          // Vincular ao departamento
          await ctx.db.insert("departmentPeople", {
            personId: personId,
            departmentId: consultorDept._id,
            isResponsible: false,
            active: true,
            createdAt: now,
            updatedAt: now,
          });
        }

        if (person) {
          consultorPeople.push({ ...person, subdepts: consultor.subdepts });
        }
      }

      // 4. Criar os subdepartamentos
      const subdepartamentos = [
        {
          name: "Setor 1 - Bombas e Motores de Grande Porte",
          responsavel: "Lucas Santos",
          mecanicos: ["Alexandre", "Alexsandro", "Kaua", "Marcelino", "Roberto P", "Cris"],
        },
        {
          name: "Setor 2 - Bombas e Motores de Circuito Fechado",
          responsavel: null, // Sem responsável específico
          mecanicos: ["Eduardo", "Guilherme", "Gustavobel", "Yuri", "Reinaldo"],
        },
        {
          name: "Setor 3 - Bombas e Motores Circuito Aberto",
          responsavel: "Rafael Massa",
          mecanicos: ["Fabio F", "Vagner", "Nivaldo", "Reinaldo"],
        },
        {
          name: "Setor 4 - Comandos e Valvulas de Pequeno Porte",
          responsavel: "Marcelo Menezes",
          mecanicos: ["Nicolas C", "Alziro", "Henrique", "G Simao", "Ronald", "Vinicius", "Daniel G", "Matheus"],
        },
        {
          name: "Setor 5 - Comando e Valvulas de Grande Porte",
          responsavel: "Lucas Santos",
          mecanicos: ["L Miguel", "Leandro", "Rodrigo N", "Luismiguel", "Thiago"],
        },
      ];

      const createdSubdepts = [];
      for (const subdept of subdepartamentos) {
        // Verificar se o subdepartamento já existe
        let existingSubdept = await ctx.db
          .query("subdepartments")
          .filter((q) => q.eq(q.field("name"), subdept.name))
          .filter((q) => q.eq(q.field("departmentId"), consultorDept._id))
          .first();

        if (!existingSubdept) {
          // Encontrar o responsável se houver
          let responsiblePerson = null;
          if (subdept.responsavel) {
            responsiblePerson = consultorPeople.find(p => p.name === subdept.responsavel);
          }

          // Criar subdepartamento
          const subdeptId = await ctx.db.insert("subdepartments", {
            name: subdept.name,
            description: `Subdepartamento gerenciado por ${subdept.responsavel || 'Giovanni'}`,
            departmentId: consultorDept._id,
            responsiblePersonId: responsiblePerson?._id,
            active: true,
            createdAt: now,
            updatedAt: now,
          });

          existingSubdept = await ctx.db.get(subdeptId);

          // Se há responsável, criar vínculo como responsável
          if (responsiblePerson && existingSubdept) {
            await ctx.db.insert("departmentPeople", {
              personId: responsiblePerson._id,
              departmentId: consultorDept._id,
              subdepartmentId: existingSubdept._id,
              isResponsible: true,
              active: true,
              createdAt: now,
              updatedAt: now,
            });
          }
        }

        if (existingSubdept) {
          createdSubdepts.push(existingSubdept);

          // 5. Criar os mecânicos para este subdepartamento
          for (const mecanicoName of subdept.mecanicos) {
            let mecanico = await ctx.db
              .query("people")
              .filter((q) => q.eq(q.field("name"), mecanicoName))
              .filter((q) => q.eq(q.field("role"), "Mecânico"))
              .first();

            if (!mecanico) {
              // Encontrar o supervisor (consultor responsável ou Giovanni)
              let supervisor = giovanni;
              if (subdept.responsavel) {
                const consultorSupervisor = consultorPeople.find(p => p.name === subdept.responsavel);
                if (consultorSupervisor) {
                  supervisor = consultorSupervisor;
                }
              }

              const mecanicoId = await ctx.db.insert("people", {
                name: mecanicoName,
                role: "Mecânico",
                supervisorId: supervisor._id,
                active: true,
                createdAt: now,
                updatedAt: now,
              });

              // Vincular mecânico ao subdepartamento
              await ctx.db.insert("departmentPeople", {
                personId: mecanicoId,
                departmentId: consultorDept._id,
                subdepartmentId: existingSubdept._id,
                isResponsible: false,
                active: true,
                createdAt: now,
                updatedAt: now,
              });
            } else {
              // Verificar se já está vinculado ao subdepartamento
              const existingLink = await ctx.db
                .query("departmentPeople")
                .filter((q) => q.eq(q.field("personId"), mecanico._id))
                .filter((q) => q.eq(q.field("subdepartmentId"), existingSubdept._id))
                .filter((q) => q.eq(q.field("active"), true))
                .first();

              if (!existingLink) {
                await ctx.db.insert("departmentPeople", {
                  personId: mecanico._id,
                  departmentId: consultorDept._id,
                  subdepartmentId: existingSubdept._id,
                  isResponsible: false,
                  active: true,
                  createdAt: now,
                  updatedAt: now,
                });
              }
            }
          }
        }
      }

      return {
        success: true,
        message: `Estrutura criada com sucesso! Giovanni (Gerente), ${consultorPeople.length} consultores, ${createdSubdepts.length} subdepartamentos e ${subdepartamentos.reduce((acc, s) => acc + s.mecanicos.length, 0)} mecânicos.`,
        data: {
          gerente: giovanni.name,
          consultores: consultorPeople.map(p => p.name),
          subdepartamentos: createdSubdepts.map(s => s.name),
        }
      };

    } catch (error) {
      console.error("Erro ao criar estrutura:", error);
      return {
        success: false,
        message: `Erro ao criar estrutura: ${error}`,
      };
    }
  },
});

// Mutation para limpar e recriar toda a estrutura (apenas para desenvolvimento)
export const resetAndSeedDepartmentHierarchy = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    try {
      // Limpar dados existentes de pessoas e vínculos
      const existingPeople = await ctx.db.query("people").collect();
      const existingLinks = await ctx.db.query("departmentPeople").collect();
      const existingSubdepts = await ctx.db.query("subdepartments").collect();

      // Deletar em ordem (vínculos primeiro, depois pessoas)
      for (const link of existingLinks) {
        await ctx.db.delete(link._id);
      }
      for (const person of existingPeople) {
        await ctx.db.delete(person._id);
      }
      for (const subdept of existingSubdepts) {
        await ctx.db.delete(subdept._id);
      }

      // Reset the department responsible and rebuild structure
      let consultorDept = await ctx.db
        .query("departments")
        .filter((q) => q.eq(q.field("name"), "consultor"))
        .first();

      if (consultorDept) {
        await ctx.db.patch(consultorDept._id, {
          responsiblePersonId: undefined,
          updatedAt: now,
        });
      } else {
        // Criar departamento consultor se não existir
        const consultorDeptId = await ctx.db.insert("departments", {
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
        consultorDept = await ctx.db.get(consultorDeptId);
      }

      if (!consultorDept) throw new Error("Erro ao criar departamento consultor");

      // 2. Criar Giovanni
      const giovanniId = await ctx.db.insert("people", {
        name: "Giovanni",
        role: "Gerente",
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        message: "Estrutura básica recriada com sucesso!",
        data: {
          gerente: "Giovanni",
          consultores: [],
          subdepartamentos: [],
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Erro ao limpar e recriar: ${error}`,
      };
    }
  },
});

// Query para verificar a estrutura atual
export const getDepartmentStructureOverview = mutation({
  handler: async (ctx) => {
    const consultorDept = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("name"), "consultor"))
      .first();

    if (!consultorDept) {
      return { message: "Departamento consultor não encontrado" };
    }

    const subdepartments = await ctx.db
      .query("subdepartments")
      .filter((q) => q.eq(q.field("departmentId"), consultorDept._id))
      .collect();

    const people = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const links = await ctx.db
      .query("departmentPeople")
      .filter((q) => q.eq(q.field("departmentId"), consultorDept._id))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    return {
      department: consultorDept.name,
      subdepartments: subdepartments.length,
      totalPeople: people.length,
      totalLinks: links.length,
      peopleByRole: people.reduce((acc, person) => {
        acc[person.role] = (acc[person.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});