import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela de usuários
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    position: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")), // Referência ao departamento
    department: v.optional(v.string()), // Mantido por compatibilidade (deprecated)
    location: v.optional(v.string()),
    company: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    hashedPassword: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    role: v.optional(v.string()),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_department", ["departmentId"]),

  // Tabela de configurações dos usuários
  userSettings: defineTable({
    userId: v.id("users"),
    // Privacy
    profileVisibility: v.string(),
    dataSharing: v.boolean(),
    analyticsTracking: v.boolean(),
    // Notificações
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    calendarReminders: v.optional(v.boolean()),
    projectUpdates: v.optional(v.boolean()),
    weeklyReports: v.optional(v.boolean()),
    // Appearance
    theme: v.string(),
    language: v.string(),
    timezone: v.string(),
    dateFormat: v.string(),
    timeFormat: v.string(),
    // System
    autoSave: v.boolean(),
    backupFrequency: v.string(),
    sessionTimeout: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Permissões por papel (perfil)
  rolePermissions: defineTable({
    role: v.string(),
    // Páginas
    accessDashboard: v.boolean(),
    accessChat: v.boolean(),
    accessManual: v.boolean(),
    accessIndicadores: v.boolean(),
    accessAnalise: v.boolean(),
    accessSettings: v.boolean(),
    // Regras de visualização
    dashboardDataScope: v.string(), // "own" | "all"
    dashboardFilterVisible: v.boolean(),
    chatDataScope: v.string(), // "own" | "all"
    // Metadados
    updatedAt: v.number(),
  }).index("by_role", ["role"]),

  // Tabela de departamentos configuráveis
  departments: defineTable({
    name: v.string(), // Nome do departamento (que é também o papel/role)
    defaultRole: v.optional(v.string()), // Papel padrão dos usuários deste departamento
    description: v.optional(v.string()), // Descrição do departamento
    responsiblePersonId: v.optional(v.id("people")), // Responsável pelo departamento
    active: v.boolean(), // Se o departamento está ativo
    // Permissões específicas do departamento
    accessDashboard: v.boolean(),
    accessChat: v.boolean(),
    accessManual: v.boolean(),
    accessIndicadores: v.boolean(),
    accessAnalise: v.boolean(),
    accessSettings: v.boolean(),
    dashboardDataScope: v.string(), // "own" | "all"
    dashboardFilterVisible: v.boolean(),
    chatDataScope: v.string(), // "own" | "all"
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Tabela de subdepartamentos
  subdepartments: defineTable({
    name: v.string(), // Nome do subdepartamento
    description: v.optional(v.string()), // Descrição do subdepartamento
    departmentId: v.id("departments"), // Departamento pai
    responsiblePersonId: v.optional(v.id("people")), // Responsável pelo subdepartamento
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_department", ["departmentId"]),

  // Tabela de pessoas (entidade separada de usuários)
  people: defineTable({
    name: v.string(), // Nome da pessoa
    email: v.optional(v.string()), // Email (opcional)
    phone: v.optional(v.string()), // Telefone (opcional)
    role: v.string(), // Função/cargo (ex: "Diretor", "Gerente", "Consultor", "Mecânico")
    userId: v.optional(v.id("users")), // Usuário associado (opcional - pessoa pode existir sem conta)
    supervisorId: v.optional(v.id("people")), // Superior hierárquico
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_supervisor", ["supervisorId"])
    .index("by_role", ["role"])
    .index("by_user", ["userId"]),

  // Tabela de vínculos de pessoas com departamentos/subdepartamentos
  departmentPeople: defineTable({
    personId: v.id("people"), // Pessoa vinculada
    departmentId: v.optional(v.id("departments")), // Departamento (opcional)
    subdepartmentId: v.optional(v.id("subdepartments")), // Subdepartamento (opcional)
    isResponsible: v.boolean(), // Se é responsável por este (sub)departamento
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_person", ["personId"])
    .index("by_department", ["departmentId"])
    .index("by_subdepartment", ["subdepartmentId"])
    .index("by_responsible", ["isResponsible"]),

  // Tabela de membros dos departamentos (equipes) - DEPRECATED - use departmentPeople
  departmentMembers: defineTable({
    departmentId: v.id("departments"),
    userId: v.optional(v.id("users")), // ID do usuário associado
    name: v.string(), // Nome do membro da equipe
    role: v.optional(v.string()), // Função/papel do membro (ex: "mecânico", "técnico")
    supervisorId: v.optional(v.id("users")), // Consultor responsável pelo membro
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_department", ["departmentId"])
    .index("by_supervisor", ["supervisorId"])
    .index("by_user", ["userId"]),

  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(), // formato: YYYY-MM-DD
    time: v.string(),
    duration: v.string(),
    location: v.string(),
    participants: v.array(v.string()),
    color: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  todos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    status: v.optional(v.string()), // "todo", "in-progress", "completed"
    priority: v.string(), // "low", "medium", "high"
    dueDate: v.optional(v.string()), // formato: YYYY-MM-DD
    scheduledDate: v.optional(v.string()), // formato: YYYY-MM-DD
    responsible: v.optional(v.string()), // nome do responsável
    category: v.optional(v.string()),
    userId: v.optional(v.id("users")), // NOVO: isolamento por usuário (optional for backward compatibility)
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    userId: v.optional(v.id("users")), // NOVO: isolamento por usuário (optional for backward compatibility)
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Tabela de conversas
  conversations: defineTable({
    name: v.optional(v.string()), // Nome da conversa (pode ser null para conversas 1:1)
    type: v.string(), // "direct" ou "group"
    isGroup: v.boolean(),
    createdBy: v.id("users"),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Tabela de participantes das conversas
  conversationParticipants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
    isActive: v.boolean(),
    leftAt: v.optional(v.number()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  // Tabela de mensagens
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    messageType: v.string(), // "text", "image", "file", "system"
    // Attachment fields
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          fileName: v.string(),
          fileSize: v.number(),
          mimeType: v.string(),
          storageId: v.optional(v.id("_storage")), // Convex file storage ID
          url: v.optional(v.string()), // Fallback URL for external storage
        })
      )
    ),
    isEdited: v.boolean(),
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_conversation_created", ["conversationId", "createdAt"]),

  // ===== TABELAS DO DASHBOARD =====
  dashboardData: defineTable({
    totalItens: v.number(),
    aguardandoAprovacao: v.number(),
    analises: v.number(),
    orcamentos: v.number(),
    emExecucao: v.number(),
    pronto: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  dashboardItens: defineTable({
    os: v.string(),
    titulo: v.optional(v.string()),
    cliente: v.optional(v.string()),
    responsavel: v.optional(v.string()),
    status: v.string(),
    dataRegistro: v.optional(v.string()),
    rawData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_responsavel", ["responsavel"])
    .index("by_status", ["status"]),

  dashboardUploads: defineTable({
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
    uploadDate: v.optional(v.string()),
    totalRecords: v.number(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  

  // ===== TABELAS DE INDICADORES =====
  indicadoresSession: defineTable({
    sessionId: v.string(),
    filters: v.object({
      executante: v.string(),
      setor: v.string(),
      orcamento: v.string(),
    }),
    filesInfo: v.object({
      desmontagens: v.optional(
        v.object({
          name: v.string(),
          size: v.number(),
          lastModified: v.number(),
        })
      ),
      montagens: v.optional(
        v.object({
          name: v.string(),
          size: v.number(),
          lastModified: v.number(),
        })
      ),
      testesAprovados: v.optional(
        v.object({
          name: v.string(),
          size: v.number(),
          lastModified: v.number(),
        })
      ),
      testesReprovados: v.optional(
        v.object({
          name: v.string(),
          size: v.number(),
          lastModified: v.number(),
        })
      ),
    }),
    uploadedBy: v.string(),
    uploadedAt: v.string(),
    totalRecords: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  indicadoresData: defineTable({
    sessionId: v.string(),
    dataType: v.string(), // "montagens", "desmontagens", "testes"
    data: v.array(v.any()),
    chunkIndex: v.number(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_type", ["sessionId", "dataType"]),

  // ===== TABELAS DE COTAÇÃO DE PEÇAS =====
  cotacoes: defineTable({
    numeroSequencial: v.number(), // Auto-increment para número da cotação
    numeroOS: v.optional(v.string()), // Número da OS
    numeroOrcamento: v.optional(v.string()), // Número do Orçamento
    cliente: v.optional(v.string()), // Cliente
    solicitanteId: v.id("users"), // Vendedor que criou
    compradorId: v.optional(v.id("users")), // Pessoa da compra (ex: Simone)
    fornecedorId: v.optional(v.id("fornecedores")), // Referência ao fornecedor cadastrado
    tipoSolicitacao: v.optional(v.string()), // "cotacao", "especificacao_tecnica", "ambos"
    status: v.string(), // "novo", "em_cotacao", "respondida", "aprovada_para_compra", "comprada", "cancelada"
    motivoCancelamento: v.optional(v.string()), // Motivo quando cancelada
    observacoes: v.optional(v.string()), // Observações gerais
    fornecedor: v.optional(v.string()), // Fornecedor preferencial (Rexroth, Danfoss, Handok, Parker) - DEPRECATED
    solicitarInfoTecnica: v.optional(v.boolean()), // Se solicitou informação técnica - DEPRECATED
    // Campos de upload de arquivos na resposta
    anexoCotacaoStorageId: v.optional(v.id("_storage")), // Arquivo PDF da cotação anexado
    anexoCotacaoNome: v.optional(v.string()), // Nome do arquivo de cotação
    anexoPropostaTecnicaStorageId: v.optional(v.id("_storage")), // Arquivo PDF da proposta técnica/catálogo
    anexoPropostaTecnicaNome: v.optional(v.string()), // Nome do arquivo de proposta técnica
    dataResposta: v.optional(v.number()), // Quando foi respondida
    dataAprovacao: v.optional(v.number()), // Quando foi aprovada
    dataCompra: v.optional(v.number()), // Quando foi comprada
    dataCancelamento: v.optional(v.number()), // Quando foi cancelada
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_solicitante", ["solicitanteId"])
    .index("by_comprador", ["compradorId"])
    .index("by_fornecedor", ["fornecedorId"])
    .index("by_status", ["status"])
    .index("by_numero", ["numeroSequencial"]),

  cotacaoItens: defineTable({
    cotacaoId: v.id("cotacoes"),
    codigoPeca: v.string(), // Código da peça
    descricao: v.string(), // Descrição da peça
    quantidade: v.number(), // Quantidade solicitada
    precoUnitario: v.optional(v.number()), // Preço unitário cotado
    precoTotal: v.optional(v.number()), // Preço total (quantidade * precoUnitario)
    prazoEntrega: v.optional(v.string()), // Prazo de entrega
    fornecedor: v.optional(v.string()), // Fornecedor cotado
    observacoes: v.optional(v.string()), // Observações específicas do item
    precisaCadastro: v.optional(v.boolean()), // Se a peça precisa de cadastro
    codigoSankhya: v.optional(v.string()), // Código Sankhya informado na resposta (para itens que precisam de cadastro)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_cotacao", ["cotacaoId"]),

  cotacaoHistorico: defineTable({
    cotacaoId: v.id("cotacoes"),
    usuarioId: v.id("users"), // Usuário que fez a ação
    acao: v.string(), // "criada", "assumida", "respondida", "aprovada", "comprada", "cancelada"
    statusAnterior: v.optional(v.string()), // Status anterior
    statusNovo: v.string(), // Novo status
    observacoes: v.optional(v.string()), // Observações da ação
    createdAt: v.number(),
  })
    .index("by_cotacao", ["cotacaoId"])
    .index("by_usuario", ["usuarioId"]),

  // ===== TABELA DE CADASTRO DE PEÇAS =====
  pecas: defineTable({
    codigo: v.string(), // Código único da peça
    descricao: v.string(), // Descrição da peça
    marca: v.optional(v.string()), // Marca da peça
    ativo: v.boolean(), // Se a peça está ativa no sistema
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_codigo", ["codigo"]),

  // ===== TABELA DE PENDÊNCIAS DE CADASTRO DE PEÇAS =====
  pendenciasCadastro: defineTable({
    numeroSequencial: v.optional(v.number()), // Auto-increment para número da solicitação
    codigo: v.string(), // Código da peça solicitada
    descricao: v.string(), // Descrição da peça
    marca: v.optional(v.string()), // Marca da peça
    observacoes: v.optional(v.string()), // Observações do solicitante
    solicitanteId: v.id("users"), // Quem fez a solicitação
    status: v.string(), // "pendente", "em_andamento", "concluida", "rejeitada"
    anexoStorageId: v.optional(v.id("_storage")), // PDF anexado
    anexoNome: v.optional(v.string()), // Nome do arquivo anexado
    responsavelId: v.optional(v.id("users")), // Quem está tratando (compras)
    motivoRejeicao: v.optional(v.string()), // Se rejeitada, o motivo
    pecaCriadadId: v.optional(v.id("pecas")), // Se concluída, referência à peça criada
    codigoSankhya: v.optional(v.string()), // Código Sankhya cadastrado (resposta)
    dataResposta: v.optional(v.number()), // Quando foi respondida com código Sankhya
    dataAtribuicao: v.optional(v.number()), // Quando foi atribuída a alguém
    dataConclusao: v.optional(v.number()), // Quando foi concluída/rejeitada
    statusCancelamento: v.optional(v.string()), // "cancelado" para itens cancelados
    motivoCancelamento: v.optional(v.string()), // Motivo do cancelamento
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_solicitante", ["solicitanteId"])
    .index("by_responsavel", ["responsavelId"])
    .index("by_status", ["status"])
    .index("by_numero", ["numeroSequencial"]),

  // ===== TABELAS DE FORNECEDORES =====
  fornecedores: defineTable({
    nomeEmpresa: v.string(), // Nome da empresa fornecedora
    loginUsuario: v.string(), // Login único para acesso (email)
    senhaHash: v.string(), // Senha hash para autenticação
    userId: v.optional(v.id("users")), // Referência ao usuário criado no sistema principal
    ativo: v.boolean(), // Se o fornecedor está ativo
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_login", ["loginUsuario"])
    .index("by_user", ["userId"]),

  fornecedorResponsaveis: defineTable({
    fornecedorId: v.id("fornecedores"), // Referência ao fornecedor
    nome: v.string(), // Nome da pessoa responsável
    email: v.string(), // Email para receber notificações
    ativo: v.boolean(), // Se o responsável está ativo
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_fornecedor", ["fornecedorId"])
    .index("by_email", ["email"]),
});
