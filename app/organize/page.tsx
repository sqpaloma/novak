"use client";

import { ResponsiveLayout } from "@/components/responsive-layout";
import { NotesSection } from "@/components/kanban/notes-section";
import { KanbanMain } from "@/components/kanban/kanban-main";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";



export function CalendarCombined() {
  const searchParams = useSearchParams();
  const router = useRouter();

  

  const initialTab =
    (searchParams?.get("tab") as "kanban" | "notes") || "kanban";
  const [tab, setTab] = React.useState<"kanban"  | "notes">(initialTab);

  React.useEffect(() => {
    const urlTab = (searchParams?.get("tab") as any) || "kanban";
    setTab(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onTabChange = (value: string) => {
    const next = (value as any) || "kanban";
    setTab(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      router.push(url.pathname + "?" + url.searchParams.toString());
    } catch {}
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Tabs value={tab} onValueChange={onTabChange} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
           
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="mt-2">
          <KanbanMain showNotes={false} />
        </TabsContent>

 

        <TabsContent value="notes" className="mt-2">
          <NotesSection
            notes={[]}
            onCreateNote={() => {}}
            onUpdateNote={() => {}}
            onDeleteNote={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ResponsiveLayout
      title="Organize-se"
      subtitle="Converse, anote e organize suas tarefas em um só lugar"
      fullWidth={true}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <CalendarCombined />
      </Suspense>
    </ResponsiveLayout>
  );
}
