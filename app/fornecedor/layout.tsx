import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Portal do Fornecedor - Novak & Gouveia",
  description: "Portal exclusivo para fornecedores - Cotações de peças",
};

export default function FornecedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}