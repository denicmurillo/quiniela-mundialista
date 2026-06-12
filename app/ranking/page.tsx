"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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

    useEffect(() => {
        const cargarRanking = async () => {
            try {
                // Traemos a todos los usuarios sin ordenarlos todavía
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
                        <div className="bg-blue-900 text-white flex px-6 py-4 font-bold text-xs uppercase tracking-wider">
                            <div className="w-16 text-center">Pos</div>
                            <div className="flex-1">Jugador</div>
                            <div className="w-24 text-center">Puntos ({filtroActivo === 'global' ? 'Total' : 'Filtro'})</div>
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
                                        className={`flex px-6 py-4 items-center transition-colors hover:bg-blue-50 ${index === 0 && puntosAMostrar > 0 ? 'bg-yellow-50/40' : 'bg-white'}`}
                                    >
                                        <div className={`w-16 text-center font-bold text-xl ${index < 3 ? 'text-2xl' : 'text-gray-400'}`}>
                                            {obtenerMedalla(index)}
                                        </div>

                                        <div className="flex-1 font-bold text-gray-800 text-base md:text-lg">
                                            {jugador.nombre}
                                            {index === 0 && puntosAMostrar > 0 && <span className="ml-2 text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Líder</span>}
                                        </div>

                                        <div className="w-24 text-center font-black text-2xl text-blue-600">
                                            {puntosAMostrar}
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
        </main>
    );
}