# CONTEXTO DEL PROYECTO: QUINIELA MUNDIALISTA (MUNDIAL PRO)

Este archivo contiene la estructura completa y el código de todos los archivos clave del proyecto **Quiniela Mundialista** ("Mundial Pro"). Ha sido generado para que puedas cargarlo directamente a un chat de Gemini u otro LLM para continuar explorando consultas y mejoras.

---

## 📋 Resumen del Proyecto
* **Nombre:** Quiniela Mundialista (Mundial Pro)
* **Framework:** Next.js 16.2.9 (App Router) + React 19.2.4
* **Estilos:** Tailwind CSS v4.0.0
* **Lenguaje:** TypeScript 5.x
* **Backend & DB:** Firebase v12.14.0 (Authentication para usuarios, Firestore para persistencia)

---

## 🛠️ Reglas del Juego y Base de Datos
1. **Usuarios (`usuarios`):** Cada usuario registrado se guarda en Firestore con su `uid`, `nombre`, `email` y `puntaje_total` (iniciando en 0).
2. **Partidos (`partidos`):** Contiene los partidos con campos como `equipo_local`, `equipo_visitante`, `fecha_hora`, `estado_partido` ("pendiente" o "finalizado"), y opcionalmente `goles_local` y `goles_visitante` una vez que terminan.
3. **Predicciones (`predicciones`):** Documentos identificados por `${usuario_id}_${partido_id}`. Guardan el `pronostico_local`, `pronostico_visitante` y los `puntos_ganados` una vez procesado el partido.
4. **Cálculo de Puntos (`lib/motorPuntos.ts`):**
   * **3 Puntos (Acierto Exacto):** Si el marcador pronosticado coincide exactamente con el real.
   * **1 Punto (Acierto de Tendencia):** Si se acierta al ganador o empate, pero no al marcador exacto.
   * **0 Puntos (Fallo Total):** Si no se acierta la tendencia.
5. **Panel Admin (`app/admin/page.tsx`):** Exclusivo para el correo `denicmurillo@gmail.com`. Permite ingresar los resultados reales de un partido, lo marca como finalizado, calcula los puntos de cada predicción guardada y los suma de forma atómica (`increment` de Firestore) al `puntaje_total` del respectivo usuario.

---

## 🗂️ Código Fuente Completo del Proyecto

### 1. `package.json`
```json
{
  "name": "quiniela-mundialista",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "firebase": "^12.14.0",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### 2. `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

### 3. `next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### 4. `lib/firebase.ts`
```typescript
// Importamos las funciones necesarias de Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Tus credenciales exactas
const firebaseConfig = {
    apiKey: "AIzaSyBSmz8ze45TB2xdLFyZMpUDCpNqRtGqO4Y",
    authDomain: "mundial-pro-app.firebaseapp.com",
    projectId: "mundial-pro-app",
    storageBucket: "mundial-pro-app.firebasestorage.app",
    messagingSenderId: "541413737632",
    appId: "1:541413737632:web:fc4e28c25f9247428a35c5",
    measurementId: "G-ZFV1YQ0FMY" // Añadimos el ID de Analytics
};

// Inicializamos Firebase solo una vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializamos la Base de Datos (Firestore) y la Autenticación
const db = getFirestore(app);
const auth = getAuth(app);

// Inicializamos Analytics SOLO si estamos del lado del cliente (navegador)
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

// Exportamos todo para usarlo en la app
export { app, db, auth, analytics };
```

