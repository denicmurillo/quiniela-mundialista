"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

// Definimos la estructura de nuestro jugador
interface Jugador {
    uid: string;
    nombre: string;
    email: string;
    puntaje_total: number;
}

export default function Ranking() {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarRanking = async () => {
            try {
                // TRUCO DE INGENIERO: Le pedimos a Firebase que ya nos traiga los datos ordenados
                const rankingQuery = query(
                    collection(db, "usuarios"),
                    orderBy("puntaje_total", "desc") // "desc" = de mayor a menor
                );

                const querySnapshot = await getDocs(rankingQuery);
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

    // Función para dar una medalla a los primeros 3 lugares
    const obtenerMedalla = (posicion: number) => {
        switch (posicion) {
            case 0: return "🥇";
            case 1: return "🥈";
            case 2: return "🥉";
            default: return `${posicion + 1}`;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-blue-900 mb-2">
                    Tabla de Posiciones
                </h1>
                <p className="text-center text-gray-600 mb-8 font-medium">
                    ¿Quién será el campeón de la quiniela?
                </p>

                {cargando ? (
                    <div className="flex justify-center my-12">
                        <p className="text-gray-500 font-semibold animate-pulse text-lg">
                            Calculando posiciones...
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Encabezado de la tabla */}
                        <div className="bg-blue-900 text-white flex px-6 py-4 font-bold text-sm uppercase tracking-wider">
                            <div className="w-16 text-center">Pos</div>
                            <div className="flex-1">Jugador</div>
                            <div className="w-24 text-center">Puntos</div>
                        </div>

                        {/* Lista de Jugadores */}
                        <div className="divide-y divide-gray-100">
                            {jugadores.map((jugador, index) => (
                                <div
                                    key={jugador.uid}
                                    className={`flex px-6 py-4 items-center transition-colors hover:bg-blue-50 ${index < 3 ? 'bg-yellow-50/30' : 'bg-white'}`}
                                >
                                    {/* Posición / Medalla */}
                                    <div className={`w-16 text-center font-bold text-xl ${index < 3 ? 'text-2xl' : 'text-gray-500'}`}>
                                        {obtenerMedalla(index)}
                                    </div>

                                    {/* Nombre del Jugador */}
                                    <div className="flex-1 font-semibold text-gray-800 text-lg">
                                        {jugador.nombre}
                                        {index === 0 && <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">Líder</span>}
                                    </div>

                                    {/* Puntaje */}
                                    <div className="w-24 text-center font-black text-2xl text-blue-600">
                                        {jugador.puntaje_total}
                                    </div>
                                </div>
                            ))}

                            {jugadores.length === 0 && (
                                <div className="p-8 text-center text-gray-500 italic">
                                    Aún no hay jugadores registrados.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}