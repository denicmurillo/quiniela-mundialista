"use client";

export default function Calendario() {
    return (
        <main className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-amber-500">
                    <h3 className="font-black text-gray-800 text-2xl md:text-3xl uppercase mb-6 tracking-tight text-center md:text-left">
                        📅 Cronograma de Celebraciones
                    </h3>

                    {/* 📢 ANUNCIO DE SEDE Y TRANSMISIONES */}
                    <div className="mb-10 p-6 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl shadow-lg text-white flex flex-col sm:flex-row items-center gap-6 border-b-4 border-amber-400">
                        <div className="bg-white/10 p-4 rounded-full flex-shrink-0 backdrop-blur-sm">
                            <span className="text-5xl">🍻</span>
                        </div>
                        <div className="text-center sm:text-left">
                            <h4 className="font-black text-sm md:text-base uppercase tracking-wider text-blue-200 mb-1">Sede Oficial</h4>
                            <span className="text-3xl md:text-4xl font-black uppercase text-amber-300 drop-shadow-md block leading-none">
                                EL CONTENEDOR
                            </span>
                            <p className="text-sm text-blue-100 font-medium mt-3 leading-relaxed">
                                ¡Ven a ver las transmisiones de los partidos en vivo en las fechas anunciadas y acompáñanos en nuestras épicas entregas de premios!
                            </p>
                        </div>
                    </div>

                    {/* LÍNEA DE TIEMPO */}
                    <div className="relative border-l-2 border-emerald-300 ml-4 space-y-10 pb-4">
                        {/* Evento 1 */}
                        <div className="relative pl-6 group">
                            <div className="absolute -left-[9px] top-1.5 bg-emerald-500 h-4 w-4 rounded-full border-2 border-white shadow-sm group-hover:bg-emerald-600 transition-colors"></div>
                            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase tracking-wider">Cierre Fase de Grupos</span>
                            <h4 className="font-bold text-gray-800 text-lg mt-2">Sábado 27 de Junio</h4>
                            <p className="text-sm text-gray-500 font-medium mt-1">Primera gran entrega de premios para los líderes de las Jornadas I, II y III.</p>
                        </div>

                        {/* Evento 2 */}
                        <div className="relative pl-6 group">
                            <div className="absolute -left-[9px] top-1.5 bg-blue-500 h-4 w-4 rounded-full border-2 border-white shadow-sm group-hover:bg-blue-600 transition-colors"></div>
                            <span className="text-xs font-black bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider">Cierre de Cuartos</span>
                            <h4 className="font-bold text-gray-800 text-lg mt-2">Sábado 11 de Julio</h4>
                            <p className="text-sm text-gray-500 font-medium mt-1">Celebración especial al concluir los encuentros de Cuartos de Final.</p>
                        </div>

                        {/* Evento 3 */}
                        <div className="relative pl-6 group">
                            <div className="absolute -left-[9px] top-1.5 bg-purple-500 h-4 w-4 rounded-full border-2 border-white shadow-sm group-hover:bg-purple-600 transition-colors"></div>
                            <span className="text-xs font-black bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full uppercase tracking-wider">La Gran Final</span>
                            <h4 className="font-bold text-gray-800 text-lg mt-2">Domingo 19 de Julio</h4>
                            <p className="text-sm text-gray-500 font-medium mt-1">Fiesta de clausura del Mundial 2026. Coronación del Gran Campeón Global de la quiniela.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}