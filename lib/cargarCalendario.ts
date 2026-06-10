import { db } from "./firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

const partidosFaseGrupos = [
    {
        id: "wc_2026_j1_01",
        equipo_local: "México",
        equipo_visitante: "Sudáfrica",
        fecha_hora: Timestamp.fromDate(new Date("2026-06-11T13:00:00-06:00")), // Jueves 11 de junio, 1:00 PM CR
        estado_partido: "pendiente"
    },
    {
        id: "wc_2026_j1_02",
        equipo_local: "Corea del Sur",
        equipo_visitante: "Chequia",
        fecha_hora: Timestamp.fromDate(new Date("2026-06-11T20:00:00-06:00")), // Jueves 11 de junio, 8:00 PM CR
        estado_partido: "pendiente"
    },
    {
        id: "wc_2026_j1_03",
        equipo_local: "Canadá",
        equipo_visitante: "Bosnia",
        fecha_hora: Timestamp.fromDate(new Date("2026-06-12T13:00:00-06:00")), // Viernes 12 de junio, 1:00 PM CR
        estado_partido: "pendiente"
    },
    {
        id: "wc_2026_j1_04",
        equipo_local: "Estados Unidos",
        equipo_visitante: "Paraguay",
        fecha_hora: Timestamp.fromDate(new Date("2026-06-12T19:00:00-06:00")), // Viernes 12 de junio, 7:00 PM CR
        estado_partido: "pendiente"
    },
    {
        id: "wc_2026_j1_05",
        equipo_local: "Catar",
        equipo_visitante: "Suiza",
        fecha_hora: Timestamp.fromDate(new Date("2026-06-13T13:00:00-06:00")), // Sábado 13 de junio, 1:00 PM CR
        estado_partido: "pendiente"
    },
    {
        id: "wc_2026_j1_06",
        equipo_local: "Brasil",
        equipo_visitante: "Marruecos",
        fecha_hora: Timestamp.fromDate(new Date("2026-06-13T16:00:00-06:00")), // Sábado 13 de junio, 4:00 PM CR
        estado_partido: "pendiente"
    }
];

export async function sembrarCalendario() {
    try {
        const partidosRef = collection(db, "partidos");

        for (const partido of partidosFaseGrupos) {
            await setDoc(doc(partidosRef, partido.id), {
                equipo_local: partido.equipo_local,
                equipo_visitante: partido.equipo_visitante,
                fecha_hora: partido.fecha_hora,
                estado_partido: partido.estado_partido
            });
        }
        console.log("✅ ¡Fase de grupos real sembrada!");
        return true;
    } catch (error) {
        console.error("❌ Error al inyectar fixture:", error);
        return false;
    }
}