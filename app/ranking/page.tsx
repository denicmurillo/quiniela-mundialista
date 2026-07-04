"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface Jugador {
    uid: string;
    nombre: string;
    email: string;
    puntaje_total: number;
    puntaje_j1?: number;
    puntaje_j2?: number;
    puntaje_j3?: number;
    puntaje_elim?: number;
}

export default function Ranking() {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [cargando, setCargando] = useState(true);
    const [filtroActivo, setFiltroActiva] = useState<string>("global");

    // ESTADOS PARA EL MODAL DE ESTADÍSTICAS
    const [modalEstadisticasAbierto, setModalEstadisticasAbierto] = useState(false);
    const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Jugador | null>(null);
    const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
    const [estadisticas, setEstadisticas] = useState({ exactos: 0, tendencias: 0, fallos: 0, total: 0, racha: [] as number[] });

    useEffect(() => {
        const cargarRanking = async () => {
            try {
                // Traemos a todos los usuarios
                const querySnapshot = await getDocs(collection(db, "usuarios"));
                const listaJugadores: Jugador[] = [];

                querySnapshot.forEach((doc) => {
                    listaJugadores.push(doc.data() as Jugador);
                });

                setJugadores(listaJugadores);
            } catch (error) {
                console.error("Error al cargar el ranking:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarRanking();
    }, []);

    // Función mágica que ordena en tiempo real dependiendo de la pestaña
    const jugadoresOrdenados = [...jugadores].sort((a, b) => {
        const getPuntos = (j: Jugador) => {
            if (filtroActivo === "global") return j.puntaje_total || 0;
            if (filtroActivo === "j1") return j.puntaje_j1 || 0;
            if (filtroActivo === "j2") return j.puntaje_j2 || 0;
            if (filtroActivo === "j3") return j.puntaje_j3 || 0;
            if (filtroActivo === "elim") return j.puntaje_elim || 0;
            return 0;
        };
        return getPuntos(b) - getPuntos(a);
    });

    const obtenerMedalla = (posicion: number) => {
        switch (posicion) {
            case 0: return "🥇";
            case 1: return "🥈";
            case 2: return "🥉";
            default: return `${posicion + 1}`;
        }
    };

    // 🧠 FUNCIÓN MAESTRA: Calcula las estadísticas reales del usuario
    const abrirModalEstadisticas = async (jugador: Jugador) => {
        setJugadorSeleccionado(jugador);
        setModalEstadisticasAbierto(true);
        setCargandoEstadisticas(true);

        try {
            // 1. Traemos TODOS los partidos finalizados para saber cuántos juegos reales han pasado
            const qPartidos = query(collection(db, "partidos"), where("estado_partido", "==", "finalizado"));
            const snapPartidos = await getDocs(qPartidos);

            const partidosFinalizados = snapPartidos.docs.map(d => {
                const data = d.data();
                let ms = 0;
                if (data.fecha_original?.toDate) ms = data.fecha_original.toDate().getTime();
                else if (data.fecha_original?.seconds) ms = data.fecha_original.seconds * 1000;
                else if (typeof data.fecha_original === 'string') ms = new Date(data.fecha_original).getTime();
                return { id: d.id, tiempo: ms };
            }).sort((a, b) => a.tiempo - b.tiempo); // Orden cronológico (del más viejo al más reciente)

            // 2. Traemos las predicciones del usuario
            const qPred = query(collection(db, "predicciones"), where("usuario_id", "==", jugador.uid));
            const snapPred = await getDocs(qPred);

            const prediccionesMap: Record<string, number> = {};
            snapPred.forEach(d => {
                const data = d.data();
                if (data.puntos_ganados !== undefined) {
                    prediccionesMap[data.partido_id] = data.puntos_ganados;
                }
            });

            // 3. Cruzamos los datos (Si no pronosticó un partido que ya pasó, es un Fallo)
            let exactos = 0, tendencias = 0, fallos = 0;
            const historialPuntos: number[] = [];

            partidosFinalizados.forEach(partido => {
                const puntos = prediccionesMap[partido.id] ?? 0; // 0 por defecto si olvidó jugar
                if (puntos === 3) exactos++;
                else if (puntos === 1) tendencias++;
                else fallos++;

                historialPuntos.push(puntos);
            });

            // 4. Extraemos los últimos 5 partidos jugados para la "Racha"
            const ultimas5 = historialPuntos.slice(-5);

            setEstadisticas({
                exactos,
                tendencias,
                fallos,
                total: partidosFinalizados.length,
                racha: ultimas5
            });

        } catch (error) {
            console.error("Error calculando estadísticas:", error);
        } finally {
            setCargandoEstadisticas(false);
        }
    };

    const calcularPorcentaje = (valor: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((valor / total) * 100);
    };

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-black text-center text-blue-900 mb-1">
                    TABLA DE POSICIONES
                </h1>
                <p className="text-center text-gray-500 font-semibold mb-6 text-sm uppercase tracking-wider">
                    ¿Quién se coronará campeón del torneo?
                </p>

                {/* BOTONERA DE FILTROS INTERNOS */}
                <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 grid grid-cols-2 sm:grid-cols-5 gap-1 mb-6">
                    {[
                        { id: "global", etiqueta: "Global" },
                        { id: "j1", etiqueta: "Jornada I" },
                        { id: "j2", etiqueta: "Jornada II" },
                        { id: "j3", etiqueta: "Jornada III" },
                        { id: "elim", etiqueta: "Eliminatorias" }
                    ].map((filtro) => (
                        <button
                            key={filtro.id}
                            onClick={() => setFiltroActiva(filtro.id)}
                            className={`py-2.5 px-2 rounded-lg font-bold text-xs uppercase tracking-wider text-center transition-all ${filtroActivo === filtro.id
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                        >
                            {filtro.etiqueta}
                        </button>
                    ))}
                </div>

                {cargando ? (
                    <div className="flex justify-center my-12">
                        <p className="text-gray-500 font-semibold animate-pulse text-lg">
                            Calculando posiciones en el marcador...
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-blue-900 text-white flex px-4 md:px-6 py-4 font-bold text-[10px] md:text-xs uppercase tracking-wider">
                            <div className="w-12 md:w-16 text-center">Pos</div>
                            <div className="flex-1">Jugador</div>
                            <div className="w-16 md:w-24 text-center">Puntos</div>
                            <div className="w-12 text-center">Stats</div> {/* Nueva columna */}
                        </div>

                        <div className="divide-y divide-gray-100">
                            {jugadoresOrdenados.map((jugador, index) => {
                                // Calculamos qué número mostrar según el filtro
                                let puntosAMostrar = 0;
                                if (filtroActivo === "global") puntosAMostrar = jugador.puntaje_total || 0;
                                if (filtroActivo === "j1") puntosAMostrar = jugador.puntaje_j1 || 0;
                                if (filtroActivo === "j2") puntosAMostrar = jugador.puntaje_j2 || 0;
                                if (filtroActivo === "j3") puntosAMostrar = jugador.puntaje_j3 || 0;
                                if (filtroActivo === "elim") puntosAMostrar = jugador.puntaje_elim || 0;

                                return (
                                    <div
                                        key={jugador.uid}
                                        className={`flex px-4 md:px-6 py-3 items-center transition-colors hover:bg-blue-50 ${index === 0 && puntosAMostrar > 0 ? 'bg-yellow-50/40' : 'bg-white'}`}
                                    >
                                        <div className={`w-12 md:w-16 text-center font-bold text-xl ${index < 3 ? 'text-2xl' : 'text-gray-400'}`}>
                                            {obtenerMedalla(index)}
                                        </div>

                                        <div className="flex-1 font-bold text-gray-800 text-sm md:text-lg truncate pr-2">
                                            {jugador.nombre}
                                            {index === 0 && puntosAMostrar > 0 && <span className="ml-2 text-[9px] md:text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Líder</span>}
                                        </div>

                                        <div className="w-16 md:w-24 text-center font-black text-xl md:text-2xl text-blue-600">
                                            {puntosAMostrar}
                                        </div>

                                        {/* BOTÓN DE ESTADÍSTICAS */}
                                        <div className="w-12 text-center flex justify-center">
                                            <button
                                                onClick={() => abrirModalEstadisticas(jugador)}
                                                className="bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm border border-gray-200"
                                                title="Ver Estadísticas"
                                            >
                                                📊
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {jugadoresOrdenados.length === 0 && (
                                <div className="p-8 text-center text-gray-500 italic">
                                    Aún no hay técnicos registrados en la competencia.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================== */}
            {/* MODAL DE ESTADÍSTICAS DEL JUGADOR          */}
            {/* ========================================== */}
            {modalEstadisticasAbierto && jugadorSeleccionado && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
                    onClick={() => setModalEstadisticasAbierto(false)} // Cierra al tocar el fondo oscuro
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()} // Evita que se cierre al tocar lo blanco del modal
                    >

                        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-5 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-black text-xl tracking-tight uppercase">Radiografía del DT</h3>
                                <p className="text-sm text-blue-200 font-medium truncate max-w-[250px]">{jugadorSeleccionado.nombre}</p>
                            </div>
                            <button onClick={() => setModalEstadisticasAbierto(false)} className="text-blue-200 hover:text-white text-3xl font-bold px-2 relative z-10 leading-none">&times;</button>
                            <span className="absolute -right-4 -bottom-4 text-7xl opacity-10">📊</span>
                        </div>

                        <div className="p-6 bg-gray-50 flex-1 space-y-6">
                            {cargandoEstadisticas ? (
                                <div className="py-10 text-center space-y-3">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-gray-500 font-semibold animate-pulse text-sm">Calculando rendimiento...</p>
                                </div>
                            ) : estadisticas.total === 0 ? (
                                <p className="text-center text-gray-400 py-8 italic font-medium">Aún no hay partidos finalizados para evaluar a este técnico.</p>
                            ) : (
                                <>
                                    {/* GRID DE ACIERTOS */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Aciertos Exactos */}
                                        <div className="bg-white border border-green-200 rounded-2xl p-3 text-center shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                                            <span className="text-2xl block mb-1">🎯</span>
                                            <span className="font-black text-xl text-gray-800 block leading-none">{estadisticas.exactos}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 block mt-1">Plenos (3 pts)</span>
                                            <span className="text-xs text-gray-400 font-bold mt-1 block">{calcularPorcentaje(estadisticas.exactos, estadisticas.total)}%</span>
                                        </div>

                                        {/* Tendencias */}
                                        <div className="bg-white border border-blue-200 rounded-2xl p-3 text-center shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                                            <span className="text-2xl block mb-1">📈</span>
                                            <span className="font-black text-xl text-gray-800 block leading-none">{estadisticas.tendencias}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 block mt-1">Tendencia (1 pt)</span>
                                            <span className="text-xs text-gray-400 font-bold mt-1 block">{calcularPorcentaje(estadisticas.tendencias, estadisticas.total)}%</span>
                                        </div>

                                        {/* Fallos */}
                                        <div className="bg-white border border-red-200 rounded-2xl p-3 text-center shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                                            <span className="text-2xl block mb-1">❌</span>
                                            <span className="font-black text-xl text-gray-800 block leading-none">{estadisticas.fallos}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 block mt-1">Fallos (0 pts)</span>
                                            <span className="text-xs text-gray-400 font-bold mt-1 block">{calcularPorcentaje(estadisticas.fallos, estadisticas.total)}%</span>
                                        </div>
                                    </div>

                                    <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                        Basado en {estadisticas.total} partidos jugados
                                    </div>

                                    {/* RACHA ACTUAL */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3 text-center">🔥 Racha Actual (Últimos 5)</h4>

                                        <div className="flex justify-center items-center gap-2">
                                            {estadisticas.racha.map((pts, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full font-black text-white shadow-inner text-sm md:text-base transition-transform hover:scale-110
                                                        ${pts === 3 ? 'bg-green-500' : pts === 1 ? 'bg-blue-500' : 'bg-red-400'}`}
                                                    title={`${pts} Puntos`}
                                                >
                                                    {pts > 0 ? `+${pts}` : '0'}
                                                </div>
                                            ))}
                                            {/* Si la racha tiene menos de 5 partidos, rellenamos con espacios vacíos */}
                                            {Array.from({ length: Math.max(0, 5 - estadisticas.racha.length) }).map((_, i) => (
                                                <div key={`empty-${i}`} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center opacity-50">
                                                    <span className="text-gray-300 text-xs">-</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-center text-[9px] text-gray-400 mt-3 uppercase tracking-wider">Más antiguo ⬅️ <span className="mx-2"></span> ➡️ Más reciente</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}