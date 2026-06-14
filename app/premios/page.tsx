"use client";

export default function Premios() {
    const tituloApp = process.env.NEXT_PUBLIC_APP_TITLE || "";
    // Identificamos el entorno automáticamente por su nombre en las variables de Vercel
    const esModoEmpresa = tituloApp.includes("MACHOS") || tituloApp.includes("ALFA") || tituloApp.includes("MELCOCHONES");

    return (
        <main className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* ========================================== */}
                {/* 🎁 SECCIÓN DE PREMIOS */}
                {/* ========================================== */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-emerald-500">
                    <div className="text-center mb-8">
                        <span className="text-4xl">🎁</span>
                        <h1 className="text-3xl font-black text-gray-800 mt-2">PREMIOS DEL TORNEO</h1>
                        <p className="text-gray-500 font-semibold text-sm mt-1 uppercase tracking-wider text-emerald-600">
                            {esModoEmpresa ? "Bolsa Oficial de Premios" : "Premios Oficiales Familia Murillo"}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {esModoEmpresa ? (
                            // 🏢 VISTA PARA AMIGOS, CLIENTES Y EMPRESA
                            <>
                                {/* PREMIOS JORNADA I */}
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-emerald-600 py-3 px-4">
                                        <h2 className="font-black text-white text-center tracking-wider uppercase text-lg">🔥 Premios Jornada I</h2>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-emerald-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥇</span>
                                                <h3 className="font-black text-gray-800 text-lg">LÍDER DE LA JORNADA</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-emerald-700 block">Dos tacos con papas</span>
                                                <span className="text-xs text-gray-500 font-medium block">Patrocina: Tacos Don Carlos</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥈</span>
                                                <h3 className="font-black text-gray-700 text-lg">2DO LUGAR</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-gray-700 block">Imán coleccionable</span>
                                                <span className="text-xs text-gray-500 font-medium block">Patrocina: PunticoCR</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥉</span>
                                                <h3 className="font-black text-amber-700 text-lg">3ER LUGAR</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-amber-600 block">Sorpresa 🎁</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* GRAN PREMIO GLOBAL */}
                                <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                                    <div className="text-center md:text-left">
                                        <h3 className="font-black text-xl text-blue-900 uppercase">🏆 Gran Campeón Global</h3>
                                        <p className="text-sm text-blue-700 font-medium mt-1">Premio final al concluir el Mundial 2026</p>
                                    </div>
                                    <span className="text-lg md:text-xl font-black text-blue-600 bg-white px-6 py-3 rounded-lg shadow-sm border border-blue-100">Por definir 👀</span>
                                </div>
                            </>
                        ) : (
                            // 🏠 VISTA PARA LA FAMILIA MURILLO (Ahora con diseño unificado)
                            <>
                                {/* PREMIOS JORNADA I Y CASTIGOS */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-amber-500 py-3 px-4">
                                        <h2 className="font-black text-white text-center tracking-wider uppercase text-lg">🔥 Premios Jornada I</h2>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥇</span>
                                                <h3 className="font-black text-gray-800 text-lg">LÍDER DE LA JORNADA</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-amber-600 block">2 Tacos con papas 🎁</span>
                                                <span className="text-xs text-gray-500 font-medium block">El ganador de la Jornada I</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥈</span>
                                                <h3 className="font-black text-gray-700 text-lg">2DO LUGAR</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-gray-700 block">Imán coleccionable</span>
                                                <span className="text-xs text-gray-500 font-medium block">Patrocina: PunticoCR</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥉</span>
                                                <h3 className="font-black text-amber-700 text-lg">3ER LUGAR</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-amber-600 block">Sorpresa 🎁</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-red-200">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">💩</span>
                                                <h3 className="font-black text-red-900 text-lg">EL SÓTANO</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm md:text-base font-bold text-red-600 block">Lavar los platos donde abuelita 🧹</span>
                                                <span className="text-xs text-gray-500 font-medium block">Castigo para el último lugar general</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* GRAN PREMIO GLOBAL */}
                                <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                                    <div className="text-center md:text-left">
                                        <h3 className="font-black text-xl text-blue-900 uppercase">🏆 Gran Campeón Global</h3>
                                        <p className="text-sm text-blue-700 font-medium mt-1">Premio final al concluir el Mundial 2026</p>
                                    </div>
                                    <span className="text-lg md:text-xl font-black text-blue-600 bg-white px-6 py-3 rounded-lg shadow-sm border border-blue-100">Sorpresa 🎁</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* 🤝 SECCIÓN DE PATROCINADORES (Visible para todos) */}
                {/* ========================================== */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-blue-900">
                    <div className="text-center mb-8">
                        <span className="text-3xl">🤝</span>
                        <h2 className="text-2xl font-black text-gray-800 mt-2 uppercase tracking-tight">Patrocinadores Oficiales</h2>
                        <p className="text-gray-500 font-medium text-sm mt-1">Gracias a las marcas que hacen esta quiniela posible</p>
                    </div>

                    {/* Grilla expandida a 6 espacios: 2 columnas en móvil, 3 en desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-stretch justify-center">
                        {/* 1. Tacos Don Carlos */}
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="h-20 md:h-28 w-full flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-105">
                                <img src="/logo-tacos-don-carlos.png" alt="Tacos Don Carlos" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[10px] md:text-sm uppercase tracking-wide">Tacos Don Carlos</span>
                        </div>

                        {/* 2. Proeléctrica */}
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="h-20 md:h-28 w-full flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-105">
                                <img src="/logo-proelectrica.png" alt="Proeléctrica de Centroamérica S.A." className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[10px] md:text-sm uppercase tracking-wide">Proeléctrica</span>
                        </div>

                        {/* 3. PunticoCR */}
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="h-20 md:h-28 w-full flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-105">
                                <img src="/logo-punticoCR.png" alt="PunticoCR" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[10px] md:text-sm uppercase tracking-wide">PunticoCR</span>
                        </div>

                        {/* 4. M&G Abogados */}
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="h-20 md:h-28 w-full flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-105">
                                <img src="/logo-MYG.png" alt="M&G Abogados" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[10px] md:text-sm uppercase tracking-wide">M&G Abogados</span>
                        </div>

                        {/* 5. PECHE Fitness */}
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="h-20 md:h-28 w-full flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-105">
                                <img src="/logo-PECHE.png" alt="PECHE Fitness" className="max-h-full max-w-full object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-black text-gray-800 text-center text-[10px] md:text-sm uppercase tracking-wide">PECHE Fitness</span>
                        </div>

                        {/* 6. Espacio Disponible */}
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors group cursor-pointer">
                            <div className="h-20 md:h-28 w-full flex items-center justify-center mb-3 md:mb-4">
                                <span className="text-gray-300 group-hover:text-blue-400 text-4xl font-light">+</span>
                            </div>
                            <span className="font-bold text-gray-400 group-hover:text-blue-500 text-center text-[10px] md:text-sm uppercase tracking-wide">Tu Marca Aquí</span>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}