### 5. `lib/motorPuntos.ts`
```typescript
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Calcula los puntos que merece una predicción basándose en el resultado real.
 */
export function calcularPuntos(
    pronosticoLocal: number,
    pronosticoVisitante: number,
    resultadoRealLocal: number,
    resultadoRealVisitante: number
): number {

    // 1. ACIERTO EXACTO (Marcador idéntico) -> 3 Puntos
    if (pronosticoLocal === resultadoRealLocal && pronosticoVisitante === resultadoRealVisitante) {
        return 3;
    }

    // Determinamos la tendencia real (1 = Gana Local, -1 = Gana Visitante, 0 = Empate)
    const tendenciaReal = Math.sign(resultadoRealLocal - resultadoRealVisitante);
    // Determinamos la tendencia que pronosticó el usuario
    const tendenciaPronostico = Math.sign(pronosticoLocal - pronosticoVisitante);

    // 2. ACIERTO DE TENDENCIA (Le atinó al ganador o al empate pero no al marcador) -> 1 Punto
    if (tendenciaReal === tendenciaPronostico) {
        return 1;
    }

    // 3. FALLO TOTAL -> 0 Puntos
    return 0;
}

/**
 * FUNCIÓN MAESTRA: Se ejecuta cuando tú, como administrador, pones el resultado oficial.
 * Recorre la predicción, calcula los puntos e incrementa el puntaje global del usuario.
 */
export async function procesarPuntosDePrediccion(
    prediccionId: string,
    usuarioId: string,
    pronosticoLocal: number,
    pronosticoVisitante: number,
    realLocal: number,
    realVisitante: number
) {
    // 1. Calcular los puntos obtenidos usando nuestro algoritmo
    const puntosObtenidos = calcularPuntos(pronosticoLocal, pronosticoVisitante, realLocal, realVisitante);

    if (puntosObtenidos > 0) {
        // 2. Actualizar los puntos ganados EN ESA PREDICCIÓN específica
        const prediccionRef = doc(db, "predicciones", prediccionId);
        await updateDoc(prediccionRef, {
            puntos_ganados: puntosObtenidos
        });

        // 3. TRUCO DE INGENIERO: Sumar los puntos al puntaje acumulado del usuario de forma atómica
        // (Usa la función 'increment' de Firebase para evitar errores si dos partidos terminan a la vez)
        const usuarioRef = doc(db, "usuarios", usuarioId);
        await updateDoc(usuarioRef, {
            puntaje_total: increment(puntosObtenidos)
        });
    }
}
```

