"use client";

export default function Premios() {
    const tituloApp = process.env.NEXT_PUBLIC_APP_TITLE || "";
    // Identificamos el entorno automáticamente por su nombre en las variables de Vercel
    const esModoEmpresa = tituloApp.includes("MACHOS") || tituloApp.includes("ALFA");

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-t-4 border-emerald-500">
                <div className="text-center mb-8">
                    <span className="text-4xl">🎁</span>
                    <h1 className="text-3xl font-black text-gray-800 mt-2">PREMIOS Y PATROCINIOS</h1>
                    <p className="text-gray-500 font-semibold text-sm mt-1 uppercase tracking-wider text-emerald-600">
                        {esModoEmpresa ? "Bolsa Oficial de Premios Comerciales" : "Premios Oficiales Familia Murillo"}
                    </p>
                </div>

                <div className="space-y-6">
                    {esModoEmpresa ? (
                        // 🏢 VISTA PARA LA EMPRESA, CLIENTES Y AMIGOS (MACHOS ALFA)
                        <>
                            <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-xl text-emerald-900">🥇 1ER LUGAR GLOBAL</h3>
                                    <p className="text-sm text-emerald-700 font-medium mt-1">Gran Premio Especial de la Empresa</p>
                                </div>
                                <span className="text-2xl font-black text-emerald-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-emerald-100">$500 USD</span>
                            </div>

                            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-blue-900">🥈 2DO LUGAR</h3>
                                    <p className="text-xs text-blue-700 font-medium">Patrocinado por Socios Estratégicos</p>
                                </div>
                                <span className="font-bold text-blue-600 bg-white px-3 py-1.5 rounded-md text-sm border">Gift Card Amazon $100</span>
                            </div>

                            <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-purple-900">⚡ CAMPEÓN DE JORNADA</h3>
                                    <p className="text-xs text-purple-700 font-medium">Premio al mejor puntaje acumulado por cada Jornada</p>
                                </div>
                                <span className="font-bold text-purple-600 bg-white px-3 py-1.5 rounded-md text-sm border">Premio Sorpresa Mensual</span>
                            </div>
                        </>
                    ) : (
                        // 🏠 VISTA PARA LA INSTANCIA HOGAREÑA (FAMILIA MURILLO)
                        <>
                            <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-xl text-amber-900">🥇 REY DE LA QUINIELA</h3>
                                    <p className="text-sm text-amber-700 font-medium mt-1">Patrocinado por el Tío Beto: ¡No paga nada en la próxima reunión!</p>
                                </div>
                                <span className="text-lg font-black text-amber-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-amber-100">🍖 Cena Completa Gratis</span>
                            </div>

                            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">🥈 2DO LUGAR (El Esfuerzo)</h3>
                                    <p className="text-xs text-gray-500 font-medium">Bolsa recolectada entre los participantes</p>
                                </div>
                                <span className="font-bold text-gray-600 bg-white px-3 py-1.5 rounded-md text-sm border">🍷 Botella de Vino</span>
                            </div>

                            <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-red-900">💩 EL SÓTANO DE LA TABLA</h3>
                                    <p className="text-xs text-red-700 font-medium">Castigo obligatorio para el último lugar general</p>
                                </div>
                                <span className="font-bold text-red-600 bg-white px-3 py-1.5 rounded-md text-sm border">🧹 Lavar los platos</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}