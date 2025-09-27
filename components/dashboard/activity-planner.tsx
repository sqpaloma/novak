"use client";

import { useState, useEffect } from "react";
import { useDashboardData } from "@/lib/convex-dashboard-client";
import { useActivityStorage } from "./hooks/use-activity-storage";
import { useActivityData } from "./hooks/use-activity-data";
import { useAuth } from "@/hooks/use-auth";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { useAdmin } from "@/hooks/use-admin";
import { CalendarItem } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityHeader } from "./activity-header";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, ListTodo } from "lucide-react";
import { FixedSizeList as List } from "react-window";


interface ActivityPlannerProps {
  processedItems?: any[];
  filteredByResponsavel?: string | null;
}

// Define types for ActivityList props
interface ActivityListProps {
  activitiesForDay: CalendarItem[];
  completedActivities: Set<string>;
  getStatusColor: (status: string, date: string) => string;
  getDisplayResponsavel: (activity: CalendarItem) => string;
  openTaskModal: (activity: CalendarItem) => void;
}

// Update ActivityList component with explicit types
const ActivityList: React.FC<ActivityListProps> = ({
  activitiesForDay,
  completedActivities,
  getStatusColor,
  getDisplayResponsavel,
  openTaskModal,
}) => (
  <List
    height={450}
    width={"100%"}
    itemCount={activitiesForDay.length}
    itemSize={110}
    itemData={{
      activities: activitiesForDay,
      completed: completedActivities,
    }}
  >
    {({ index, style, data }: { index: number; style: React.CSSProperties; data: { activities: CalendarItem[]; completed: Set<string> } }) => {
      const activity: CalendarItem = data.activities[index];
      const isCompleted = data.completed.has(activity.id);
      const consultant = activity.consultor || "—";
      const maybeMechanic = getDisplayResponsavel(activity) || "—";
      const statusLower = activity.status?.toLowerCase() || "";
      const showMechanic =
        (statusLower.includes("exec") ||
          statusLower.includes("análise") ||
          statusLower.includes("analise") ||
          statusLower.includes("revis")) &&
        maybeMechanic &&
        maybeMechanic !== consultant;

      return (
        <div style={style} className="px-1">
          <div
            className={`p-2 rounded-md text-xs border ${isCompleted ? "bg-gray-100 opacity-60 line-through border-gray-300" : getStatusColor(activity.status, activity.data || activity.prazo)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 truncate">
                    {activity.titulo || activity.os}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-gray-600 truncate">
                  {activity.cliente}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                  <span className="truncate">
                    {consultant}
                  </span>
                  {showMechanic && (
                    <span className="text-gray-400">
                      •
                    </span>
                  )}
                  {showMechanic && (
                    <span className="truncate">
                      {maybeMechanic}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                >
                  <DropdownMenuItem
                    onClick={() => openTaskModal(activity)}
                  >
                    <ListTodo className="h-4 w-4 mr-2" /> Adicionar tarefa (Agenda)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
              <span>{activity.status}</span>
              <span>
                {activity.data || activity.prazo || ""}
              </span>
            </div>
          </div>
        </div>
      );
    }}
  </List>
);

export function ActivityPlanner({
  processedItems = [],
  filteredByResponsavel,
}: ActivityPlannerProps) {
  const dashboardData = useDashboardData();
  const [isLoading, setIsLoading] = useState(false);
  const [databaseItems, setDatabaseItems] = useState<CalendarItem[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);


  const { completedActivities, setCompletedActivities } = useActivityStorage();
  const { getStatusColor } = useActivityData(
    processedItems,
    databaseItems,
    completedActivities
  );

  const { user } = useAuth();
  const { canSeeAllData, isSpecialUser } = useUserPermissions();
  const { isAdmin } = useAdmin();

  // Helper functions
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const shouldForceOwn = !canSeeAllData && !isSpecialUser && !isAdmin;

  const getDisplayResponsavel = (activity: CalendarItem): string => {
    return activity.responsavel || "";
  };

  const loadDatabaseItems = async () => {
    try {
      setIsLoading(true);

      // Get data from dashboard instead of using empty databaseItems
      const rawItems = dashboardData?.items || [];

      let dbItems: CalendarItem[] = rawItems
        .filter((item: any) => item.dataRegistro)
        .map((item: any) => {
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

          // Determinar o consultor baseado no responsável
          let consultor = item.consultor || "Não informado";
          
          // Se não há consultor definido, tentar mapear pelo responsável
          if (!item.consultor || item.consultor === "Não informado") {
            const responsavel = item.responsavel || item.responsible || "";
            if (responsavel) {
              // Buscar o primeiro nome do responsável
              const firstName = responsavel.split(" ")[0]?.toLowerCase();
              
              // Mapear para o nome completo do consultor
              const consultorMappings: Record<string, string> = {
                "lucas": "Lucas Santos",
                "rafael": "Rafael Massa", 
                "rafaelmas": "Rafael Massa",
                "marcelo": "Marcelo Menezes",
                "giovanni": "Giovanni",
                "alexandre": "Alexandre",
                "alexsandro": "Alexsandro",
                "kaua": "Kaua"
              };

              const mappedConsultor = consultorMappings[firstName];
              if (mappedConsultor) {
                consultor = mappedConsultor;
              } else {
                // Fallback: usar o primeiro nome capitalizado
                consultor = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : "Não informado";
              }
            }
          }

          return {
            id: item.os || item.id || Math.random().toString(),
            os: item.os || item.id || "",
            titulo: item.titulo || item.title || `Item ${item.os || item.id}`,
            cliente: item.cliente || item.client || "Cliente não informado",
            responsavel: item.responsavel || item.responsible || "Não informado",
            consultor: consultor,
            status: item.status || "Pendente",
            prazo: item.dataRegistro || item.deadline || "",
            data: item.dataRegistro || item.date || "",
            rawData: item.rawData || [],
          };
        });

      if (shouldForceOwn && user?.name) {
        const ownFirstName = user.name.split(" ")[0]?.toLowerCase();
        dbItems = dbItems.filter((item) =>
          (item.responsavel || "")
            .toString()
            .toLowerCase()
            .includes(ownFirstName)
        );
      }

      if (!shouldForceOwn && filteredByResponsavel) {
        dbItems = dbItems.filter(
          (item) =>
            item.responsavel &&
            item.responsavel.trim() === filteredByResponsavel
        );
      }

      if (
        !shouldForceOwn &&
        !filteredByResponsavel &&
        user?.name &&
        !isSpecialUser &&
        !isAdmin
      ) {
        const ownFirstName = user.name.split(" ")[0]?.toLowerCase();
        dbItems = dbItems.filter((item) =>
          (item.responsavel || "")
            .toString()
            .toLowerCase()
            .includes(ownFirstName)
        );
      }

      setDatabaseItems(dbItems);
    } catch (error) {
      console.error("Erro ao carregar dados do banco:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekActivities = () => {
    const weekActivities: { [key: string]: CalendarItem[] } = {};
    const allItems = [...(processedItems || []), ...databaseItems];

    allItems.forEach((item: any) => {
      let prazoDate = null;

      // Handle different item structures
      const itemData = item.data || item.date || item.prazo || item.deadline;

      if (itemData && typeof itemData === 'string' && itemData.includes("-")) {
        prazoDate = new Date(itemData);
        if (isNaN(prazoDate.getTime())) {
          prazoDate = null;
        }
      } else if (itemData) {
        prazoDate = parseDate(itemData);
      }

      if (prazoDate) {
        const dateKey = prazoDate.toISOString().split("T")[0];
        if (!weekActivities[dateKey]) {
          weekActivities[dateKey] = [];
        }

        // Ensure item has proper CalendarItem structure
        const calendarItem: CalendarItem = {
          id: item.id || item.os || Math.random().toString(),
          os: item.os || item.id || "",
          titulo: item.titulo || item.title || "",
          cliente: item.cliente || item.client || "",
          responsavel: item.responsavel || item.responsible || "",
          consultor: item.consultor || "",
          status: item.status || "Pendente",
          prazo: item.prazo || item.deadline || itemData || "",
          data: item.data || item.date || itemData || "",
          rawData: item.rawData || [],
        };

        weekActivities[dateKey].push(calendarItem);
      }
    });

    return weekActivities;
  };

  const openTaskModal = (activity: CalendarItem) => {
    // TODO: Implement task modal functionality
    console.log("Opening task modal for:", activity);
  };

  useEffect(() => {
    const onResize = () =>
      setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (dashboardData) {
      loadDatabaseItems();
    }
  }, [
    filteredByResponsavel,
    shouldForceOwn,
    user?.name,
    user?.email,
    isAdmin,
    dashboardData,
  ]);

  const today = new Date();
  const todayBrasilia = new Date(
    today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

  const weekActivities = getWeekActivities();

  return (
    <Card className="bg-white h-[650px] flex flex-col">
      <ActivityHeader
        isLoading={isLoading}
        completedActivities={completedActivities}
        onClearCompleted={() => {
          const today = new Date();
          const todayBrasilia = new Date(
            today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
          );
          const todayKey = todayBrasilia.toISOString().split("T")[0];
          localStorage.removeItem(`completedActivities_${todayKey}`);
          setCompletedActivities(new Set());
        }}
      />
      <CardContent className="flex-1 overflow-hidden p-4 pb-4">
        <div className="h-full lg:grid lg:grid-cols-5 lg:gap-2">
          <div className="lg:hidden h-full">
            <List
              height={500}
              width="100%"
              itemCount={5}
              itemSize={250}
              itemData={{
                days: ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"],
                weekActivities,
                completedActivities,
                todayBrasilia,
                isDesktop,
                getStatusColor,
                getDisplayResponsavel,
                openTaskModal,
              }}
            >
              {({ index, style, data }: { index: number; style: React.CSSProperties; data: any }) => {
                const dayName = data.days[index];
                const currentDate = new Date(todayBrasilia);
                const dayOfWeek = currentDate.getDay();
                const dayDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate() -
                    dayOfWeek +
                    (dayOfWeek === 0 ? -6 : 1) +
                    index
                );
                const dayDateKey = dayDate.toISOString().split("T")[0];
                const isToday =
                  dayDate.toDateString() === data.todayBrasilia.toDateString();
                const activitiesForDay = data.weekActivities[dayDateKey] || [];

                return (
                  <div style={style} className="pb-2">
                    <div className="flex flex-col bg-gray-50 rounded-md p-2 h-full">
                      <div
                        className={`text-xs font-semibold mb-4 flex items-center justify-between ${isToday ? "text-blue-600" : "text-gray-700"}`}
                      >
                        <div className="flex-1 text-center">{dayName}</div>
                        <div className="bg-gray-200 text-gray-600 rounded-full px-2 py-1 text-xs min-w-[20px] text-center">
                          {activitiesForDay.length}
                        </div>
                      </div>
                      <div className="flex-1 min-h-0">
                        {activitiesForDay.length > 0 ? (
                          <ActivityList
                            activitiesForDay={activitiesForDay}
                            completedActivities={completedActivities}
                            getStatusColor={getStatusColor}
                            getDisplayResponsavel={getDisplayResponsavel}
                            openTaskModal={openTaskModal}
                          />
                        ) : (
                          <div className="text-xs text-gray-400 text-center py-6">
                            Sem atividades
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            </List>
          </div>

          <div className="hidden lg:contents">
            {["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"].map(
              (dayName: string, index: number) => {
                const currentDate = new Date(todayBrasilia);
                const dayOfWeek = currentDate.getDay();
                const dayDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate() -
                    dayOfWeek +
                    (dayOfWeek === 0 ? -6 : 1) +
                    index
                );
                const dayDateKey = dayDate.toISOString().split("T")[0];
                const isToday =
                  dayDate.toDateString() === todayBrasilia.toDateString();
                const activitiesForDay = weekActivities[dayDateKey] || [];

                return (
                  <div
                    key={dayName}
                    className="flex flex-col bg-gray-50 rounded-md p-2"
                  >
                    <div
                      className={`text-xs font-semibold mb-4 flex items-center justify-between ${isToday ? "text-blue-600" : "text-gray-700"}`}
                    >
                      <div className="flex-1 text-center">{dayName}</div>
                      <div className="bg-gray-200 text-gray-600 rounded-full px-2 py-1 text-xs min-w-[20px] text-center">
                        {activitiesForDay.length}
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      {activitiesForDay.length > 0 ? (
                        <ActivityList
                          activitiesForDay={activitiesForDay}
                          completedActivities={completedActivities}
                          getStatusColor={getStatusColor}
                          getDisplayResponsavel={getDisplayResponsavel}
                          openTaskModal={openTaskModal}
                        />
                      ) : (
                        <div className="text-xs text-gray-400 text-center py-6">
                          Sem atividades
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
