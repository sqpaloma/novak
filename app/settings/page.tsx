"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

function SettingsPageContent() {
  const params = useSearchParams();
  const tabParam = params ? params.get("tab") : null;
  const [defaultTab, setDefaultTab] = useState<string>("profile");

  

  const [userSettings, setUserSettings] = useState<any>({
    // Profile
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    location: "",
    company: "",

    // Appearance (mantido no tipo, mas não usado na UI)
    theme: "dark",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",

    // System (mantido no tipo, mas não usado na UI)
    autoSave: true,
    backupFrequency: "daily",
    sessionTimeout: "30min",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);



  useEffect(() => {
    if (tabParam) setDefaultTab(tabParam);
  }, [tabParam]);


  const handleSettingChange = (key: any, value: any) => {
    setUserSettings((prev: any) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    
    try {
      setIsSaving(true);
      

      

      toast.success("Configurações atualizadas com sucesso");
      setIsDirty(false);
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ResponsiveLayout title="Configurações">
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave} disabled={!isDirty || isSaving}>
          <Save className="h-4 w-4 mr-2" />{" "}
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </ResponsiveLayout>
  );
}

