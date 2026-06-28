"use client";

export default function Calendario() {
    const tituloApp = process.env.NEXT_PUBLIC_APP_TITLE || "";
    // Identificamos el entorno para mostrar el mensaje correcto de la fiesta
    const esModoEmpresa = tituloApp.includes("MACHOS") || tituloApp.includes("ALFA") || tituloApp.includes("MELCOCHONES");

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
                                ¡Acompáñanos en nuestras épicas entregas de premios y transmisiones en vivo!
                            </p>
                        </div>
                    </div>

                    {/* LÍNEA DE TIEMPO */}
                    <div className="relative border-l-2 border-emerald-300 ml-4 space-y-10 pb-4">

                        {/* Evento 1: Dinámico según la quiniela */}
                        <div className="relative pl-6 group">
                            <div className="absolute -left-[9px] top-1.5 bg-gray-500 h-4 w-4 rounded-full border-2 border-white shadow-sm transition-colors"></div>
                            <span className="text-xs font-black bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                COMPLETADO ✅
                            </span>

                            {!esModoEmpresa ? (
                                // MENSAJE DE ÉXITO PARA LA FAMILIA
                                <div className="mt-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                    <h4 className="font-bold text-gray-800 text-lg">Sábado 27 de Junio - Fase de Grupos</h4>
                                    <p className="text-sm text-gray-600 font-medium mt-2">
                                        ¡Qué gran primera entrega! Tuvimos un ambiente espectacular. Felicidades a <strong>Denic</strong> (Líder J1) y a <strong>Tía Mila</strong> (Líder J2) por sus premios. Los premios de la Jornada III se estarán entregando el próximo sábado 11 de julio. ¡Gracias a todos los que nos acompañaron! 🎉
                                    </p>
                                </div>
                            ) : (
                                // MENSAJE SARCÁSTICO/HUMORÍSTICO PARA LOS AMIGOS
                                <div className="mt-3 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                                    <h4 className="font-bold text-gray-800 text-lg">Sábado 27 de Junio - El Cumpleaños Fantasma 🎂</h4>
                                    <p className="text-sm text-gray-600 font-medium mt-2 mb-2">
                                        Un monumento y agradecimiento exclusivo a <strong>Oscar</strong> (Líder J2), ¡literalmente el único que llegó a la premiación! 🏆 (y Dylan, que no le quedaba de otra)
                                    </p>
                                    <p className="text-sm text-gray-600 font-medium mt-1">
                                        Al parecer, un cumpleaños sorpresa en PECHE Fitness nos boicoteó la asistencia masiva. No hay resentimientos, pero para la próxima al menos avisen para llevar el queque. 😅 Los premios pendientes de J1, J2 y J3 se estarán entregando el sábado 11 de julio.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Evento 2 */}
                        <div className="relative pl-6 group">
                            <div className="absolute -left-[9px] top-1.5 bg-blue-500 h-4 w-4 rounded-full border-2 border-white shadow-sm group-hover:bg-blue-600 transition-colors"></div>
                            <span className="text-xs font-black bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider">Próximo Evento</span>
                            <h4 className="font-bold text-gray-800 text-lg mt-2">Sábado 11 de Julio - Cierre de Cuartos</h4>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                Celebración especial a partir de las 2:30 p.m. para ver los últimos encuentros de Cuartos de Final.
                                {esModoEmpresa && " (Esperemos que esta vez nadie cumpla años sin avisar 👀)."}
                            </p>
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