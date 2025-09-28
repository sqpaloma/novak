import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { TooltipProvider } from "@/components/ui/tooltip";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  actions?: React.ReactNode; // NOVO: ações à direita do título
}

export function Header({
  title,
  subtitle,
  showBack = false,
  backHref = "/",
  actions,
}: HeaderProps) {

  return (
    <TooltipProvider>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            {showBack && (
              <Link href={backHref} className="hover:opacity-80">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
            )}
            {/* Substituir o círculo azul e 'ng' pelo logo */}
            <div className="w-12 h-12 flex items-center justify-center relative">
              <Image
                src="/logo.png"
                alt="Logo Novak & Gouveia"
                width={48}
                height={48}
                className="rounded-full border-2 border-green-400 bg-blue-700 object-cover"
                priority
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold text-white">Novak &</span>
              <span className="text-2xl font-light text-green-400">
                Gouveia
              </span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
