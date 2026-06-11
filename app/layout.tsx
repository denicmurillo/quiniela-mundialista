import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // IMPORTAMOS LA BARRA

const inter = Inter({ subsets: ["latin"] });

// Estos son los datos que leen los navegadores y WhatsApp para los enlaces
export const metadata: Metadata = {
  title: "Quiniela Mundialista NFL CQ",
  description: "Demuestra quién sabe más de fútbol. Juega con amigos y familiares.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar /> {/* AQUÍ INYECTAMOS LA BARRA PARA TODAS LAS PÁGINAS */}
        {children}
      </body>
    </html>
  );
}