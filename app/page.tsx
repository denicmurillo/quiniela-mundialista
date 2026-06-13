"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../lib/firebase";

interface Partido {
  id: string;
  equipo_local: string;
  equipo_visitante: string;
  fecha_hora: string;
  fecha_original?: any;
  estado_partido: string;
  jornada: number;
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

// Modificamos las props para recibir el mapa de nombres de usuarios
function TarjetaPartido({ partido, usuario, usuariosMap }: { partido: Partido, usuario: User | null, usuariosMap: Record<string, string> }) {
  const [golesLocal, setGolesLocal] = useState("0");
  const [golesVisitante, setGolesVisitante] = useState("0");
  const [puntos, setPuntos] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [existePronostico, setExistePronostico] = useState(false);

  // NUEVOS ESTADOS PARA EL MODAL DE "VER TODOS"
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargandoPronosticos, setCargandoPronosticos] = useState(false);
  const [pronosticosGlobales, setPronosticosGlobales] = useState<any[]>([]);

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

  // FUNCIÓN PARA CARGAR Y MOSTRAR LOS PRONÓSTICOS DE LOS DEMÁS
  const abrirModalPronosticos = async () => {
    setModalAbierto(true);
    setCargandoPronosticos(true);
    try {
      const qPredicciones = query(collection(db, "predicciones"), where("partido_id", "==", partido.id));
      const snapPred = await getDocs(qPredicciones);

      const lista = snapPred.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: usuariosMap[data.usuario_id] || "Anónimo",
          local: data.pronostico_local,
          visitante: data.pronostico_visitante,
          puntos: data.puntos_ganados
        };
      });

      // Si el partido terminó, ordenamos por quién ganó más puntos
      if (partido.estado_partido === "finalizado") {
        lista.sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
      } else {
        // Si no ha terminado, ordenamos alfabéticamente por nombre
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      }

      setPronosticosGlobales(lista);
    } catch (error) {
      console.error("Error al cargar pronósticos de terceros:", error);
    } finally {
      setCargandoPronosticos(false);
    }
  };

  const horaPartido = partido.fecha_original && typeof partido.fecha_original.toDate === 'function'
    ? partido.fecha_original.toDate()
    : (partido.fecha_original instanceof Date ? partido.fecha_original : new Date(partido.fecha_original || partido.fecha_hora));
  const ahora = new Date();
  const diferenciaMinutos = (horaPartido.getTime() - ahora.getTime()) / (1000 * 60);
  const estaBloqueado = partido.estado_partido === "finalizado" || (!isNaN(diferenciaMinutos) && diferenciaMinutos <= 5);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between border-t-4 border-blue-600">

        {/* Equipo Local */}
        <div className="flex-1 flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
          <span className="font-bold text-xl text-gray-800">{partido.equipo_local}</span>
          <img src={obtenerBandera(partido.equipo_local)} alt={partido.equipo_local} className="w-10 h-auto rounded shadow-sm" />
        </div>

        {/* Centro */}
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4 my-6 md:my-0 min-h-[140px]">
          <span className="text-xs font-semibold text-gray-500 mb-3 bg-gray-100 py-1 px-3 rounded-full text-center">
            {partido.fecha_hora}
          </span>

          {estaBloqueado ? (
            <div className="flex flex-col items-center w-full">
              {partido.estado_partido === "finalizado" ? (
                <span className="text-red-600 font-black text-sm uppercase tracking-wider mb-1 text-center">Marcador Final</span>
              ) : (
                <span className="text-amber-600 font-black text-sm uppercase tracking-wider mb-1 text-center animate-pulse">🔒 En Juego</span>
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
                  <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-center w-full max-w-[200px] mb-3">
                    <p className="text-xs text-blue-800 mb-1">Tu pronóstico enviado: <b className="text-sm">{golesLocal} - {golesVisitante}</b></p>
                    {partido.estado_partido === "finalizado" && <p className="text-sm font-bold text-green-600">+{puntos} Puntos</p>}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center mb-3">No registraste pronóstico para este juego.</p>
                )
              ) : (
                <p className="text-xs text-gray-400 italic text-center mb-3">Inicia sesión para ver tu desempeño.</p>
              )}

              {/* BOTÓN PARA VER A LOS DEMÁS (SOLO VISIBLE CUANDO SE BLOQUEA) */}
              <button
                onClick={abrirModalPronosticos}
                className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-4 rounded-full border border-gray-300 transition-colors flex items-center gap-1 shadow-sm"
              >
                👁️ Ver todos los pronósticos
              </button>

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

        {/* Equipo Visitante */}
        <div className="flex-1 flex items-center justify-center md:justify-start gap-4 w-full md:w-auto">
          <img src={obtenerBandera(partido.equipo_visitante)} alt={partido.equipo_visitante} className="w-10 h-auto rounded shadow-sm" />
          <span className="font-bold text-xl text-gray-800">{partido.equipo_visitante}</span>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL DE PRONÓSTICOS DE TERCEROS           */}
      {/* ========================================== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header del Modal */}
            <div className="bg-blue-900 p-4 text-white flex justify-between items-center sticky top-0">
              <div>
                <h3 className="font-black text-lg tracking-tight">Pronósticos del Grupo</h3>
                <p className="text-xs text-blue-200">{partido.equipo_local} vs {partido.equipo_visitante}</p>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-blue-200 hover:text-white text-2xl font-bold px-2">&times;</button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-4 overflow-y-auto bg-gray-50 flex-1">
              {cargandoPronosticos ? (
                <p className="text-center text-gray-500 py-8 animate-pulse font-medium">Buscando en los registros...</p>
              ) : pronosticosGlobales.length === 0 ? (
                <p className="text-center text-gray-400 py-8 italic">Nadie se atrevió a pronosticar este partido.</p>
              ) : (
                <div className="space-y-2">
                  {pronosticosGlobales.map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${p.puntos === 3 ? 'bg-green-50 border-green-200' : p.puntos === 1 ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-200'}`}>
                      <span className="font-bold text-sm text-gray-800 flex-1 truncate pr-2">{p.nombre}</span>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-md text-sm border border-gray-300">
                          {p.local} - {p.visitante}
                        </span>
                        {/* Solo mostramos puntos si el partido ya finalizó */}
                        {partido.estado_partido === "finalizado" && (
                          <span className={`text-xs font-black w-14 text-right ${p.puntos === 3 ? 'text-green-600' : p.puntos === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            {p.puntos > 0 ? `+${p.puntos} pts` : '0 pts'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState<User | null>(null);
  const [jornadaActiva, setJornadaActiva] = useState<number>(1);

  // DICCIONARIO MAESTRO DE USUARIOS PARA OPTIMIZAR EL MODAL
  const [usuariosMap, setUsuariosMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, (user) => {
      setUsuarioActual(user);
    });

    const inicializarDatos = async () => {
      try {
        // 1. Cargamos el diccionario de nombres de usuarios de forma silenciosa
        const snapUsuarios = await getDocs(collection(db, "usuarios"));
        const mapaTemporal: Record<string, string> = {};
        snapUsuarios.forEach(doc => {
          mapaTemporal[doc.id] = doc.data().nombre;
        });
        setUsuariosMap(mapaTemporal);

        // 2. Cargamos los partidos
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
          listaPartidos.push({ id: doc.id, ...data, fecha_hora: fechaFormateada, fecha_original: fechaOriginal, jornada: data.jornada || 1 } as Partido);
        });

        listaPartidos.sort((a, b) => {
          const timeA = a.fecha_original instanceof Date ? a.fecha_original.getTime() : 0;
          const timeB = b.fecha_original instanceof Date ? b.fecha_original.getTime() : 0;
          return timeA - timeB;
        });

        setPartidos(listaPartidos);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };

    inicializarDatos();
    return () => cancelarSuscripcion();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">

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
            {partidos
              .filter((p) => p.jornada === jornadaActiva)
              .map((partido) => (
                <TarjetaPartido key={partido.id} partido={partido} usuario={usuarioActual} usuariosMap={usuariosMap} />
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