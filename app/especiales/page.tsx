"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../../lib/firebase";

// 🧠 MOTOR DE COINCIDENCIA (Copia exacta del Backend para el Frontend)
const limpiarTexto = (texto: string) => {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const esCoincidencia = (oficial: string, usuario: string) => {
    const strOficial = limpiarTexto(oficial);
    const strUser = limpiarTexto(usuario);
    if (strUser === "") return false;
    if (strOficial === strUser) return true;
    if (strUser.length >= 4 && strOficial.includes(strUser)) return true;
    if (strOficial.length >= 4 && strUser.includes(strOficial)) return true;
    return false;
};

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
    const [resultadosOficiales, setResultadosOficiales] = useState<any>(null); // 🔥 Nuevo estado

    // ⏳ LÓGICA DE FECHA LÍMITE
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

    const abrirModalPronosticos = async () => {
        setModalAbierto(true);
        setCargandoPronosticos(true);
        try {
            // 1. Traer los RESULTADOS OFICIALES (Si el admin ya los procesó)
            const adminDoc = await getDoc(doc(db, "admin", "resultadosEspeciales"));
            let oficiales = null;
            if (adminDoc.exists() && adminDoc.data().procesado) {
                oficiales = adminDoc.data();
                setResultadosOficiales(oficiales);
            }

            // 2. Traer los nombres de los usuarios
            const snapUsuarios = await getDocs(collection(db, "usuarios"));
            const mapaNombres: Record<string, string> = {};
            snapUsuarios.forEach(doc => {
                mapaNombres[doc.id] = doc.data().nombre || "Anónimo";
            });

            // 3. Traer las predicciones especiales y EVALUARLAS en vivo
            const snapPred = await getDocs(collection(db, "predicciones_especiales"));
            const lista = snapPred.docs.map(doc => {
                const data = doc.data();

                // Evaluamos aciertos si existen resultados oficiales
                let ptsCampeon = 0, ptsGoleador = 0, ptsMvp = 0;
                if (oficiales) {
                    if (esCoincidencia(oficiales.campeon, data.campeon || "")) ptsCampeon = 3;
                    if (esCoincidencia(oficiales.goles, data.goles || "")) ptsGoleador = 3;
                    if (esCoincidencia(oficiales.mvp, data.mvp || "")) ptsMvp = 3;
                }

                return {
                    id: doc.id,
                    nombre: mapaNombres[data.usuario_id] || "Anónimo",
                    campeon: data.campeon || "-",
                    goleador: data.goles || "-",
                    mvp: data.mvp || "-",
                    ptsCampeon,
                    ptsGoleador,
                    ptsMvp,
                    totalPts: ptsCampeon + ptsGoleador + ptsMvp
                };
            });

            // 4. Ordenar: Primero por puntos obtenidos (Mayor a menor), luego alfabéticamente
            lista.sort((a, b) => b.totalPts - a.totalPts || a.nombre.localeCompare(b.nombre));

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
                            <p className="text-xs mt-1 text-blue-800">
                                Tienes hasta el Miércoles 17 de Junio para ingresar o modificar tus predicciones.
                            </p>
                        )}
                    </div>
                </div>

                {!usuario ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-center font-semibold text-sm shadow-sm">
                        ⚠️ Debes registrarte o iniciar sesión para poder bloquear tus pronósticos especiales.
                    </div>
                ) : (
                    <form onSubmit={guardarEspeciales} className="space-y-5">
                        {/* INPUTS DEL FORMULARIO (Se mantienen igual) */}
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

                        <button
                            type="submit" disabled={guardando || estaCerrado}
                            className={`w-full text-white font-bold py-3.5 rounded-xl shadow-md transition-all uppercase tracking-wider ${estaCerrado
                                ? 'hidden'
                                : 'bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600'
                                }`}
                        >
                            {guardando ? "Asegurando..." : "Bloquear Mis Apuestas"}
                        </button>

                        {estaCerrado && (
                            <button
                                type="button"
                                onClick={abrirModalPronosticos}
                                className="w-full mt-2 text-sm font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 py-3.5 rounded-xl border-2 border-blue-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                👁️ Ranking de Premios Especiales
                            </button>
                        )}
                    </form>
                )}
            </div>

            {/* ========================================== */}
            {/* MODAL INTELIGENTE DE PRONÓSTICOS           */}
            {/* ========================================== */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        <div className="bg-blue-900 p-4 text-white flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="font-black text-lg tracking-tight">Ranking Especial</h3>
                                <p className="text-xs text-blue-200">Comparativa de Predicciones del Grupo</p>
                            </div>
                            <button onClick={() => setModalAbierto(false)} className="text-blue-200 hover:text-white text-3xl font-bold px-2 leading-none">&times;</button>
                        </div>

                        <div className="p-4 overflow-y-auto bg-gray-100 flex-1">
                            {/* 🔥 BANNER DE RESULTADOS OFICIALES */}
                            {resultadosOficiales && (
                                <div className="mb-6 bg-yellow-50 border border-yellow-400 rounded-xl p-4 shadow-sm">
                                    <h4 className="text-center font-black text-yellow-800 mb-3 text-sm uppercase tracking-widest">🎖️ Resultados Oficiales del Torneo</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-sm">
                                        <div><span className="block text-[10px] text-yellow-600 font-bold uppercase">Campeón</span><span className="font-black text-yellow-900">{resultadosOficiales.campeon}</span></div>
                                        <div><span className="block text-[10px] text-yellow-600 font-bold uppercase">Goleador</span><span className="font-black text-yellow-900">{resultadosOficiales.goles}</span></div>
                                        <div><span className="block text-[10px] text-yellow-600 font-bold uppercase">MVP</span><span className="font-black text-yellow-900">{resultadosOficiales.mvp}</span></div>
                                    </div>
                                </div>
                            )}

                            {cargandoPronosticos ? (
                                <p className="text-center text-gray-500 py-8 animate-pulse font-medium">Buscando en los registros...</p>
                            ) : pronosticosGlobales.length === 0 ? (
                                <p className="text-center text-gray-400 py-8 italic">Aún no hay predicciones maestras registradas.</p>
                            ) : (
                                <div className="space-y-4">
                                    {pronosticosGlobales.map((p, index) => {
                                        // Estilos dinámicos dependiendo de si el usuario sumó puntos
                                        const ganoPuntos = p.totalPts > 0;
                                        const cardBg = ganoPuntos ? "bg-white border-green-300" : "bg-white border-gray-200";

                                        return (
                                            <div key={p.id} className={`p-4 rounded-xl border shadow-sm flex flex-col gap-3 relative ${cardBg}`}>

                                                {/* Etiqueta de Puntos Totales */}
                                                {ganoPuntos && (
                                                    <div className="absolute top-3 right-3 bg-green-500 text-white font-black text-xs px-2 py-1 rounded-md shadow-sm">
                                                        +{p.totalPts} Puntos
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                                    <span className="font-bold text-gray-400 text-sm">#{index + 1}</span>
                                                    <span className="font-black text-blue-900 text-lg">{p.nombre}</span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mt-1">
                                                    {/* Tarjeta Campeón */}
                                                    <div className={`p-2 rounded-lg border ${p.ptsCampeon > 0 ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-100'}`}>
                                                        <span className={`text-[10px] block uppercase font-bold tracking-wider ${p.ptsCampeon > 0 ? 'text-green-700' : 'text-gray-500'}`}>🏆 Campeón</span>
                                                        <span className={`font-bold ${p.ptsCampeon > 0 ? 'text-green-900' : 'text-gray-800'}`}>{p.campeon}</span>
                                                    </div>

                                                    {/* Tarjeta Goleador */}
                                                    <div className={`p-2 rounded-lg border ${p.ptsGoleador > 0 ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-100'}`}>
                                                        <span className={`text-[10px] block uppercase font-bold tracking-wider ${p.ptsGoleador > 0 ? 'text-green-700' : 'text-gray-500'}`}>⚽ Goleador</span>
                                                        <span className={`font-bold ${p.ptsGoleador > 0 ? 'text-green-900' : 'text-gray-800'}`}>{p.goleador}</span>
                                                    </div>

                                                    {/* Tarjeta MVP */}
                                                    <div className={`p-2 rounded-lg border ${p.ptsMvp > 0 ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-100'}`}>
                                                        <span className={`text-[10px] block uppercase font-bold tracking-wider ${p.ptsMvp > 0 ? 'text-green-700' : 'text-gray-500'}`}>🎖️ MVP</span>
                                                        <span className={`font-bold ${p.ptsMvp > 0 ? 'text-green-900' : 'text-gray-800'}`}>{p.mvp}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}