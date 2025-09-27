import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Dashboard Data interface
export interface DashboardData {
  _id?: Id<"dashboardData">;
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardItem {
  _id?: Id<"dashboardItens">;
  os: string;
  titulo?: string;
  cliente?: string;
  responsavel?: string;
  status: string;
  dataRegistro?: string;
  rawData?: any;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardUpload {
  _id?: Id<"dashboardUploads">;
  fileName: string;
  uploadedBy?: string;
  uploadDate?: string;
  totalRecords: number;
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

// Função para salvar dados do dashboard
export const saveDashboardData = mutation({
  args: {
    dashboardData: v.object({
      totalItens: v.number(),
      aguardandoAprovacao: v.number(),
      analises: v.number(),
      orcamentos: v.number(),
      emExecucao: v.number(),
      pronto: v.number(),
    }),
    items: v.array(
      v.object({
        os: v.string(),
        titulo: v.optional(v.string()),
        cliente: v.optional(v.string()),
        responsavel: v.optional(v.string()),
        status: v.string(),
        dataRegistro: v.optional(v.string()),
        rawData: v.optional(v.any()),
      })
    ),
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Primeiro, registra o upload
      const uploadRecord = await ctx.db.insert("dashboardUploads", {
        fileName: args.fileName,
        uploadedBy: args.uploadedBy || "Usuário Anônimo",
        uploadDate: new Date().toISOString(),
        totalRecords: args.items.length,
        status: "processing",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Limpa dados existentes
      const existingData = await ctx.db.query("dashboardData").collect();
      for (const data of existingData) {
        await ctx.db.delete(data._id);
      }

      const existingItems = await ctx.db.query("dashboardItens").collect();
      for (const item of existingItems) {
        await ctx.db.delete(item._id);
      }

      // Insere dados do dashboard
      await ctx.db.insert("dashboardData", {
        totalItens: args.dashboardData.totalItens,
        aguardandoAprovacao: args.dashboardData.aguardandoAprovacao,
        analises: args.dashboardData.analises,
        orcamentos: args.dashboardData.orcamentos,
        emExecucao: args.dashboardData.emExecucao,
        pronto: args.dashboardData.pronto,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Insere itens individuais
      if (args.items.length > 0) {
        for (const item of args.items) {
          await ctx.db.insert("dashboardItens", {
            os: item.os,
            titulo: item.titulo,
            cliente: item.cliente,
            responsavel: item.responsavel,
            status: item.status,
            dataRegistro: item.dataRegistro,
            rawData: item.rawData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }

      // Atualiza status do upload
      await ctx.db.patch(uploadRecord, {
        status: "completed",
        updatedAt: Date.now(),
      });

      return { success: true, uploadId: uploadRecord };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Função para carregar dados do dashboard
export const loadDashboardData = query({
  handler: async (ctx) => {
    try {
      // ----- dados principais -----
      const dashboardDataList = await ctx.db
        .query("dashboardData")
        .order("desc")
        .take(1);

      const dashboardData = dashboardDataList[0] || null;

      // ----- itens individuais -----
      const items = await ctx.db
        .query("dashboardItens")
        .order("desc")
        .collect();

      return {
        dashboardData,
        items: items || [],
      };
    } catch (error) {
      return { dashboardData: null, items: [] };
    }
  },
});

// Função para obter histórico de uploads do dashboard
export const getDashboardUploadHistory = query({
  handler: async (ctx) => {
    try {
      const data = await ctx.db
        .query("dashboardUploads")
        .order("desc")
        .take(10);

      return data || [];
    } catch (error) {
      return [];
    }
  },
});

// Função para limpar todos os dados do dashboard
export const clearAllDashboardData = mutation({
  handler: async (ctx) => {
    try {
      // Limpa dados do dashboard
      const dashboardData = await ctx.db.query("dashboardData").collect();
      for (const data of dashboardData) {
        await ctx.db.delete(data._id);
      }

      // Limpa itens do dashboard
      const dashboardItens = await ctx.db.query("dashboardItens").collect();
      for (const item of dashboardItens) {
        await ctx.db.delete(item._id);
      }

      // Limpa uploads do dashboard
      const dashboardUploads = await ctx.db.query("dashboardUploads").collect();
      for (const upload of dashboardUploads) {
        await ctx.db.delete(upload._id);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Função para obter itens por categoria
export const getDashboardItemsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    try {
      let items = await ctx.db.query("dashboardItens").collect();

      switch (args.category) {
        case "total":
          break;
        case "aprovacao":
          items = items.filter(
            (item) =>
              item.status.toLowerCase().includes("aguardando") ||
              item.status.toLowerCase().includes("pendente") ||
              item.status.toLowerCase().includes("aprovação") ||
              item.status.toLowerCase().includes("aprovacao")
          );
          break;
        case "analises":
          items = items.filter(
            (item) =>
              item.status.toLowerCase().includes("análise") ||
              item.status.toLowerCase().includes("analise") ||
              item.status.toLowerCase().includes("revisão") ||
              item.status.toLowerCase().includes("revisao")
          );
          break;
        case "orcamentos":
          items = items.filter(
            (item) =>
              item.status.toLowerCase().includes("orçamento") ||
              item.status.toLowerCase().includes("orcamento") ||
              item.status.toLowerCase().includes("cotação") ||
              item.status.toLowerCase().includes("cotacao")
          );
          break;
        case "execucao":
          items = items.filter(
            (item) =>
              item.status.toLowerCase().includes("execução") ||
              item.status.toLowerCase().includes("execucao") ||
              item.status.toLowerCase().includes("andamento") ||
              item.status.toLowerCase().includes("progresso")
          );
          break;
        case "pronto":
          items = items.filter(
            (item) =>
              item.status.toLowerCase().includes("pronto") ||
              item.status.toLowerCase().includes("concluído") ||
              item.status.toLowerCase().includes("concluido") ||
              item.status.toLowerCase().includes("finalizado") ||
              item.status.toLowerCase().includes("entregue")
          );
          break;
        default:
          break;
      }

      return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      return [];
    }
  },
});

// Função para obter responsáveis únicos - agora busca dos departamentos criados
export const getUniqueResponsaveis = query({
  handler: async (ctx) => {
    try {
      // Primeiro, buscar pessoas ativas dos departamentos
      const people = await ctx.db
        .query("people")
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      if (people && people.length > 0) {
        // Usar nomes das pessoas dos departamentos
        const departmentResponsaveis = people
          .map(person => person.name)
          .filter(name => name && name.trim() !== "")
          .sort();

        return departmentResponsaveis;
      }

      // Fallback: usar responsáveis dos itens do dashboard se não há pessoas nos departamentos
      const allItems = await ctx.db.query("dashboardItens").collect();

      if (!allItems || allItems.length === 0) {
        return [];
      }

      const uniqueResponsaveis = Array.from(
        new Set(
          allItems
            .map((item) => item.responsavel)
            .filter(
              (responsavel): responsavel is string =>
                responsavel !== null &&
                responsavel !== undefined &&
                responsavel.trim() !== "" &&
                responsavel !== "Não informado"
            )
        )
      ).sort();

      return uniqueResponsaveis;
    } catch (error) {
      return [];
    }
  },
});

// Função para obter itens por responsável
export const getDashboardItemsByResponsavel = query({
  args: { responsavel: v.string() },
  handler: async (ctx, args) => {
    try {
      const items = await ctx.db
        .query("dashboardItens")
        .withIndex("by_responsavel", (q) =>
          q.eq("responsavel", args.responsavel)
        )
        .collect();

      return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      return [];
    }
  },
});

// NOVO: Lista de clientes únicos para auto-completar/busca
export const getUniqueClientes = query({
  handler: async (ctx) => {
    try {
      const allItems = await ctx.db.query("dashboardItens").collect();
      const uniqueClientes = Array.from(
        new Set(
          allItems
            .map((item) => (item.cliente || "").toString().trim())
            .filter((cliente) => cliente && cliente !== "Cliente não informado")
        )
      ).sort((a, b) => a.localeCompare(b, "pt-BR"));
      return uniqueClientes;
    } catch (error) {
      return [];
    }
  },
});

// NOVO: Itens do dashboard por cliente (filtro case-insensitive, parcial)
export const getDashboardItemsByCliente = query({
  args: { cliente: v.string() },
  handler: async (ctx, args) => {
    try {
      const search = (args.cliente || "").toLowerCase().trim();
      if (!search) return [];
      const items = await ctx.db.query("dashboardItens").collect();
      const filtered = items.filter((item) =>
        (item.cliente || "").toLowerCase().includes(search)
      );
      // Ordena por data de criação desc
      return filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      return [];
    }
  },
});

// Função para obter dados do dashboard organizados por departamento/hierarquia
export const getDashboardDataByDepartment = query({
  handler: async (ctx) => {
    try {
      // Buscar departamento consultor
      const consultorDept = await ctx.db
        .query("departments")
        .filter((q) => q.eq(q.field("name"), "consultor"))
        .first();

      if (!consultorDept) {
        return { departments: [], totalItems: 0, message: "Departamento consultor não encontrado" };
      }

      // Buscar pessoas do departamento
      const people = await ctx.db
        .query("people")
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      // Buscar itens do dashboard
      const allItems = await ctx.db.query("dashboardItens").collect();

      // Função para mapear nomes das pessoas com responsáveis do dashboard
      const mapPersonToResponsaveis = (personName: string): string[] => {
        const name = personName.toLowerCase();
        const mappings: Record<string, string[]> = {
          "lucas santos": ["LUCAS", "LUCAS SANTOS"],
          "rafael massa": ["RAFAELMAS", "RAFAEL MAS", "RAFAEL MASSA"],
          "marcelo menezes": ["MARCELO", "MARCELO MENEZES"],
          "giovanni": ["GIOVANNI"],
          "alexandre": ["ALEXANDRE"],
          "alexsandro": ["ALEXSANDRO"],
          "kaua": ["KAUA"]
        };

        return mappings[name] || [personName.toUpperCase()];
      };

      // Organizar dados por pessoa/responsável
      const departmentData = people.map(person => {
        // Buscar responsáveis que correspondem a esta pessoa
        const responsavelNames = mapPersonToResponsaveis(person.name);

        // Buscar itens que esta pessoa é responsável (usando mapeamento)
        const personItems = allItems.filter(item =>
          item.responsavel && responsavelNames.some(resp =>
            item.responsavel === resp ||
            (item.responsavel && item.responsavel.includes(resp)) ||
            (item.responsavel && resp.includes(item.responsavel))
          )
        );

        // Calcular estatísticas
        const stats = {
          total: personItems.length,
          aguardandoAprovacao: personItems.filter(item =>
            item.status.toLowerCase().includes("aguardando") ||
            item.status.toLowerCase().includes("pendente") ||
            item.status.toLowerCase().includes("aprovação")
          ).length,
          analises: personItems.filter(item =>
            item.status.toLowerCase().includes("análise") ||
            item.status.toLowerCase().includes("analise") ||
            item.status.toLowerCase().includes("revisão")
          ).length,
          orcamentos: personItems.filter(item =>
            item.status.toLowerCase().includes("orçamento") ||
            item.status.toLowerCase().includes("orcamento") ||
            item.status.toLowerCase().includes("cotação")
          ).length,
          emExecucao: personItems.filter(item =>
            item.status.toLowerCase().includes("execução") ||
            item.status.toLowerCase().includes("execucao") ||
            item.status.toLowerCase().includes("andamento")
          ).length,
          pronto: personItems.filter(item =>
            item.status.toLowerCase().includes("pronto") ||
            item.status.toLowerCase().includes("concluído") ||
            item.status.toLowerCase().includes("finalizado")
          ).length,
        };

        return {
          person,
          stats,
          items: personItems,
        };
      });

      // Buscar subdepartamentos
      const subdepartments = await ctx.db
        .query("subdepartments")
        .filter((q) => q.eq(q.field("departmentId"), consultorDept._id))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();

      // Organizar dados por subdepartamento
      const subdepartmentData = await Promise.all(
        subdepartments.map(async (subdept) => {
          // Buscar pessoas do subdepartamento
          const subdeptPeople = await ctx.db
            .query("departmentPeople")
            .filter((q) => q.eq(q.field("subdepartmentId"), subdept._id))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();

          const subdeptPersonNames = await Promise.all(
            subdeptPeople.map(async (link) => {
              const person = await ctx.db.get(link.personId);
              return person ? person.name : null;
            })
          );

          const validNames = subdeptPersonNames.filter(name => name !== null) as string[];

          // Buscar itens do dashboard para pessoas deste subdepartamento
          const subdeptItems = allItems.filter(item =>
            item.responsavel && validNames.includes(item.responsavel)
          );

          return {
            subdepartment: subdept,
            people: validNames,
            itemCount: subdeptItems.length,
            items: subdeptItems,
          };
        })
      );

      return {
        department: consultorDept,
        people: departmentData,
        subdepartments: subdepartmentData,
        totalItems: allItems.length,
      };
    } catch (error) {
      return { departments: [], totalItems: 0, error: error };
    }
  },
});

// Migração para limpar campos antigos dos dados do dashboard
export const cleanOldDashboardData = mutation({
  handler: async (ctx) => {
    try {
      // Busca todos os documentos da tabela dashboardData
      const allDashboardData = await ctx.db.query("dashboardData").collect();
      
      let cleanedCount = 0;
      
      for (const data of allDashboardData) {
        // Verifica se o documento tem os campos antigos
        const hasOldFields = 'devolucoes' in data || 'movimentacoes' in data;
        
        if (hasOldFields) {
          // Remove os campos antigos mantendo apenas os campos válidos
          const cleanData = {
            totalItens: data.totalItens,
            aguardandoAprovacao: data.aguardandoAprovacao,
            analises: data.analises,
            orcamentos: data.orcamentos,
            emExecucao: data.emExecucao,
            pronto: data.pronto,
            createdAt: data.createdAt,
            updatedAt: Date.now(), // Atualiza o timestamp
          };
          
          // Substitui o documento antigo pelo limpo
          await ctx.db.replace(data._id, cleanData);
          cleanedCount++;
        }
      }
      
      return { 
        success: true, 
        message: `Migração concluída. ${cleanedCount} documentos foram limpos.`,
        cleanedCount 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  },
});
