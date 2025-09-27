"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/Header";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Grid3X3,
  MessageSquare,
  BookOpen,
  Settings,
  Menu,
  LogOut,
  TrendingUp,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  titleRight?: React.ReactNode; // NOVO: conteúdo à direita do título
  fullWidth?: boolean; // NOVO: usar largura total no desktop
}

const baseMenuItems = [
  {
    icon: Grid3X3,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: MessageSquare,
    label: "Organize",
    href: "/organize",
  },
  {
    icon: DollarSign,
    label: "Cotações",
    href: "/cotacoes",
  },
  // NOVO: Follow-up por Cliente
  {
    icon: BookOpen,
    label: "Follow-up",
    href: "/follow-up",
  },

  {
    icon: BookOpen,
    label: "Manual",
    href: "/manual",
  },
];

// Componente para o botão hamburger customizado
function HamburgerMenuButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      onClick={toggleSidebar}
      variant="ghost"
      size="icon"
      className="!text-white !hover:bg-blue-700 p-2 rounded-md h-10 w-10"
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Abrir menu</span>
    </Button>
  );
}

export function ResponsiveLayout({
  children,
  title = "",
  subtitle,
  showBack = false,
  backHref = "/",
  titleRight,
  fullWidth = false,
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { isAdmin, user } = useAdmin();

  // Treat everything below Tailwind's xl (1280px) as mobile/tablet layout
  const [isNarrowScreen, setIsNarrowScreen] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 1279px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // Support initial set via MediaQueryList as well
      // @ts-expect-error - Event vs List typing
      const matches = "matches" in e ? e.matches : e.currentTarget?.matches;
      setIsNarrowScreen(Boolean(matches));
    };
    // Initial value
    setIsNarrowScreen(mql.matches);
    // Subscribe to changes
    const listener = (ev: MediaQueryListEvent) => handleChange(ev);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  const handleLogout = () => {
    signOut();
    window.location.href = "/auth";
  };

  const isConsultor = user?.role === "consultor" && !isAdmin;
  const isCompras = user?.role === "compras";

  // Function to check if user can access a specific route
  const canAccessRoute = (route: string) => {
    if (isAdmin) return true; // Admin can access everything

    switch (user?.role) {
      case "compras":
        return ["/cotacoes", "/settings"].includes(route); // Compras can access cotacoes and settings
      case "consultor":
        return ["/", "/organize", "/cotacoes", "/follow-up", "/manual", ].includes(route);
      case "qualidade_pcp":
      case "gerente":
      case "diretor":
        // These roles can access most things
        return true; // Allow access to all routes including settings
      default:
        return false;
    }
  };

  // Filter menu items based on user role permissions
  const filteredMenuItems = [
    ...baseMenuItems.filter(item => canAccessRoute(item.href)),
    // Add indicadores for non-consultor users
    ...(!isConsultor && canAccessRoute("/indicadores")
      ? [
          {
            icon: TrendingUp,
            label: "Indicadores",
            href: "/indicadores",
          },
        ]
      : []),
    // Add settings if user can access it
    ...(canAccessRoute("/settings")
      ? [
          {
            icon: Settings,
            label: "Configurações",
            href: "/settings",
          },
        ]
      : []),
  ];

  // Use the mobile-friendly sidebar layout on mobile and tablets
  if (isMobile || isNarrowScreen) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex w-full">
          <Sidebar
            side="left"
            variant="floating"
            className="bg-transparent border-0 [&>div]:bg-gradient-to-br [&>div]:from-blue-900 [&>div]:to-blue-800"
          >
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 h-full border-0">
              <SidebarHeader className="p-4 pb-8">
                <div className="flex items-center space-x-3">
                  {/* Logo igual ao header original */}
                  <div className="w-12 h-12 flex items-center justify-center relative">
                    <Image
                      src="/logo.png"
                      alt="Novak & Gouveia"
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-green-400 bg-blue-700 object-cover"
                      priority
                    />
                  </div>
                  {/* Nome da empresa igual ao header original */}
                  <div className="flex items-center space-x-1">
                    <span className="text-2xl font-bold text-white">Portal do</span>
                    <span className="text-2xl font-light text-green-400">
                      Fornecedor
                    </span>
                  </div>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {filteredMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className={`!text-white !hover:bg-white/10 ${
                          pathname === item.href
                            ? "!bg-white/10 !hover:bg-white/10"
                            : ""
                        }`}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {/* Logout button */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleLogout}
                      className="!text-white !hover:bg-white/10"
                    >
                      <LogOut className="h-5 w-5" />
                      Sair
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </div>
          </Sidebar>

          <SidebarInset className="flex-1 bg-transparent">
            <div className="p-4">
              <div className={fullWidth ? "w-full space-y-6" : "max-w-7xl mx-auto space-y-6"}>
                {/* Header simplificado para mobile/tablet - hamburger + logo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {showBack && (
                      <Link href={backHref} className="hover:opacity-80">
                        <ArrowLeft className="h-5 w-5 text-white" />
                      </Link>
                    )}
                    {/* Botão hamburger para mobile/tablet */}
                    <HamburgerMenuButton />
                    {/* Logo */}
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <Image
                        src="/logo.png"
                        alt="Novak & Gouveia"
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-green-400 bg-blue-700 object-cover"
                        priority
                      />
                    </div>
                    {/* Nome da empresa */}
                    <div className="flex items-center space-x-1">
                      <span className="text-2xl font-bold text-white">
                        Portal do
                      </span>
                      <span className="text-2xl font-light text-green-400">
                        Fornecedor
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conteúdo da página */}
                {children}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Desktop and large screens layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800">
      <div
        className={
          fullWidth ? "w-full space-y-6 p-4" : "max-w-7xl mx-auto space-y-6 p-4"
        }
      >
        <Header
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          backHref={backHref}
          actions={titleRight}
        />

        {/* Main content */}
        {children}
      </div>
    </div>
  );
}
