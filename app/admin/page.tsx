"use client";
import { sembrarCalendario } from "../../lib/cargarCalendario";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { db, auth } from "../../lib/firebase";
import { procesarPuntosDePrediccion } from "../../lib/motorPuntos";
import { asignarPuntosEspeciales } from "../../lib/procesarPuntosEspeciales"; // 🔥 IMPORTACIÓN DEL NUEVO MOTOR

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
    fecha_hora: string;
    fecha_original?: any;
}

export default function PanelAdmin() {
    const CORREO_ADMIN = "denicmurillo@gmail.com";

    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [cargando, setCargando] = useState(true);
    const [resultados, setResultados] = useState<Record<string, { local: string, visitante: string, avanza: string }>>({});

    const [usuarioAdmin, setUsuarioAdmin] = useState<User | null>(null);
    const [verificando, setVerificando] = useState(true);

    // 🔥 PESTAÑA ACTIVA EN ADMIN: "fase_final" seleccionada por defecto
    const [tabFase, setTabFase] = useState<"fase_final" | "octavos_16avos" | "grupos">("fase_final");

    // 🏆 ESTADOS PARA LOS PREMIOS ESPECIALES
    const [campeon, setCampeon] = useState("España");
    const [goles, setGoles] = useState("Kylian Mbappé");
    const [mvp, setMvp] = useState("Rodrigo Hernández");
    const [procesandoEspeciales, setProcesandoEspeciales] = useState(false);

    useEffect(() => {
        const cancelarSuscripcion = onAuthStateChanged(auth, (user) => {
            setUsuarioAdmin(user);
            setVerificando(false);
        });

        const cargarPartidosAdmin = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "partidos"));
                const lista: Partido[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    let fechaFormateada = data.fecha_hora;

                    let fechaOriginal = data.fecha_original || data.fecha_hora;
                    if (fechaOriginal && typeof fechaOriginal.toDate === 'function') {
                        fechaOriginal = fechaOriginal.toDate();
                        fechaFormateada = fechaOriginal.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' });
                    } else if (fechaOriginal && fechaOriginal.seconds) {
                        fechaOriginal = new Date(fechaOriginal.seconds * 1000);
                        fechaFormateada = fechaOriginal.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' });
                    } else if (typeof fechaOriginal === 'string') {
                        fechaOriginal = new Date(fechaOriginal);
                    }

                    lista.push({
                        id: doc.id,
                        ...data,
                        fecha_hora: fechaFormateada,
                        fecha_original: fechaOriginal,
                        jornada: data.jornada || 1
                    } as Partido);
                });

                lista.sort((a, b) => {
                    const timeA = a.fecha_original instanceof Date && !isNaN(a.fecha_original.getTime()) ? a.fecha_original.getTime() : 0;
                    const timeB = b.fecha_original instanceof Date && !isNaN(b.fecha_original.getTime()) ? b.fecha_original.getTime() : 0;
                    return timeA - timeB;
                });

                setPartidos(lista);
            } catch (error) {
                console.error("Error al cargar partidos:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarPartidosAdmin();
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

        if (jornadaDelPartido >= 4 && (!res.avanza || res.avanza === "")) {
            alert("⚠️ Al ser fase eliminatoria, debes definir obligatoriamente qué equipo avanza a la siguiente ronda (Tiempos extra / Penales).");
            return;
        }

        const realLocal = parseInt(res.local);
        const realVisitante = parseInt(res.visitante);

        if (!confirm(`¿Seguro que quieres procesar el resultado ${realLocal} - ${realVisitante}?`)) return;

        try {
            const partidoRef = doc(db, "partidos", partidoId);

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

    // 🏆 MANEJADOR DE PREMIOS ESPECIALES
    const handleProcesarEspeciales = async () => {
        if (!confirm("⚠️ ¿Estás seguro de procesar los premios especiales? Esto sumará +3 puntos a los usuarios que acertaron en la base de datos de manera definitiva.")) return;

        setProcesandoEspeciales(true);
        const res = await asignarPuntosEspeciales(campeon, goles, mvp);
        alert(res.message);
        setProcesandoEspeciales(false);
    };

    const partidosFiltrados = partidos.filter(p => {
        const j = p.jornada || 1;
        if (tabFase === "fase_final") return j >= 6;
        if (tabFase === "octavos_16avos") return j === 4 || j === 5;
        return j <= 3;
    });

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
                <p className="text-center text-gray-400 mb-6 text-sm">Autenticado como administrador VIP</p>

                {/* ========================================== */}
                {/* 🏆 PREMIOS ESPECIALES DEL MUNDIAL           */}
                {/* ========================================== */}
                <div className="bg-gray-800 rounded-xl p-5 border border-yellow-600/50 mb-6 shadow-lg">
                    <h2 className="text-yellow-500 font-bold tracking-wider text-xs uppercase mb-4 text-center sm:text-left">🏆 Asignación de Puntos: Premios Especiales</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Campeón del Mundo</label>
                            <input
                                type="text"
                                value={campeon}
                                onChange={(e) => setCampeon(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded text-white p-2.5 font-semibold outline-none focus:border-yellow-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Bota de Oro (Goles)</label>
                            <input
                                type="text"
                                value={goles}
                                onChange={(e) => setGoles(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded text-white p-2.5 font-semibold outline-none focus:border-yellow-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Balón de Oro (MVP)</label>
                            <input
                                type="text"
                                value={mvp}
                                onChange={(e) => setMvp(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded text-white p-2.5 font-semibold outline-none focus:border-yellow-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex justify-center sm:justify-start">
                        <button
                            onClick={handleProcesarEspeciales}
                            disabled={procesandoEspeciales}
                            className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-500 text-white font-black py-3 px-8 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {procesandoEspeciales ? "Calculando..." : "Otorgar +3 Puntos"}
                        </button>
                    </div>
                </div>

                {/* ========================================== */}
                {/* AUTOMATIZACIÓN DE LLAVES                   */}
                {/* ========================================== */}
                <div className="bg-gray-800 rounded-xl p-5 border border-red-900/50 mb-6">
                    <h2 className="text-red-400 font-bold tracking-wider text-xs uppercase mb-4 Regal-center text-center sm:text-left">⚡ Automatización de Llaves Eliminatorias</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <button onClick={() => ejecutarBotonLlave(calcularYGenerar16avos, "Generar 16avos (Matemática de Grupos)")} className="bg-emerald-700 hover:bg-emerald-600 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Sáb Noche: 16avos</button>
                        <button onClick={() => ejecutarBotonLlave(generarOctavos, "Octavos de Final")} className="bg-blue-700 hover:bg-blue-600 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Octavos</button>
                        <button onClick={() => ejecutarBotonLlave(generarCuartos, "Cuartos de Final")} className="bg-purple-700 hover:bg-purple-600 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Cuartos</button>
                        <button onClick={() => ejecutarBotonLlave(generarSemis, "Semifinales")} className="bg-pink-700 hover:bg-pink-600 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Semifinal</button>
                        <button onClick={() => ejecutarBotonLlave(generarFinal, "La Gran Final")} className="bg-amber-600 hover:bg-amber-500 text-white font-black p-3 rounded-lg text-[10px] uppercase tracking-wider transition-all">Gran Final</button>
                    </div>
                </div>

                {/* ========================================== */}
                {/* 🎛️ PESTAÑAS DE CONTROL DE FASE EN ADMIN     */}
                {/* ========================================== */}
                <div className="bg-gray-800 p-1.5 rounded-xl border border-gray-700 flex flex-col sm:flex-row gap-1.5 mb-6">
                    <button
                        onClick={() => setTabFase("fase_final")}
                        className={`flex-1 py-3 px-2 md:px-4 rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-wider text-center transition-all ${tabFase === "fase_final"
                            ? "bg-purple-600 text-white shadow-md font-black"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        🏆 Cuartos a Final
                    </button>
                    <button
                        onClick={() => setTabFase("octavos_16avos")}
                        className={`flex-1 py-3 px-2 md:px-4 rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-wider text-center transition-all ${tabFase === "octavos_16avos"
                            ? "bg-amber-500 text-white shadow-md font-black"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        ⚡ 16avos y Octavos
                    </button>
                    <button
                        onClick={() => setTabFase("grupos")}
                        className={`flex-1 py-3 px-2 md:px-4 rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-wider text-center transition-all ${tabFase === "grupos"
                            ? "bg-blue-600 text-white shadow-md font-black"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        ⚽ Fase de Grupos
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                    <button onClick={async () => { if (confirm("¿Cargar el calendario base?")) await sembrarCalendario(); }} className="text-[10px] font-bold text-gray-600 hover:text-gray-400 bg-transparent py-1 px-3 rounded uppercase">Reiniciar Calendario Grupos</button>
                </div>

                <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tight text-center sm:text-left">
                    {tabFase === "fase_final" ? "🚩 Cuartos, Semis y Final" : tabFase === "octavos_16avos" ? "⚡ 16avos y Octavos" : "📚 Historial de Grupos"}
                </h2>

                {cargando ? (
                    <p className="text-center text-white font-semibold animate-pulse">Cargando marcadores del torneo...</p>
                ) : (
                    <div className="space-y-4">
                        {partidosFiltrados.map((partido) => {
                            const esEliminatorio = (partido.jornada || 1) >= 4;
                            let nombreEtiqueta = `Jornada ${partido.jornada}`;
                            if (partido.jornada === 4) nombreEtiqueta = "16avos de Final";
                            if (partido.jornada === 5) nombreEtiqueta = "Octavos de Final";
                            if (partido.jornada === 6) nombreEtiqueta = "Cuartos de Final";
                            if (partido.jornada === 7) nombreEtiqueta = "Semifinal";
                            if (partido.jornada === 8) nombreEtiqueta = "La Gran Final";

                            return (
                                <div key={partido.id} className={`bg-gray-800 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between border-l-4 ${esEliminatorio ? 'border-amber-400' : 'border-blue-600'}`}>
                                    <div className="text-white font-bold text-lg flex-1 text-center md:text-right">{partido.equipo_local}</div>

                                    <div className="flex-1 flex flex-col items-center justify-center px-4 my-4 md:my-0">
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-2 px-2 py-0.5 rounded ${esEliminatorio ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {nombreEtiqueta}
                                        </span>
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
                                                <span className="text-[10px] text-gray-500 font-bold mb-2">{partido.fecha_hora}</span>
                                                <div className="flex gap-2 items-center">
                                                    <input type="number" min="0" placeholder="0" onChange={(e) => manejarCambio(partido.id, "local", e.target.value)} className="w-12 h-10 text-center bg-gray-700 text-white border border-gray-600 rounded text-lg font-bold" />
                                                    <span className="text-gray-500 font-bold text-xs">VS</span>
                                                    <input type="number" min="0" placeholder="0" onChange={(e) => manejarCambio(partido.id, "visitante", e.target.value)} className="w-12 h-10 text-center bg-gray-700 text-white border border-gray-600 rounded text-lg font-bold" />
                                                </div>

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

                        {partidosFiltrados.length === 0 && (
                            <p className="text-center text-gray-400 italic py-10 bg-gray-800 rounded-xl border border-gray-700">
                                No hay partidos registrados para esta fase del torneo.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}