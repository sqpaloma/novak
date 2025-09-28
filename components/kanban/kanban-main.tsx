"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay as DndDragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { KanbanColumn } from "./kanban-column";
import { TodoForm } from "./todo-form";
import { NotesSection } from "./notes-section";
import { DragOverlay } from "./drag-overlay";
import {
  filterTodosByStatus,
  buildFullDescription,
  updateDescriptionForStatus,
  extractInfoFromDescription,
} from "./todo-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KanbanMainProps {
  showNotes?: boolean;
}

export function KanbanMain({ showNotes = true }: KanbanMainProps) {
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTodo, setActiveTodo] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Restrição de visualização: consultores e usuários específicos veem apenas os próprios itens
  const forceOwnByEmail =
    false;
  const isConsultor = false;
  const shouldForceOwn = isConsultor || forceOwnByEmail;
  const userFirstName = "";

  const visibleTodos = useMemo(() => {
    const all: any[] = [];
    if (!shouldForceOwn || !userFirstName) return all;
    return all.filter((t: any) => {
      const { responsible } = extractInfoFromDescription(t.description || "");
      const target = (responsible || "").toString().toLowerCase();
      return target.includes(userFirstName);
    });
  }, [shouldForceOwn, userFirstName]);

  // Se não está logado, não renderizar
  if (!userFirstName) {
    return <div>Carregando...</div>;
  }

  const { pendingTodos, inProgressTodos, completedTodos } =
    filterTodosByStatus(visibleTodos);

  const columns = [
    {
      id: "todo",
      title: "A Fazer",
      todos: pendingTodos,
    },
    {
      id: "in-progress",
      title: "Em Processo",
      todos: inProgressTodos,
    },
    {
      id: "completed",
      title: "Concluído",
      todos: completedTodos,
    },
  ];

  const handleCreateTodo = (todoData: {
    title: string;
    description: string;
    responsible: string;
    scheduledDate: string;
  }) => {
    const fullDescription = buildFullDescription(
      todoData.description,
      todoData.responsible,
      todoData.scheduledDate
    );


  };

  const handleUpdateTodo = (todoData: {
    title: string;
    description: string;
    responsible: string;
    scheduledDate: string;
  }) => {
    if (!editingTodo) return;

    const fullDescription = buildFullDescription(
      todoData.description,
      todoData.responsible,
      todoData.scheduledDate
    );


  };

  const handleStatusChange = async (todoId: string, newStatus: string) => {
    const currentTodo: any = [];
    if (!currentTodo) return;

    const { newDescription, isCompleted } = updateDescriptionForStatus(
      currentTodo.description || "",
      newStatus
    );


  };

  const handleDeleteTodo = async (todoId: string) => {

  };

  const handleEditTodo = (todo: any) => {
    const { responsible, scheduledDate, cleanDescription } =
      extractInfoFromDescription(todo.description || "");

    setEditingTodo({
      ...todo,
      description: cleanDescription,
      responsible: responsible || "",
      scheduledDate: scheduledDate || "",
    });
  };

  const handleCreateNote = (noteData: { title: string; content: string }) => {

  };

  const handleUpdateNote = (
    id: string,
    noteData: { title: string; content: string }
  ) => {

  };

  const handleDeleteNote = (id: string) => {

  };

  const handleClearCompleted = async () => {
    if (confirm("Tem certeza que deseja limpar todas as tarefas concluídas?")) {
      for (const todo of completedTodos) {

      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    const allTodos = [...pendingTodos, ...inProgressTodos, ...completedTodos];
    const todo = allTodos.find((t) => t._id === active.id);
    setActiveTodo(todo);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveTodo(null);
      return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    if (activeIdStr !== overIdStr) {
      const allTodos = [...pendingTodos, ...inProgressTodos, ...completedTodos];
      const activeTodo = allTodos.find((t) => t._id === activeIdStr);

      if (activeTodo) {
        const { newDescription, isCompleted } = updateDescriptionForStatus(
          activeTodo.description || "",
          overIdStr
        );


      }
    }

    setActiveId(null);
    setActiveTodo(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveTodo(null);
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <Card className="bg-white/10 border-white/20 text-white">
        <CardHeader className="pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white">
              Tarefas
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="bg-accent text-accent-foreground hover:bg-accent"
                onClick={() => setIsAddingTodo(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>

              {completedTodos.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCompleted}
                  className="bg-white"
                  title="Limpar Concluídas"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTodo}
                  onEdit={handleEditTodo}
                />
              ))}

              <DndDragOverlay>
                {activeId && activeTodo ? (
                  <DragOverlay activeTodo={activeTodo} />
                ) : null}
              </DndDragOverlay>
            </DndContext>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Notas */}
      {showNotes && (
        <NotesSection
          notes={[]}
          onCreateNote={handleCreateNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {/* Formulário para criar/editar tarefa */}
      <TodoForm
        isOpen={isAddingTodo}
        onClose={() => setIsAddingTodo(false)}
        onSubmit={handleCreateTodo}
        title="Criar Nova Tarefa"
      />

      <TodoForm
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        onSubmit={handleUpdateTodo}
        initialData={editingTodo}
        title="Editar Tarefa"
      />
    </div>
  );
}
