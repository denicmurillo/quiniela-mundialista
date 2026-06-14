"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../../lib/firebase";

export default function Especiales() {
    const [usuario, setUsuario] = useState<User | null>(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Campos de predicciones especiales
    const [campeon, setCampeon] = useState("");
    const [goleador, setGoleador] = useState("");
    const [mvp, setMvp] = useState("");

    // Estados para el Modal de "Ver todos"
    const [modalAbierto, setModalAbierto] = useState(false);
    const [cargandoPronosticos, setCargandoPronosticos] = useState(false);
    const [pronosticosGlobales, setPronosticosGlobales] = useState<any[]>([]);

    // ⏳ LÓGICA DE FECHA LÍMITE (17 de Junio de 2026 a las 23:59 Hora de Costa Rica/Centroamérica)
    const fechaLimite = new Date("2026-06-17T23:59:59-06:00");
    const ahora = new Date();
    const estaCerrado = ahora > fechaLimite;

    useEffect(() => {
        const cancelarSuscripcion = onAuthStateChanged(auth, (user) => {
            setUsuario(user);
            if (user) {
                cargarEspecialesUsuario(user.uid);
            } else {
                setCargando(false);
            }
        });
        return () => cancelarSuscripcion();
    }, []);

    const cargarEspecialesUsuario = async (uid: string) => {
        try {
            const docRef = doc(db, "predicciones_especiales", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCampeon(data.campeon || "");
                setGoleador(data.goles || "");
                setMvp(data.mvp || "");
            }
        } catch (error) {
            console.error("Error al cargar especiales:", error);
        } finally {
            setCargando(false);
        }
    };

    const guardarEspeciales = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuario) { alert("⚠️ Inicia sesión para guardar tus predicciones."); return; }
        if (estaCerrado) { alert("⛔ Las predicciones al podio ya están cerradas."); return; }

        setGuardando(true);

        try {
            await setDoc(doc(db, "predicciones_especiales", usuario.uid), {
                usuario_id: usuario.uid,
                email: usuario.email,
                campeon: campeon.trim(),
                goles: goleador.trim(),
                mvp: mvp.trim(),
                fecha_registro: new Date()
            }, { merge: true });
            alert("¡Tus pronósticos especiales se guardaron con éxito! 🏆");
        } catch (error) {
            console.error(error);
            alert("Hubo un error al guardar los datos.");
        } finally {
            setGuardando(false);
        }
    };

    // FUNCIÓN PARA CARGAR LOS PRONÓSTICOS DE TODOS UNA VEZ CERRADO
    const abrirModalPronosticos = async () => {
        setModalAbierto(true);
        setCargandoPronosticos(true);
        try {
            // 1. Traemos los nombres de los usuarios
            const snapUsuarios = await getDocs(collection(db, "usuarios"));
            const mapaNombres: Record<string, string> = {};
            snapUsuarios.forEach(doc => {
                mapaNombres[doc.id] = doc.data().nombre || "Anónimo";
            });

            // 2. Traemos las predicciones especiales
            const snapPred = await getDocs(collection(db, "predicciones_especiales"));
            const lista = snapPred.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    nombre: mapaNombres[data.usuario_id] || "Anónimo",
                    campeon: data.campeon || "-",
                    goleador: data.goles || "-",
                    mvp: data.mvp || "-"
                };
            });

            // Ordenamos alfabéticamente
            lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setPronosticosGlobales(lista);
        } catch (error) {
            console.error("Error al cargar pronósticos globales:", error);
        } finally {
            setCargandoPronosticos(false);
        }
    };

    if (cargando) return <p className="text-center py-10 font-semibold text-gray-500 animate-pulse">Cargando el podio de expertos...</p>;

    return (
        <main className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-blue-900">
                <div className="text-center mb-6">
                    <span className="text-4xl">⭐</span>
                    <h1 className="text-2xl md:text-3xl font-black text-blue-900 mt-2">PREDICCIONES MAESTRAS</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Pronostica los premios mayores del Mundial 2026</p>
                </div>

                {/* 📢 BANNER INFORMATIVO DE FECHA LÍMITE */}
                <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${estaCerrado ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    <span className="text-2xl">{estaCerrado ? '🔒' : '⏳'}</span>
                    <div className="flex-1">
                        <h4 className={`font-bold ${estaCerrado ? 'text-red-800' : 'text-blue-900'} text-sm uppercase tracking-wide`}>
                            {estaCerrado ? "Pronósticos Cerrados" : "Cierre de Predicciones"}
                        </h4>
                        {estaCerrado ? (
                            <p className="text-xs mt-1 text-red-700">
                                La fecha límite ha pasado. Ya no es posible modificar las predicciones al podio.
                            </p>
                        ) : (
                            <>
                                <p className="text-xs mt-1 text-blue-800">
                                    Tienes hasta el Miércoles 17 de Junio para ingresar o modificar tus predicciones.
                                </p>
                                <p className="text-xs mt-2 font-black text-blue-900 uppercase tracking-wide">
                                    ¡Asegúralas antes de que termine la JORNADA I!
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {!usuario ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-center font-semibold text-sm shadow-sm">
                        ⚠️ Debes registrarte o iniciar sesión para poder bloquear tus pronósticos especiales.
                    </div>
                ) : (
                    <form onSubmit={guardarEspeciales} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">🏆 ¿Quién será el Campeón del Mundo?</label>
                            <input
                                type="text" required value={campeon} onChange={(e) => setCampeon(e.target.value)} disabled={estaCerrado}
                                className={`w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-800 bg-gray-50 outline-none focus:border-blue-500 text-center transition-colors ${estaCerrado ? 'opacity-60 cursor-not-allowed' : ''}`}
                                placeholder="Ej: Argentina, Brasil, Francia..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">⚽ Bota de Oro (Máximo Goleador)</label>
                            <input
                                type="text" required value={goleador} onChange={(e) => setGoleador(e.target.value)} disabled={estaCerrado}
                                className={`w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-800 bg-gray-50 outline-none focus:border-blue-500 text-center transition-colors ${estaCerrado ? 'opacity-60 cursor-not-allowed' : ''}`}
                                placeholder="Ej: Mbappé, Haaland, Vinicius..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">🎖️ Balón de Oro (MVP del Torneo)</label>
                            <input
                                type="text" required value={mvp} onChange={(e) => setMvp(e.target.value)} disabled={estaCerrado}
                                className={`w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-800 bg-gray-50 outline-none focus:border-blue-500 text-center transition-colors ${estaCerrado ? 'opacity-60 cursor-not-allowed' : ''}`}
                                placeholder="Ej: Bellingham, Musiala, Lamine Yamal..."
                            />
                        </div>

                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium text-center italic shadow-inner">
                            Nota: Estos pronósticos otorgan puntaje masivo de bonificación al terminar la gran final. ¡Elige con sabiduría!
                        </div>

                        <button
                            type="submit" disabled={guardando || estaCerrado}
                            className={`w-full text-white font-bold py-3.5 rounded-xl shadow-md transition-all uppercase tracking-wider ${estaCerrado
                                ? 'bg-gray-400 cursor-not-allowed hidden' // Ocultamos el botón de guardar si está cerrado
                                : 'bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600'
                                }`}
                        >
                            {guardando ? "Asegurando..." : "Bloquear Mis Apuestas"}
                        </button>

                        {/* BOTÓN PARA VER A LOS DEMÁS (SOLO VISIBLE CUANDO SE CIERRAN LOS PRONÓSTICOS) */}
                        {estaCerrado && (
                            <button
                                type="button"
                                onClick={abrirModalPronosticos}
                                className="w-full mt-2 text-sm font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 py-3.5 rounded-xl border-2 border-blue-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                👁️ Ver predicciones de todos
                            </button>
                        )}
                    </form>
                )}
            </div>

            {/* ========================================== */}
            {/* MODAL DE PRONÓSTICOS GLOBALES ESPECIALES   */}
            {/* ========================================== */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Header del Modal */}
                        <div className="bg-blue-900 p-4 text-white flex justify-between items-center sticky top-0">
                            <div>
                                <h3 className="font-black text-lg tracking-tight">Pronósticos del Grupo</h3>
                                <p className="text-xs text-blue-200">Premios Mayores del Torneo</p>
                            </div>
                            <button onClick={() => setModalAbierto(false)} className="text-blue-200 hover:text-white text-3xl font-bold px-2 leading-none">&times;</button>
                        </div>

                        {/* Cuerpo del Modal */}
                        <div className="p-4 overflow-y-auto bg-gray-100 flex-1">
                            {cargandoPronosticos ? (
                                <p className="text-center text-gray-500 py-8 animate-pulse font-medium">Buscando en los registros...</p>
                            ) : pronosticosGlobales.length === 0 ? (
                                <p className="text-center text-gray-400 py-8 italic">Aún no hay predicciones maestras registradas.</p>
                            ) : (
                                <div className="space-y-4">
                                    {pronosticosGlobales.map((p) => (
                                        <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                                            <span className="font-black text-blue-900 text-lg border-b border-gray-100 pb-2">{p.nombre}</span>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    <span className="text-gray-500 text-[10px] block uppercase font-bold tracking-wider">🏆 Campeón</span>
                                                    <span className="font-bold text-gray-800">{p.campeon}</span>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    <span className="text-gray-500 text-[10px] block uppercase font-bold tracking-wider">⚽ Goleador</span>
                                                    <span className="font-bold text-gray-800">{p.goleador}</span>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    <span className="text-gray-500 text-[10px] block uppercase font-bold tracking-wider">🎖️ MVP</span>
                                                    <span className="font-bold text-gray-800">{p.mvp}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}