"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { db, auth } from "../../lib/firebase";
import { procesarPuntosDePrediccion } from "../../lib/motorPuntos";

// Agregamos los goles reales a la interfaz
interface Partido {
    id: string;
    equipo_local: string;
    equipo_visitante: string;
    estado_partido: string;
    goles_local?: number;
    goles_visitante?: number;
}

export default function PanelAdmin() {
    const CORREO_ADMIN = "denicmurillo@gmail.com";

    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [cargando, setCargando] = useState(true);
    const [resultados, setResultados] = useState<Record<string, { local: string, visitante: string }>>({});

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

    const manejarCambio = (partidoId: string, tipo: "local" | "visitante", valor: string) => {
        setResultados(prev => ({ ...prev, [partidoId]: { ...prev[partidoId], [tipo]: valor } }));
    };

    const finalizarPartido = async (partidoId: string) => {
        const res = resultados[partidoId];
        if (!res || res.local === "" || res.visitante === "") {
            alert("⚠️ Ingresa ambos marcadores reales para finalizar el partido.");
            return;
        }

        const realLocal = parseInt(res.local);
        const realVisitante = parseInt(res.visitante);

        if (!confirm(`¿Seguro que quieres finalizar este partido con el resultado ${realLocal} - ${realVisitante}?`)) return;

        try {
            const partidoRef = doc(db, "partidos", partidoId);
            await updateDoc(partidoRef, { estado_partido: "finalizado", goles_local: realLocal, goles_visitante: realVisitante });

            const prediccionesRef = collection(db, "predicciones");
            const q = query(prediccionesRef, where("partido_id", "==", partidoId));
            const prediccionesSnapshot = await getDocs(q);

            let prediccionesProcesadas = 0;
            for (const documento of prediccionesSnapshot.docs) {
                const data = documento.data();
                await procesarPuntosDePrediccion(documento.id, data.usuario_id, data.pronostico_local, data.pronostico_visitante, realLocal, realVisitante);
                prediccionesProcesadas++;
            }

            alert(`✅ Partido finalizado. Se repartieron puntos a ${prediccionesProcesadas} participantes.`);
            window.location.reload();
        } catch (error) {
            console.error("Error al finalizar partido:", error);
            alert("Hubo un error al procesar los resultados.");
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
        <main className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-red-500 mb-2">⚙️ Panel de Control</h1>
                <p className="text-center text-gray-400 mb-8 text-sm">Autenticado como administrador VIP</p>

                {cargando ? (
                    <p className="text-center text-white">Cargando sistema...</p>
                ) : (
                    <div className="space-y-4">
                        {partidos.map((partido) => (
                            <div key={partido.id} className="bg-gray-800 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between border-l-4 border-red-600">
                                <div className="text-white font-bold text-xl flex-1 text-center md:text-right">{partido.equipo_local}</div>

                                <div className="flex-1 flex flex-col items-center justify-center px-4 my-4 md:my-0">
                                    {/* LÓGICA VISUAL: Finalizado vs Pendiente */}
                                    {partido.estado_partido === "finalizado" ? (
                                        <div className="flex flex-col items-center">
                                            <div className="flex gap-4 items-center text-3xl font-black text-white mb-2">
                                                <span>{partido.goles_local ?? 0}</span>
                                                <span className="text-gray-500">-</span>
                                                <span>{partido.goles_visitante ?? 0}</span>
                                            </div>
                                            <span className="text-green-500 font-bold bg-green-900/30 px-3 py-1 rounded">Ya procesado</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-2 items-center mb-3">
                                                <input type="number" min="0" placeholder="0" onChange={(e) => manejarCambio(partido.id, "local", e.target.value)} className="w-14 h-12 text-center bg-gray-700 text-white border border-gray-600 rounded focus:border-red-500 outline-none text-xl" />
                                                <span className="text-gray-400 font-bold mx-2">VS</span>
                                                <input type="number" min="0" placeholder="0" onChange={(e) => manejarCambio(partido.id, "visitante", e.target.value)} className="w-14 h-12 text-center bg-gray-700 text-white border border-gray-600 rounded focus:border-red-500 outline-none text-xl" />
                                            </div>
                                            <button onClick={() => finalizarPartido(partido.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors">Finalizar y Repartir Puntos</button>
                                        </>
                                    )}
                                </div>

                                <div className="text-white font-bold text-xl flex-1 text-center md:text-left">{partido.equipo_visitante}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}