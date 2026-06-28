"use client";
import { sembrarCalendario } from "../../lib/cargarCalendario";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { db, auth } from "../../lib/firebase";
import { procesarPuntosDePrediccion } from "../../lib/motorPuntos";

// IMPORTACIONES MÁGICAS AUTOMÁTICAS
import {
    calcularYGenerar16avos,
    generarOctavos,
    generarCuartos,
    generarSemis,
    generarFinal
} from "../../lib/generarEliminatorias";

interface Partido {
    id: string;
    equipo_local: string;
    equipo_visitante: string;
    estado_partido: string;
    jornada?: number;
    goles_local?: number;
    goles_visitante?: number;
    ganador_avanza?: string;
}

export default function PanelAdmin() {
    const CORREO_ADMIN = "denicmurillo@gmail.com";

    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [cargando, setCargando] = useState(true);
    const [resultados, setResultados] = useState<Record<string, { local: string, visitante: string, avanza: string }>>({});

    const [usuarioAdmin, setUsuarioAdmin] = useState<User | null>(null);
    const [verificando, setVerificando] = useState(true);

    useEffect(() => {
        const cancelarSuscripcion = onAuthStateChanged(auth, (user) => {
            setUsuarioAdmin(user);
            setVerificando(false);
        });

        const cargarPartidosPendientes = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "partidos"));
                const lista: Partido[] = [];
                querySnapshot.forEach((doc) => {
                    lista.push({ id: doc.id, ...doc.data() } as Partido);
                });
                lista.sort((a, b) => (a.jornada || 1) - (b.jornada || 1));
                setPartidos(lista);
            } catch (error) {
                console.error("Error al cargar partidos:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarPartidosPendientes();
        return () => cancelarSuscripcion();
    }, []);

    const manejarCambio = (partidoId: string, tipo: "local" | "visitante" | "avanza", valor: string) => {
        setResultados(prev => ({ ...prev, [partidoId]: { ...prev[partidoId], [tipo]: valor } }));
    };

    const finalizarPartido = async (partidoId: string) => {
        const res = resultados[partidoId];
        if (!res || res.local === "" || res.visitante === "") {
            alert("⚠️ Ingresa ambos marcadores reales para finalizar el partido.");
            return;
        }

        const partidoActual = partidos.find(p => p.id === partidoId);
        const jornadaDelPartido = partidoActual?.jornada || 1;

        // Si es fase eliminatoria, el campo 'avanza' es obligatorio
        if (jornadaDelPartido >= 4 && (!res.avanza || res.avanza === "")) {
            alert("⚠️ Al ser fase eliminatoria, debes definir obligatoriamente qué equipo avanza a la siguiente ronda (Tiempos extra / Penales).");
            return;
        }

        const realLocal = parseInt(res.local);
        const realVisitante = parseInt(res.visitante);

        if (!confirm(`¿Seguro que quieres procesar el resultado ${realLocal} - ${realVisitante}?`)) return;

        try {
            const partidoRef = doc(db, "partidos", partidoId);

            // Guardamos los goles de los 90min reglamentarios y quién avanza
            const updatePayload: Record<string, any> = {
                estado_partido: "finalizado",
                goles_local: realLocal,
                goles_visitante: realVisitante
            };
            if (jornadaDelPartido >= 4) {
                updatePayload.ganador_avanza = res.avanza;
            }

            await updateDoc(partidoRef, updatePayload);

            const prediccionesRef = collection(db, "predicciones");
            const q = query(prediccionesRef, where("partido_id", "==", partidoId));
            const prediccionesSnapshot = await getDocs(q);

            let prediccionesProcesadas = 0;
            for (const documento of prediccionesSnapshot.docs) {
                const data = documento.data();
                await procesarPuntosDePrediccion(documento.id, data.usuario_id, data.pronostico_local, data.pronostico_visitante, realLocal, realVisitante, jornadaDelPartido);
                prediccionesProcesadas++;
            }

            alert(`✅ Partido finalizado. Se guardaron los 90 minutos para la quiniela y se arrastró el bracket.`);
            window.location.reload();
        } catch (error) {
            console.error("Error al finalizar partido:", error);
            alert("Hubo un error al procesar los resultados.");
        }
    };

    const ejecutarBotonLlave = async (funcion: () => Promise<boolean>, mensaje: string) => {
        if (confirm(`¿Deseas ejecutar de forma automática el proceso de: ${mensaje}?`)) {
            const exito = await funcion();
            if (exito) alert(`🚀 ¡Llaves creadas y publicadas con éxito en los celulares de todos!`);
            window.location.reload();
        }
    };

    if (verificando) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-bold animate-pulse">Verificando credenciales...</div>;

    if (!usuarioAdmin || usuarioAdmin.email !== CORREO_ADMIN) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-6xl mb-4">🔒</h1>
                <h2 className="text-3xl font-bold text-red-500 mb-4">Acceso Restringido</h2>
                <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full">Volver a terreno seguro</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-red-500 mb-1">⚙️ Panel de Control</h1>
                <p className="text-center text-gray-400 mb-8 text-sm">Autenticado como administrador VIP</p>

                {/* ========================================== */}
                {/* 🚀 NUEVA BOTONERA MAESTRA AUTOMÁTICA DE LLAVES */}
                {/* ========================================== */}
                <div className="bg-gray-800 rounded-xl p-5 border border-red-900/50 mb-8">
                    <h2 className="text-red-400 font-bold tracking-wider text-xs uppercase mb-4 text-center sm:text-left">⚡ Automatización de Llaves Eliminatorias</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <button onClick={() => ejecutarBotonLlave(calcularYGenerar16avos, "Generar 16avos (Matemática de Grupos)")} className="bg-emerald-700 hover:bg-emerald-600 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Sáb Noche: 16avos</button>
                        <button onClick={() => ejecutarBotonLlave(generarOctavos, "Octavos de Final")} className="bg-blue-700 hover:bg-blue-600 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Octavos</button>
                        <button onClick={() => ejecutarBotonLlave(generarCuartos, "Cuartos de Final")} className="bg-purple-700 hover:bg-purple-600 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Cuartos</button>
                        <button onClick={() => ejecutarBotonLlave(generarSemis, "Semifinales")} className="bg-pink-700 hover:bg-pink-600 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Semifinal</button>
                        <button onClick={() => ejecutarBotonLlave(generarFinal, "La Gran Final")} className="bg-amber-600 hover:bg-amber-500 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Gran Final</button>
                    </div>
                </div>

                <div className="flex justify-center mb-6">
                    <button onClick={async () => { if (confirm("¿Cargar el calendario base?")) await sembrarCalendario(); }} className="text-xs font-bold text-gray-500 hover:text-white bg-gray-800 px-4 py-2 rounded-md border border-gray-700">Reiniciar Calendario Fase Grupos</button>
                </div>

                {cargando ? (
                    <p className="text-center text-white">Cargando marcadores del torneo...</p>
                ) : (
                    <div className="space-y-4">
                        {partidos.map((partido) => {
                            const esEliminatorio = (partido.jornada || 1) >= 4;
                            return (
                                <div key={partido.id} className={`bg-gray-800 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between border-l-4 ${esEliminatorio ? 'border-amber-400' : 'border-red-600'}`}>
                                    <div className="text-white font-bold text-lg flex-1 text-center md:text-right">{partido.equipo_local}</div>

                                    <div className="flex-1 flex flex-col items-center justify-center px-4 my-4 md:my-0">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Jornada {partido.jornada}</span>
                                        {partido.estado_partido === "finalizado" ? (
                                            <div className="flex flex-col items-center">
                                                <div className="flex gap-4 items-center text-2xl font-black text-white">
                                                    <span>{partido.goles_local}</span>
                                                    <span className="text-gray-600">-</span>
                                                    <span>{partido.goles_visitante}</span>
                                                </div>
                                                <span className="text-green-400 text-xs font-bold bg-green-950/40 px-2.5 py-0.5 rounded mt-2">
                                                    {esEliminatorio ? `Avanzó: ${partido.ganador_avanza}` : "Procesado"}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center w-full">
                                                <div className="flex gap-2 items-center">
                                                    <input type="number" min="0" placeholder="0" onChange={(e) => manejarCambio(partido.id, "local", e.target.value)} className="w-12 h-10 text-center bg-gray-700 text-white border border-gray-600 rounded text-lg font-bold" />
                                                    <span className="text-gray-500 font-bold text-xs">VS</span>
                                                    <input type="number" min="0" placeholder="0" onChange={(e) => manejarCambio(partido.id, "visitante", e.target.value)} className="w-12 h-10 text-center bg-gray-700 text-white border border-gray-600 rounded text-lg font-bold" />
                                                </div>

                                                {/* CAMPO DE SELECCIÓN OBLIGATORIO DE BRACKET */}
                                                {esEliminatorio && (
                                                    <select
                                                        onChange={(e) => manejarCambio(partido.id, "avanza", e.target.value)}
                                                        className="mt-3 bg-gray-900 border border-gray-600 rounded text-white text-xs p-2 w-full max-w-[180px] font-semibold outline-none"
                                                    >
                                                        <option value="">-- ¿Quién clasifica? --</option>
                                                        <option value={partido.equipo_local}>{partido.equipo_local}</option>
                                                        <option value={partido.equipo_visitante}>{partido.equipo_visitante}</option>
                                                    </select>
                                                )}

                                                <button onClick={() => finalizarPartido(partido.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-black py-2 px-4 rounded mt-3 uppercase tracking-wider">Cerrar Juego</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-white font-bold text-lg flex-1 text-center md:text-left">{partido.equipo_visitante}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}