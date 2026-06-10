"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function Registro() {
    const [esRegistro, setEsRegistro] = useState(false); // Por defecto mostramos Login
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");

    const manejarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("Procesando...");

        try {
            if (esRegistro) {
                // LÓGICA DE REGISTRO
                const credencial = await createUserWithEmailAndPassword(auth, email, password);
                const usuario = credencial.user;
                await setDoc(doc(db, "usuarios", usuario.uid), {
                    uid: usuario.uid,
                    nombre: nombre,
                    email: email,
                    puntaje_total: 0
                });
                setMensaje("¡Registro exitoso! Ya estás en la quiniela.");
            } else {
                // LÓGICA DE LOGIN
                await signInWithEmailAndPassword(auth, email, password);
                setMensaje("¡Inicio de sesión exitoso! Bienvenido de vuelta.");
                // Opcional: Redirigir al inicio automáticamente
                window.location.href = "/";
            }
        } catch (error: any) {
            console.error(error);
            setMensaje(esRegistro ? "Error: El correo ya existe o la contraseña es inválida." : "Error: Correo o contraseña incorrectos.");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-900">
                <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
                    {esRegistro ? "Únete a la Quiniela ⚽" : "Iniciar Sesión 🏆"}
                </h2>

                <form onSubmit={manejarSubmit} className="space-y-4">
                    {/* Solo pedimos el nombre si se está registrando */}
                    {esRegistro && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre o Apodo</label>
                            <input
                                type="text" required={esRegistro} value={nombre} onChange={(e) => setNombre(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900" placeholder="Ej: Tío Beto"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900" placeholder="tu@correo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900" placeholder="********"
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mt-4">
                        {esRegistro ? "Crear Cuenta" : "Entrar a mi cuenta"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => { setEsRegistro(!esRegistro); setMensaje(""); }}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                        {esRegistro ? "¿Ya tienes cuenta? Inicia sesión aquí" : "¿No tienes cuenta? Regístrate aquí"}
                    </button>
                </div>

                {mensaje && (
                    <div className={`mt-4 p-3 rounded text-center text-sm font-medium ${mensaje.includes("Error") ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
                        {mensaje}
                    </div>
                )}
            </div>
        </main>
    );
}