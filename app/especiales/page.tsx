"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

    if (cargando) return <p className="text-center py-10 font-semibold text-gray-500 animate-pulse">Cargando el podio de expertos...</p>;

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border-t-4 border-blue-900">
                <div className="text-center mb-6">
                    <span className="text-3xl">⭐</span>
                    <h1 className="text-3xl font-black text-blue-900 mt-2">PREDICCIONES MAESTRAS</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Pronostica los premios mayores del Mundial 2026</p>
                </div>

                {!usuario ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-center font-semibold text-sm">
                        ⚠️ Debes registrarte o iniciar sesión para poder bloquear tus pronósticos especiales.
                    </div>
                ) : (
                    <form onSubmit={guardarEspeciales} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">🏆 ¿Quién será el Campeón del Mundo?</label>
                            <input
                                type="text" required value={campeon} onChange={(e) => setCampeon(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-800 bg-gray-50 outline-none focus:border-blue-500 text-center"
                                placeholder="Ej: Argentina, Brasil, Francia..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">⚽ Bota de Oro (Máximo Goleador)</label>
                            <input
                                type="text" required value={goleador} onChange={(e) => setGoleador(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-800 bg-gray-50 outline-none focus:border-blue-500 text-center"
                                placeholder="Ej: Mbappé, Haaland, Vinicius..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">🎖️ Balón de Oro (MVP del Torneo)</label>
                            <input
                                type="text" required value={mvp} onChange={(e) => setMvp(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-800 bg-gray-50 outline-none focus:border-blue-500 text-center"
                                placeholder="Ej: Bellingham, Musiala, Lamine Yamal..."
                            />
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium text-center italic">
                            Nota: Estos pronósticos otorgan puntaje masivo de bonificación al terminar la gran final. ¡Elige con sabiduría!
                        </div>

                        <button
                            type="submit" disabled={guardando}
                            className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all uppercase tracking-wider"
                        >
                            {guardando ? "Asegurando..." : "Bloquear Mis Apuestas"}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}