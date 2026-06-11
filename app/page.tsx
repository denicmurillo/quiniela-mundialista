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
  fecha_original?: any;
  estado_partido: string;
  jornada: number; // NUEVO: Campo clave para el filtro de pestañas
  goles_local?: number;
  goles_visitante?: number;
}

const obtenerBandera = (pais: string) => {
  const codigos: Record<string, string> = {
    "México": "mx", "Sudáfrica": "za", "Corea del Sur": "kr", "Chequia": "cz",
    "Canadá": "ca", "Bosnia": "ba", "Estados Unidos": "us", "Paraguay": "py",
    "Catar": "qa", "Suiza": "ch", "Brasil": "br", "Marruecos": "ma",
    "Haití": "ht", "Escocia": "gb-sct", "Australia": "au", "Turquía": "tr",
    "Alemania": "de", "Curazao": "cw", "Países Bajos": "nl", "Japón": "jp",
    "Costa de Marfil": "ci", "Ecuador": "ec", "Suecia": "se", "Túnez": "tn",
    "España": "es", "Cabo Verde": "cv", "Bélgica": "be", "Egipto": "eg",
    "Arabia Saudita": "sa", "Uruguay": "uy", "Irán": "ir", "Nueva Zelanda": "nz",
    "Francia": "fr", "Senegal": "sn", "Irak": "iq", "Noruega": "no",
    "Argentina": "ar", "Argelia": "dz", "Austria": "at", "Jordania": "jo",
    "Portugal": "pt", "RD Congo": "cd", "Inglaterra": "gb-eng", "Croacia": "hr",
    "Ghana": "gh", "Panamá": "pa", "Uzbekistán": "uz", "Colombia": "co",
    "Italia": "it", "Chile": "cl", "Nigeria": "ng", "Polonia": "pl",
    "Dinamarca": "dk", "Perú": "pe", "Ucrania": "ua", "Camerún": "cm"
  };
  const codigo = codigos[pais];
  return codigo ? `https://flagcdn.com/w80/${codigo}.png` : "https://flagcdn.com/w80/un.png";
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

  const horaPartido = partido.fecha_original && typeof partido.fecha_original.toDate === 'function'
    ? partido.fecha_original.toDate()
    : (partido.fecha_original instanceof Date ? partido.fecha_original : new Date(partido.fecha_original || partido.fecha_hora));
  const ahora = new Date();
  const diferenciaMinutos = (horaPartido.getTime() - ahora.getTime()) / (1000 * 60);
  const estaBloqueado = partido.estado_partido === "finalizado" || (!isNaN(diferenciaMinutos) && diferenciaMinutos <= 5);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between border-t-4 border-blue-600">
      <div className="flex-1 flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
        <span className="font-bold text-xl text-gray-800">{partido.equipo_local}</span>
        <img src={obtenerBandera(partido.equipo_local)} alt={partido.equipo_local} className="w-10 h-auto rounded shadow-sm" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 my-6 md:my-0 min-h-[140px]">
        <span className="text-xs font-semibold text-gray-500 mb-3 bg-gray-100 py-1 px-3 rounded-full text-center">
          {partido.fecha_hora}
        </span>

        {estaBloqueado ? (
          <div className="flex flex-col items-center w-full">
            {partido.estado_partido === "finalizado" ? (
              <span className="text-red-600 font-black text-sm uppercase tracking-wider mb-1 text-center">Marcador Final</span>
            ) : (
              <span className="text-amber-600 font-black text-sm uppercase tracking-wider mb-1 text-center animate-pulse">🔒 Pronósticos Cerrados</span>
            )}

            {partido.estado_partido === "finalizado" ? (
              <div className="flex gap-4 items-center text-3xl font-black text-gray-800 mb-3">
                <span>{partido.goles_local ?? 0}</span>
                <span className="text-gray-400">-</span>
                <span>{partido.goles_visitante ?? 0}</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500 font-semibold mb-3 bg-amber-50 border border-amber-200 py-1 px-3 rounded-full text-center">
                El partido está por comenzar o ya está en juego
              </div>
            )}

            {usuario ? (
              existePronostico ? (
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-center w-full max-w-[200px]">
                  <p className="text-xs text-blue-800 mb-1">Tu pronóstico enviado: <b className="text-sm">{golesLocal} - {golesVisitante}</b></p>
                  {partido.estado_partido === "finalizado" && <p className="text-sm font-bold text-green-600">+{puntos} Puntos</p>}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic text-center">No registraste pronóstico para este juego.</p>
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

  // NUEVO: Estado para controlar qué pestaña está activa (inicia en 1)
  const [jornadaActiva, setJornadaActiva] = useState<number>(1);

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
          let fechaOriginal = data.fecha_hora;
          if (data.fecha_hora && typeof data.fecha_hora.toDate === 'function') {
            fechaOriginal = data.fecha_hora.toDate();
            fechaFormateada = fechaOriginal.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' });
          }
          // Recuperamos el campo jornada (si es un registro viejo y no lo tiene, asumimos 1 por defecto)
          listaPartidos.push({ id: doc.id, ...data, fecha_hora: fechaFormateada, fecha_original: fechaOriginal, jornada: data.jornada || 1 } as Partido);
        });

        // Ordenamos los partidos cronológicamente para que se vean bien
        listaPartidos.sort((a, b) => {
          const timeA = a.fecha_original instanceof Date ? a.fecha_original.getTime() : 0;
          const timeB = b.fecha_original instanceof Date ? b.fecha_original.getTime() : 0;
          return timeA - timeB;
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
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">

        {/* SECCIÓN HERO CON LOGO GRANDE */}
        <div className="flex flex-col items-center mb-8 pt-4">
          <img
            src={process.env.NEXT_PUBLIC_APP_LOGO || "/logo-familia-1.png"}
            alt="Mundial Pro 2026"
            className="w-32 h-32 md:w-40 md:h-40 object-contain mb-4 drop-shadow-xl"
          />
          <h1 className="text-4xl md:text-5xl font-black text-blue-900 tracking-tighter text-center uppercase">
            {process.env.NEXT_PUBLIC_APP_TITLE || "Quiniela Mundialista"}
          </h1>
          <p className="text-blue-600 font-bold tracking-wider text-sm uppercase text-center mt-2">
            🏆 FASE I: Grupos
          </p>
        </div>

        {/* SELECTOR TÁCTIL DE PESTAÑAS */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex justify-between gap-2 mb-8">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setJornadaActiva(num)}
              className={`flex-1 py-3 px-2 rounded-lg font-bold text-xs md:text-sm transition-all uppercase tracking-wider text-center ${jornadaActiva === num
                  ? "bg-blue-600 text-white shadow-md scale-[1.02]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
            >
              Jornada {num === 1 ? "I" : num === 2 ? "II" : "III"}
            </button>
          ))}
        </div>

        {/* ENCABEZADO DE TABLERO Y USUARIO */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900 text-center md:text-left w-full md:w-auto">
            Partidos (Jornada {jornadaActiva === 1 ? "I" : jornadaActiva === 2 ? "II" : "III"})
          </h2>
          <div className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hidden md:block">
            {usuarioActual ? `👤 ${usuarioActual.email}` : "⚠️ No has iniciado sesión"}
          </div>
        </div>

        {cargando ? (
          <p className="text-center text-gray-500 font-semibold animate-pulse py-10">Cargando el calendario desde el estadio...</p>
        ) : (
          <div className="space-y-4">
            {/* AQUÍ SE HACE EL FILTRADO MÁGICO POR JORNADA ACTIVA */}
            {partidos
              .filter((p) => p.jornada === jornadaActiva)
              .map((partido) => (
                <TarjetaPartido key={partido.id} partido={partido} usuario={usuarioActual} />
              ))}

            {partidos.filter((p) => p.jornada === jornadaActiva).length === 0 && (
              <p className="text-center text-gray-400 italic py-8 bg-white rounded-xl shadow-sm border border-gray-200">
                No hay partidos programados para esta jornada.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}