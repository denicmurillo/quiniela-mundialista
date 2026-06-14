"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Navbar() {
    const pathname = usePathname();
    const [usuario, setUsuario] = useState<User | null>(null);
    const [menuAbierto, setMenuMenuAbierto] = useState(false);

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
            <div className="max-w-4xl mx-auto px-2 sm:px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Logo / Título - Ajustado para que no robe espacio en móviles */}
                    <Link href="/" className="font-bold hover:scale-105 transition-transform flex items-center gap-1 whitespace-nowrap shrink-0">
                        <span className="text-xl md:text-2xl">⚽</span>
                        <span className="tracking-tighter text-white text-sm sm:text-base md:text-lg">MUNDIAL 2026</span>
                    </Link>

                    {/* Botones de Navegación - Redujimos padding en móvil para que quepan todos */}
                    <div className="flex items-center space-x-0.5 sm:space-x-2">
                        <Link
                            href="/"
                            className={`px-2 sm:px-3 py-2 rounded-md text-[11px] sm:text-sm font-semibold transition-colors ${esActivo('/') ? 'bg-blue-800 text-white shadow-inner' : 'hover:bg-blue-700 text-blue-100'}`}
                        >
                            Partidos
                        </Link>

                        <Link
                            href="/ranking"
                            className={`px-2 sm:px-3 py-2 rounded-md text-[11px] sm:text-sm font-semibold transition-colors ${esActivo('/ranking') ? 'bg-blue-800 text-white shadow-inner' : 'hover:bg-blue-700 text-blue-100'}`}
                        >
                            Ranking
                        </Link>

                        {/* MENÚ DESPLEGABLE "MÁS" */}
                        <div className="relative shrink-0">
                            <button
                                onClick={() => setMenuMenuAbierto(!menuAbierto)}
                                className={`px-2 sm:px-3 py-2 rounded-md text-[11px] sm:text-sm font-semibold transition-colors flex items-center gap-1 ${pathname === '/especiales' || pathname === '/premios' ? 'bg-blue-800 text-white' : 'hover:bg-blue-700 text-blue-100'}`}
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
                                className="px-2 sm:px-3 py-2 rounded-md text-[11px] sm:text-sm font-semibold text-red-300 hover:bg-red-800/60 transition-colors ml-0.5 shrink-0"
                            >
                                Salir
                            </button>
                        ) : (
                            <Link
                                href="/registro"
                                className={`px-2 sm:px-3 py-2 rounded-md text-[11px] sm:text-sm font-semibold transition-colors ${esActivo('/registro') ? 'bg-blue-800 text-white shadow-inner' : 'hover:bg-blue-700 text-blue-100'} shrink-0`}
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