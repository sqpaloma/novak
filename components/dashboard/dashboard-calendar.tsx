"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useDashboardData } from "@/lib/convex-dashboard-client";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";

interface CalendarItem {
  id: string;
  os: string;
  titulo: string;
  cliente: string;
  responsavel?: string;
  status: string;
  prazo: string;
  data: string;
  rawData: any[];
}

interface DashboardCalendarProps {
  processedItems?: CalendarItem[];
  onDateClick?: (date: string, items: CalendarItem[]) => void;
  filteredByResponsavel?: string | null;
}

export function DashboardCalendar({
  processedItems = [],
  onDateClick,
  filteredByResponsavel,
}: DashboardCalendarProps) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const dashboardData = useDashboardData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarItems, setCalendarItems] = useState<{
    [key: string]: CalendarItem[];
  }>({});
  const [databaseItems, setDatabaseItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Flag global: consultores (e exceções por email) veem apenas seus próprios itens
  const forceOwnByEmail =
    user?.email?.toLowerCase() === "usuario@empresa.com.br" ||
    user?.email?.toLowerCase() === "consultor@empresa.com.br";
  const isConsultor = user?.role === "consultor" && !isAdmin;
  const shouldForceOwn = isAdmin ? false : isConsultor || forceOwnByEmail;
  const isSpecialManager =
    user?.email?.toLowerCase() === "gerente@empresa.com.br";

  // Carrega dados do banco de dados
  const loadDatabaseItems = async () => {
    setIsLoading(true);
    try {
      const items = dashboardData?.items || [];

      // Converte os dados do banco para o formato do calendário
      let dbItems: CalendarItem[] = items
        .filter((item) => item.dataRegistro) // Só inclui itens com dataRegistro
        .map((item) => ({
          id: item.os,
          os: item.os,
          titulo: item.titulo || `Item ${item.os}`,
          cliente: item.cliente || "Cliente não informado",
          responsavel: item.responsavel || "Não informado",
          status: item.status,
          prazo: item.dataRegistro || "", // Usa dataRegistro como prazo
          data: item.dataRegistro || "",
          rawData: item.rawData || [],
        }));

      // Aplica filtro por consultor logado (quando aplicável)
      if (shouldForceOwn && user?.name) {
        const ownFirstName = user.name.split(" ")[0]?.toLowerCase();
        dbItems = dbItems.filter((item) =>
          (item.responsavel || "")
            .toString()
            .toLowerCase()
            .includes(ownFirstName)
        );
      }

      // Aplica filtro por responsável manual, se ativo e não estiver forçando próprio
      if (!shouldForceOwn && filteredByResponsavel) {
        dbItems = dbItems.filter(
          (item) =>
            item.responsavel &&
            item.responsavel.trim() === filteredByResponsavel
        );
      }

      // Filtro padrão: sem filtro manual, exibir itens do próprio usuário
      // EXCEÇÃO: Gerente vê o geral por padrão
      if (
        !shouldForceOwn &&
        !filteredByResponsavel &&
        user?.name &&
        !isSpecialManager &&
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
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega dados do banco quando o componente monta ou quando o filtro muda
  useEffect(() => {
    loadDatabaseItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredByResponsavel,
    shouldForceOwn,
    user?.name,
    user?.email,
    isAdmin,
    dashboardData,
  ]);

  // Processa os itens para extrair datas de prazo
  useEffect(() => {
    const itemsByDate: { [key: string]: CalendarItem[] } = {};

    // Combina dados da planilha com dados do banco
    const allItems = [...processedItems, ...databaseItems];

    allItems.forEach((item) => {
      // Tenta extrair a data do prazo
      let prazoDate = null;

      // Primeiro, tenta usar o campo data_registro se for do banco
      if (item.data && item.data.includes("-")) {
        // Se a data está em formato ISO (YYYY-MM-DD), usa diretamente
        prazoDate = new Date(item.data);
        if (isNaN(prazoDate.getTime())) {
          prazoDate = null;
        }
      } else if (item.prazo) {
        // Se tem prazo, tenta fazer parse
        prazoDate = parseDate(item.prazo);
      } else if (item.data) {
        // Se não tem prazo, usa a data padrão
        prazoDate = parseDate(item.data);
      }

      if (prazoDate) {
        const dateKey = prazoDate.toISOString().split("T")[0]; // YYYY-MM-DD
        if (!itemsByDate[dateKey]) {
          itemsByDate[dateKey] = [];
        }
        itemsByDate[dateKey].push(item);
      }
    });

    setCalendarItems(itemsByDate);
  }, [processedItems, databaseItems]);

  // Função para fazer parse de diferentes formatos de data
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Remove espaços extras
    const cleanDate = dateString.toString().trim();

    // Tenta diferentes formatos
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/mm/yyyy
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // dd-mm-yyyy
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-mm-dd
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // dd/mm/yy
    ];

    for (const format of formats) {
      const match = cleanDate.match(format);
      if (match) {
        if (format.source.includes("yyyy")) {
          // Formato com ano completo
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Formato com ano abreviado
          const [, day, month, year] = match;
          const fullYear =
            parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
          return new Date(fullYear, parseInt(month) - 1, parseInt(day));
        }
      }
    }

    // Se for um número (data do Excel)
    if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
      const excelDate = Number(cleanDate);
      return new Date((excelDate - 25569) * 86400 * 1000);
    }

    return null;
  };

  // Calcula itens em atraso usando useMemo para otimizar performance
  const overdueItemsList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allItems = [...processedItems, ...databaseItems];
    const overdueItems: CalendarItem[] = [];

    allItems.forEach((item) => {
      let itemDate = null;

      // Tenta extrair a data do prazo
      if (item.data && item.data.includes("-")) {
        itemDate = new Date(item.data);
        if (isNaN(itemDate.getTime())) {
          itemDate = null;
        }
      } else if (item.prazo) {
        itemDate = parseDate(item.prazo);
      } else if (item.data) {
        itemDate = parseDate(item.data);
      }

      if (itemDate && itemDate < today) {
        overdueItems.push(item);
      }
    });

    return overdueItems;
  }, [processedItems, databaseItems]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const calendarDays = [];

  // Dias vazios no início
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const today = new Date().getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const now = new Date();
  const isViewingPastMonth =
    currentYear < now.getFullYear() ||
    (currentYear === now.getFullYear() && currentMonth < now.getMonth());

  const getMonthName = (month: number) => {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return months[month];
  };

  const handleDateClick = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    const itemsForDate = calendarItems[dateKey] || [];

    if (itemsForDate.length > 0) {
      setSelectedDate(dateKey);
      if (onDateClick) {
        onDateClick(dateKey, itemsForDate);
      }
    }
  };

  const hasItemsOnDate = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return calendarItems[dateKey] && calendarItems[dateKey].length > 0;
  };

  const getItemsCountOnDate = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return calendarItems[dateKey] ? calendarItems[dateKey].length : 0;
  };

  const isDatePastToday = (day: number) => {
    const itemDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return itemDate < todayDate;
  };

  const isDateFutureToday = (day: number) => {
    const itemDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return itemDate > todayDate;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    const todayDate = new Date();
    setCurrentDate(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  };

  return (
    <Card className="bg-white h-full flex flex-col">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs lg:text-sm xl:text-base text-gray-800 flex items-center">
            <Calendar className="h-3 w-3 mr-2" />
            Agendamentos
            {isLoading && (
              <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            )}
          </CardTitle>
          {isViewingPastMonth && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-7 px-2 text-xs"
            >
              {" "}
              ▷▷{" "}
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="hover:bg-gray-100"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="font-medium text-gray-700 text-xs lg:text-sm xl:text-base">
            {getMonthName(currentMonth)} {currentYear}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="hover:bg-gray-100"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 flex-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  p-2 text-center text-sm cursor-pointer rounded-lg
                  flex flex-col items-center justify-center h-full
                  ${
                    day === null
                      ? "invisible"
                      : day === today &&
                          currentMonth === new Date().getMonth() &&
                          currentYear === new Date().getFullYear()
                        ? "bg-blue-100 text-blue-600 font-bold"
                        : hasItemsOnDate(day) && isDatePastToday(day)
                          ? "bg-red-100 text-red-800 font-medium hover:bg-red-200"
                          : hasItemsOnDate(day) && isDateFutureToday(day)
                            ? "bg-green-100 text-green-800 font-medium hover:bg-green-200"
                            : hasItemsOnDate(day)
                              ? "bg-blue-100 text-blue-600 font-medium hover:bg-blue-200"
                              : "hover:bg-gray-100 text-gray-700"
                  }
                  ${
                    selectedDate ===
                    `${currentYear}-${String(currentMonth + 1).padStart(
                      2,
                      "0"
                    )}-${String(day).padStart(2, "0")}`
                      ? "ring-2 ring-blue-500"
                      : ""
                  }
                `}
                onClick={() => day && handleDateClick(day)}
              >
                {day}
                {day && hasItemsOnDate(day) && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      day === today &&
                      currentMonth === new Date().getMonth() &&
                      currentYear === new Date().getFullYear()
                        ? "bg-blue-500"
                        : isDatePastToday(day)
                          ? "bg-red-500"
                          : isDateFutureToday(day)
                            ? "bg-green-500"
                            : "bg-blue-500"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
