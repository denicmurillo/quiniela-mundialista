"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Navbar() {
    const pathname = usePathname(); // Nos dice en qué URL estamos parados
    const [usuario, setUsuario] = useState<User | null>(null);

    // Escuchamos si hay alguien conectado
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

    // Función rápida para saber si pintar el botón más oscuro
    const esActivo = (ruta: string) => pathname === ruta;

    return (

        <nav className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Logo / Título */}
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <span className="tracking-tighter text-white">MUNDIAL PRO 2026</span>
                    </Link>

                    {/* Botones de Navegación */}
                    <div className="flex space-x-1 sm:space-x-2">
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

                        {/* Renderizado Condicional: Si hay usuario, muestra Salir. Si no, Registro. */}
                        {usuario ? (
                            <button
                                onClick={cerrarSesion}
                                className="px-3 py-2 rounded-md text-sm font-semibold text-red-300 hover:bg-red-800/60 transition-colors ml-2"
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