"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Navbar() {
    const pathname = usePathname();
    const [usuario, setUsuario] = useState<User | null>(null);
    const [menuAbierto, setMenuMenuAbierto] = useState(false); // Controla el dropdown

    useEffect(() => {
        const cancelarSuscripcion = onAuthStateChanged(auth, (user) => {
            setUsuario(user);
        });
        return () => cancelarSuscripcion();
    }, []);

    const cerrarSesion = async () => {
        if (confirm("¿Seguro que deseas salir de tu cuenta?")) {
            await signOut(auth);
        }
    };

    const esActivo = (ruta: string) => pathname === ruta;

    return (
        <nav className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Logo / Título */}
                    <Link href="/" className="font-bold text-lg tracking-tight hover:scale-105 transition-transform flex items-center gap-1">
                        ⚽ <span>MUNDIAL 2026</span>
                    </Link>

                    {/* Botones de Navegación Alineados */}
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${esActivo('/') ? 'bg-blue-800 text-white shadow-inner' : 'hover:bg-blue-700 text-blue-100'}`}
                        >
                            Partidos
                        </Link>

                        <Link
                            href="/ranking"
                            className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${esActivo('/ranking') ? 'bg-blue-800 text-white shadow-inner' : 'hover:bg-blue-700 text-blue-100'}`}
                        >
                            Ranking
                        </Link>

                        {/* MENÚ DESPLEGABLE "MÁS" */}
                        <div className="relative">
                            <button
                                onClick={() => setMenuMenuAbierto(!menuAbierto)}
                                className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-1 ${pathname === '/especiales' || pathname === '/premios' ? 'bg-blue-800 text-white' : 'hover:bg-blue-700 text-blue-100'}`}
                            >
                                Más ▾
                            </button>

                            {menuAbierto && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-100 z-50 animate-fadeIn">
                                    <Link
                                        href="/especiales"
                                        onClick={() => setMenuMenuAbierto(false)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold"
                                    >
                                        ⭐ Especiales (Podio)
                                    </Link>
                                    <Link
                                        href="/premios"
                                        onClick={() => setMenuMenuAbierto(false)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold"
                                    >
                                        🎁 Premios y Patrocinios
                                    </Link>
                                </div>
                            )}
                        </div>

                        {usuario ? (
                            <button
                                onClick={cerrarSesion}
                                className="px-3 py-2 rounded-md text-sm font-semibold text-red-300 hover:bg-red-800/60 transition-colors ml-1"
                            >
                                Salir
                            </button>
                        ) : (
                            <Link
                                href="/registro"
                                className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${esActivo('/registro') ? 'bg-blue-800 text-white shadow-inner' : 'hover:bg-blue-700 text-blue-100'}`}
                            >
                                Registro
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}