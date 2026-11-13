import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import GuardaHorario from "./componentes/GuardaHorario";

export const metadata: Metadata = {
  title: "callZUP",
  description: "Comunicação simples, segura e eficiente.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" translate="no">
      <body>
        <Suspense fallback={null}>
          <GuardaHorario />
        </Suspense>
        {children}
      </body>
    </html>
  );
}