"use client";

import { useState } from "react";

export default function Premios() {
    const tituloApp = process.env.NEXT_PUBLIC_APP_TITLE || "";
    // Identificamos el entorno automáticamente por su nombre en las variables de Vercel
    const esModoEmpresa = tituloApp.includes("MACHOS") || tituloApp.includes("ALFA") || tituloApp.includes("MELCOCHONES");

    // Estado maestro para controlar cuál subpestaña de premios está activa
    const [tabActiva, setTabActiva] = useState<string>("j2");

    return (
        <main className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* ========================================== */}
                {/* 🎁 SECCIÓN DE PREMIOS CON SUBPESTAÑAS      */}
                {/* ========================================== */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-emerald-500">
                    <div className="text-center mb-6">
                        <span className="text-4xl">🎁</span>
                        <h1 className="text-3xl font-black text-gray-800 mt-2">PREMIOS DEL TORNEO</h1>
                        <p className="text-gray-500 font-semibold text-sm mt-1 uppercase tracking-wider text-emerald-600">
                            {esModoEmpresa ? "Bolsa Oficial de Premios" : "Premios Oficiales Familia Murillo"}
                        </p>
                    </div>

                    {/* BARRA DE SUBPESTAÑAS (Flex-wrap para que se acomoden en celular, Grid en PC) */}
                    <div className="bg-gray-100 p-2 rounded-xl flex flex-wrap justify-center gap-2 md:grid md:grid-cols-4 mb-6">
                        {[
                            { id: "j1", etiqueta: "Jornada I" },
                            { id: "j2", etiqueta: "Jornada II" },
                            { id: "j3", etiqueta: "Jornada III" },
                            { id: "elim", etiqueta: "Eliminatorias" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setTabActiva(tab.id)}
                                className={`flex-auto sm:flex-1 py-2 px-3 rounded-lg font-bold text-[11px] sm:text-xs uppercase tracking-wider text-center transition-all ${tabActiva === tab.id
                                    ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                                    }`}
                            >
                                {tab.etiqueta}
                            </button>
                        ))}
                    </div>

                    {/* CONTENIDO DINÁMICO SEGÚN LA PESTAÑA */}
                    <div className="space-y-4">

                        {/* 1. VISTA DE JORNADA I */}
                        {tabActiva === "j1" && (
                            <div className="space-y-4">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-emerald-600 py-3 px-4">
                                        <h2 className="font-black text-white text-center tracking-wider uppercase text-sm md:text-base">🔥 Premios en Juego: Jornada I</h2>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-emerald-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥇</span>
                                                <h3 className="font-black text-gray-800 text-base md:text-lg">LÍDER DE JORNADA</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-emerald-700 block">Dos tacos con papas 🌮</span>
                                                <span className="text-xs text-gray-400 font-medium block">Patrocina: Tacos Don Carlos</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥈</span>
                                                <h3 className="font-black text-gray-700 text-base md:text-lg">2DO LUGAR</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-gray-700 block">Imán coleccionable 🧲</span>
                                                <span className="text-xs text-gray-400 font-medium block">Patrocina: PunticoCR</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥉</span>
                                                <h3 className="font-black text-amber-700 text-base md:text-lg">3ER LUGAR</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-amber-600 block">Sorpresa 🎁</span>
                                                <span className="text-xs text-gray-400 font-medium block">Premio de la casa</span>
                                            </div>
                                        </div>

                                        {/* EL SÓTANO: EXCLUSIVO PARA LA QUINIELA FAMILIAR */}
                                        {!esModoEmpresa && (
                                            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-red-200">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">💩</span>
                                                    <h3 className="font-black text-red-900 text-base md:text-lg">EL SÓTANO</h3>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm md:text-base font-bold text-red-600 block">Lavar los platos donde abuelita 🧹</span>
                                                    <span className="text-xs text-gray-400 font-medium block">Castigo obligatorio para el último</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. VISTA DE JORNADA II */}
                        {tabActiva === "j2" && (
                            <div className="space-y-4">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-emerald-600 py-3 px-4">
                                        <h2 className="font-black text-white text-center tracking-wider uppercase text-sm md:text-base">🔥 Premios en Juego: Jornada II</h2>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-emerald-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥇</span>
                                                <h3 className="font-black text-gray-800 text-base md:text-lg">LÍDER DE JORNADA</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-emerald-700 block">
                                                    {esModoEmpresa ? "Balón de Fútbol ⚽" : "Camiseta de Fútbol 👕"}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium block">
                                                    {esModoEmpresa ? "Patrocina: PECHE Fitness" : "Patrocina: MYG Abogados"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥈</span>
                                                <h3 className="font-black text-gray-700 text-base md:text-lg">2DO LUGAR</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-gray-700 block">Imán Coleccionable 🧲</span>
                                                <span className="text-xs text-gray-400 font-medium block">Patrocina: PunticoCR</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥉</span>
                                                <h3 className="font-black text-amber-700 text-base md:text-lg">3ER LUGAR</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-amber-600 block">Premio Sorpresa 🎁</span>
                                                <span className="text-xs text-gray-400 font-medium block">Premio de la casa</span>
                                            </div>
                                        </div>

                                        {/* EL SÓTANO DE JORNADA II */}
                                        {!esModoEmpresa && (
                                            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-red-200">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">💩</span>
                                                    <h3 className="font-black text-red-900 text-base md:text-lg">EL SÓTANO</h3>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm md:text-base font-bold text-red-600 block">Cantar "Los pollitos dicen" 🐣</span>
                                                    <span className="text-xs text-gray-400 font-medium block">Obligatorio en la fiesta del 27 de junio</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. VISTA DE JORNADA III */}
                        {tabActiva === "j3" && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-emerald-600 py-3 px-4">
                                    <h2 className="font-black text-white text-center tracking-wider uppercase text-sm md:text-base">🔥 Premios en Juego: Jornada III</h2>
                                </div>
                                <div className="p-8 text-center text-gray-400 italic font-semibold bg-white">
                                    Bolsa de premios del cierre de grupos en definición. ¡Asegura tus marcadores! ⚽
                                </div>
                            </div>
                        )}

                        {/* 4. VISTA DE ELIMINATORIAS */}
                        {tabActiva === "elim" && (
                            <div className="space-y-4">
                                <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                                    <div className="text-center md:text-left">
                                        <h3 className="font-black text-xl text-blue-900 uppercase">🏆 GRAN CAMPEÓN GLOBAL</h3>
                                        <p className="text-sm text-blue-700 font-medium mt-1">Premio final acumulado de todo el torneo</p>
                                    </div>
                                    <span className="text-lg md:text-xl font-black text-blue-600 bg-white px-6 py-3 rounded-lg shadow-sm border border-blue-100">Por definir 👀</span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* ========================================== */}
                {/* 🤝 SECCIÓN DE PATROCINADORES AMPLIADA (10)  */}
                {/* ========================================== */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-blue-900">
                    <div className="text-center mb-8">
                        <span className="text-3xl">🤝</span>
                        <h2 className="text-2xl font-black text-gray-800 mt-2 uppercase tracking-tight">Patrocinadores Oficiales</h2>
                        <p className="text-gray-500 font-medium text-sm mt-1">Gracias a las marcas que hacen esta quiniela posible</p>
                    </div>

                    {/* Grilla expandida a 10 espacios: adaptativa en todas las pantallas */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch justify-center">

                        {/* 1. Tacos Don Carlos */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                            <div className="h-20 w-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                                <img src="/logo-tacos-don-carlos.png" alt="Tacos Don Carlos" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[11px] uppercase tracking-wide">Tacos Don Carlos</span>
                        </div>

                        {/* 2. Proeléctrica */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                            <div className="h-20 w-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                                <img src="/logo-proelectrica.png" alt="Proeléctrica" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[11px] uppercase tracking-wide">Proeléctrica</span>
                        </div>

                        {/* 3. PunticoCR */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                            <div className="h-20 w-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                                <img src="/logo-punticoCR.png" alt="PunticoCR" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[11px] uppercase tracking-wide">PunticoCR</span>
                        </div>

                        {/* 4. M&G Abogados */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                            <div className="h-20 w-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                                <img src="/logo-MYG.png" alt="M&G Abogados" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[11px] uppercase tracking-wide">M&G Abogados</span>
                        </div>

                        {/* 5. PECHE Fitness */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                            <div className="h-20 w-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                                <img src="/logo-PECHE.png" alt="PECHE Fitness" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[11px] uppercase tracking-wide">PECHE Fitness</span>
                        </div>

                        {/* 6. Bufete Zamora */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                            <div className="h-20 w-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                                <img src="/logo-bufete-zamora.png" alt="Bufete Zamora" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[11px] uppercase tracking-wide">Bufete Zamora</span>
                        </div>

                        {/* 7. Óptica D'Arce */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                            <div className="h-20 w-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                                <img src="/logo-opticadarce.png" alt="Óptica D'Arce" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[11px] uppercase tracking-wide">Óptica D'Arce</span>
                        </div>

                        {/* 8. Tajo Santa Fe */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                            <div className="h-20 w-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                                <img src="/logo-tajo-santa-fe.png" alt="Tajo Santa Fe" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[11px] uppercase tracking-wide">Tajo Santa Fe</span>
                        </div>

                        {/* 9. Espacio Disponible */}
                        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-colors group cursor-pointer">
                            <div className="h-20 w-full flex items-center justify-center mb-2">
                                <span className="text-gray-300 group-hover:text-emerald-500 text-3xl font-light">+</span>
                            </div>
                            <span className="font-bold text-gray-400 group-hover:text-emerald-600 text-center text-[10px] uppercase tracking-wide">Disponible</span>
                        </div>

                        {/* 10. Espacio Disponible */}
                        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-colors group cursor-pointer">
                            <div className="h-20 w-full flex items-center justify-center mb-2">
                                <span className="text-gray-300 group-hover:text-emerald-500 text-3xl font-light">+</span>
                            </div>
                            <span className="font-bold text-gray-400 group-hover:text-emerald-600 text-center text-[10px] uppercase tracking-wide">Disponible</span>
                        </div>

                    </div>
                </div>

            </div>
        </main>
    );
}