### 6. `components/Navbar.tsx`
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Navbar() {
    const pathname = usePathname(); // Nos dice en qué URL estamos parados
    const [usuario, setUsuario] = useState<User | null>(null);

    // Escuchamos si hay alguien conectado
    useEffect(() => {
        const cancelarSuscripcion = onAuthStateChanged(auth, (user) => {
            setUsuario(user);
        });
        return () => cancelarSuscripcion();
    }, []);

    const cerrarSesion = async () => {
        if (confirm("¿Seguro que deseas salir de tu cuenta?")) {
            await signOut(auth);
        }
    };

    // Función rápida para saber si pintar el botón más oscuro
    const esActivo = (ruta: string) => pathname === ruta;

    return (
        <nav className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Logo / Título */}
                    <Link href="/" className="font-bold text-xl flex items-center gap-2 hover:scale-105 transition-transform">
                        ⚽ <span className="hidden sm:block tracking-wide">Mundial Pro</span>
                    </Link>

                    {/* Botones de Navegación */}
                    <div className="flex space-x-1 sm:space-x-2">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${esActivo('/') ? 'bg-blue-800 text-white shadow-inner' : 'hover:bg-blue-700 text-blue-100'}`}
                        >
                            Partidos
                        </Link>

                        <Link
                            href="/ranking"
                            className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${esActivo('/ranking') ? 'bg-blue-800 text-white shadow-inner' : 'hover:bg-blue-700 text-blue-100'}`}
                        >
                            Ranking
                        </Link>

                        {/* Renderizado Condicional: Si hay usuario, muestra Salir. Si no, Registro. */}
                        {usuario ? (
                            <button
                                onClick={cerrarSesion}
                                className="px-3 py-2 rounded-md text-sm font-semibold text-red-300 hover:bg-red-800/60 transition-colors ml-2"
                            >
                                Salir
                            </button>
                        ) : (
                            <Link
                                href="/registro"
                                className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${esActivo('/registro') ? 'bg-blue-800 text-white shadow-inner' : 'hover:bg-blue-700 text-blue-100'}`}
                            >
                                Registro
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
```

### 7. `app/globals.css`
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

### 8. `app/layout.tsx`
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // IMPORTAMOS LA BARRA

const inter = Inter({ subsets: ["latin"] });

// Estos son los datos que leen los navegadores y WhatsApp para los enlaces
export const metadata: Metadata = {
  title: "Quiniela Mundialista",
  description: "Demuestra quién sabe más de fútbol. Juega con amigos y familiares.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar /> {/* AQUÍ INYECTAMOS LA BARRA PARA TODAS LAS PÁGINAS */}
        {children}
      </body>
    </html>
  );
}
```

### 9. `app/page.tsx`
```typescript
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../lib/firebase";

interface Partido {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
  fecha_hora: string;
  estado_partido: string;
  goles_local?: number;
  goles_visitante?: number;
}

const obtenerBandera = (pais: string) => {
  const codigos: Record<string, string> = { "México": "mx", "Brasil": "br", "Argentina": "ar", "Costa Rica": "cr", "España": "es" };
  return codigos[pais] ? `https://flagcdn.com/w80/${codigos[pais]}.png` : "https://flagcdn.com/w80/un.png";
};

function TarjetaPartido({ partido, usuario }: { partido: Partido, usuario: User | null }) {
  const [golesLocal, setGolesLocal] = useState("0");
  const [golesVisitante, setGolesVisitante] = useState("0");
  const [puntos, setPuntos] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [existePronostico, setExistePronostico] = useState(false);

  useEffect(() => {
    const buscarPronosticoAntiguo = async () => {
      if (usuario) {
        const prediccionRef = doc(db, "predicciones", `${usuario.uid}_${partido.id}`);
        const prediccionSnap = await getDoc(prediccionRef);

        if (prediccionSnap.exists()) {
          const data = prediccionSnap.data();
          setGolesLocal(data.pronostico_local.toString());
          setGolesVisitante(data.pronostico_visitante.toString());
          if (data.puntos_ganados !== undefined) setPuntos(data.puntos_ganados);
          setExistePronostico(true);
        }
      }
    };
    buscarPronosticoAntiguo();
  }, [usuario, partido.id]);

  const guardarPronostico = async () => {
    if (!usuario) { alert("⚠️ Debes iniciar sesión para poder jugar."); return; }
    setGuardando(true);
    try {
      const prediccionId = `${usuario.uid}_${partido.id}`;
      await setDoc(doc(db, "predicciones", prediccionId), {
        usuario_id: usuario.uid,
        partido_id: partido.id,
        pronostico_local: parseInt(golesLocal),
        pronostico_visitante: parseInt(golesVisitante),
      }, { merge: true });
      setExistePronostico(true);
      alert("¡Pronóstico guardado con éxito! 🏆");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar tu pronóstico.");
    } finally {
      setGuardando(false);
    }
  };

  const estaBloqueado = partido.estado_partido === "finalizado";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between border-t-4 border-blue-600">

      {/* Equipo Local: Centrado en móvil, alineado a la derecha en PC */}
      <div className="flex-1 flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
        <span className="font-bold text-xl text-gray-800">{partido.equipo_local}</span>
        <img src={obtenerBandera(partido.equipo_local)} alt={partido.equipo_local} className="w-10 h-auto rounded shadow-sm" />
      </div>

      {/* Centro: Siempre en columna y centrado */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 my-6 md:my-0 min-h-[140px]">
        <span className="text-xs font-semibold text-gray-500 mb-3 bg-gray-100 py-1 px-3 rounded-full text-center">
          {partido.fecha_hora}
        </span>

        {estaBloqueado ? (
          <div className="flex flex-col items-center w-full">
            <span className="text-red-600 font-black text-sm uppercase tracking-wider mb-1 text-center">Marcador Final</span>
            <div className="flex gap-4 items-center text-3xl font-black text-gray-800 mb-3">
              <span>{partido.goles_local ?? 0}</span>
              <span className="text-gray-400">-</span>
              <span>{partido.goles_visitante ?? 0}</span>
            </div>

            {usuario ? (
              existePronostico ? (
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-center w-full max-w-[200px]">
                  <p className="text-xs text-blue-800 mb-1">Tu pronóstico: <b className="text-sm">{golesLocal} - {golesVisitante}</b></p>
                  <p className="text-sm font-bold text-green-600">+{puntos} Puntos</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic text-center">No participaste en este partido.</p>
              )
            ) : (
              <p className="text-xs text-gray-400 italic text-center">Inicia sesión para ver tu desempeño.</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex gap-2 items-center">
              <input type="number" min="0" value={golesLocal} onChange={(e) => setGolesLocal(e.target.value)} className="w-12 h-12 text-center border-2 rounded-md p-1 font-bold text-xl outline-none border-gray-200 focus:border-blue-500 text-black" />
              <span className="text-gray-400 font-bold mx-2">VS</span>
              <input type="number" min="0" value={golesVisitante} onChange={(e) => setGolesVisitante(e.target.value)} className="w-12 h-12 text-center border-2 rounded-md p-1 font-bold text-xl outline-none border-gray-200 focus:border-blue-500 text-black" />
            </div>
            <button onClick={guardarPronostico} disabled={guardando} className={`mt-4 text-white text-sm font-bold py-2 px-6 rounded-full transition-all shadow-md transform hover:-translate-y-0.5 ${guardando ? 'bg-gray-400' : (existePronostico ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600')}`}>
              {guardando ? "Guardando..." : (existePronostico ? "Actualizar Pronóstico" : "Guardar Pronóstico")}
            </button>
          </div>
        )}
      </div>

      {/* Equipo Visitante: Centrado en móvil, alineado a la izquierda en PC */}
      <div className="flex-1 flex items-center justify-center md:justify-start gap-4 w-full md:w-auto">
        <img src={obtenerBandera(partido.equipo_visitante)} alt={partido.equipo_visitante} className="w-10 h-auto rounded shadow-sm" />
        <span className="font-bold text-xl text-gray-800">{partido.equipo_visitante}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState<User | null>(null);

  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, (user) => {
      setUsuarioActual(user);
    });

    const cargarPartidos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "partidos"));
        const listaPartidos: Partido[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let fechaFormateada = data.fecha_hora;
          if (data.fecha_hora && typeof data.fecha_hora.toDate === 'function') {
            fechaFormateada = data.fecha_hora.toDate().toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' });
          }
          listaPartidos.push({ id: doc.id, ...data, fecha_hora: fechaFormateada } as Partido);
        });
        setPartidos(listaPartidos);
      } catch (error) {
        console.error("Error al cargar partidos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarPartidos();
    return () => cancelarSuscripcion();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 text-center md:text-left w-full md:w-auto">🏆 Tablero de Partidos</h1>
          <div className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hidden md:block">
            {usuarioActual ? `👤 ${usuarioActual.email}` : "⚠️ No has iniciado sesión"}
          </div>
        </div>

        {cargando ? (
          <p className="text-center text-gray-500 font-semibold animate-pulse">Cargando el calendario desde el estadio...</p>
        ) : (
          <div className="space-y-4">
            {partidos.map((partido) => (
              <TarjetaPartido key={partido.id} partido={partido} usuario={usuarioActual} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

### 10. `app/registro/page.tsx`
```typescript
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
```

### 11. `app/ranking/page.tsx`
```typescript
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
```

### 12. `app/admin/page.tsx`
```typescript
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
```
