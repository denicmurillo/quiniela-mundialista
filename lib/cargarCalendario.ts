import { db } from "./firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

const partidosFaseGrupos = [
    // 🗓️ JUEVES 11 DE JUNIO
    { id: "wc26_01", equipo_local: "México", equipo_visitante: "Sudáfrica", fecha_hora: Timestamp.fromDate(new Date("2026-06-11T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_02", equipo_local: "Corea del Sur", equipo_visitante: "Chequia", fecha_hora: Timestamp.fromDate(new Date("2026-06-11T20:00:00-06:00")), estado_partido: "pendiente" },

    // 🗓️ VIERNES 12 DE JUNIO
    { id: "wc26_03", equipo_local: "Canadá", equipo_visitante: "Bosnia", fecha_hora: Timestamp.fromDate(new Date("2026-06-12T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_04", equipo_local: "Estados Unidos", equipo_visitante: "Paraguay", fecha_hora: Timestamp.fromDate(new Date("2026-06-12T19:00:00-06:00")), estado_partido: "pendiente" },

    // 🗓️ SÁBADO 13 DE JUNIO
    { id: "wc26_05", equipo_local: "Catar", equipo_visitante: "Suiza", fecha_hora: Timestamp.fromDate(new Date("2026-06-13T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_06", equipo_local: "Brasil", equipo_visitante: "Marruecos", fecha_hora: Timestamp.fromDate(new Date("2026-06-13T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_07", equipo_local: "Haití", equipo_visitante: "Escocia", fecha_hora: Timestamp.fromDate(new Date("2026-06-13T17:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_08", equipo_local: "Australia", equipo_visitante: "Turquía", fecha_hora: Timestamp.fromDate(new Date("2026-06-13T20:00:00-06:00")), estado_partido: "pendiente" },

    // 🗓️ DOMINGO 14 DE JUNIO
    { id: "wc26_09", equipo_local: "Alemania", equipo_visitante: "Curazao", fecha_hora: Timestamp.fromDate(new Date("2026-06-14T11:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_10", equipo_local: "Países Bajos", equipo_visitante: "Japón", fecha_hora: Timestamp.fromDate(new Date("2026-06-14T14:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_11", equipo_local: "Costa de Marfil", equipo_visitante: "Ecuador", fecha_hora: Timestamp.fromDate(new Date("2026-06-14T17:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_12", equipo_local: "Suecia", equipo_visitante: "Túnez", fecha_hora: Timestamp.fromDate(new Date("2026-06-14T20:00:00-06:00")), estado_partido: "pendiente" },

    // 🗓️ LUNES 15 DE JUNIO
    { id: "wc26_13", equipo_local: "España", equipo_visitante: "Cabo Verde", fecha_hora: Timestamp.fromDate(new Date("2026-06-15T10:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_14", equipo_local: "Bélgica", equipo_visitante: "Egipto", fecha_hora: Timestamp.fromDate(new Date("2026-06-15T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_15", equipo_local: "Arabia Saudita", equipo_visitante: "Uruguay", fecha_hora: Timestamp.fromDate(new Date("2026-06-15T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_16", equipo_local: "Irán", equipo_visitante: "Nueva Zelanda", fecha_hora: Timestamp.fromDate(new Date("2026-06-15T19:00:00-06:00")), estado_partido: "pendiente" },

    // 🗓️ MARTES 16 DE JUNIO
    { id: "wc26_17", equipo_local: "Francia", equipo_visitante: "Senegal", fecha_hora: Timestamp.fromDate(new Date("2026-06-16T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_18", equipo_local: "Irak", equipo_visitante: "Noruega", fecha_hora: Timestamp.fromDate(new Date("2026-06-16T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_19", equipo_local: "Argentina", equipo_visitante: "Argelia", fecha_hora: Timestamp.fromDate(new Date("2026-06-16T19:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_20", equipo_local: "Austria", equipo_visitante: "Jordania", fecha_hora: Timestamp.fromDate(new Date("2026-06-16T22:00:00-06:00")), estado_partido: "pendiente" },

    // 🗓️ MIÉRCOLES 17 DE JUNIO
    { id: "wc26_21", equipo_local: "Portugal", equipo_visitante: "RD Congo", fecha_hora: Timestamp.fromDate(new Date("2026-06-17T11:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_22", equipo_local: "Inglaterra", equipo_visitante: "Croacia", fecha_hora: Timestamp.fromDate(new Date("2026-06-17T14:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_23", equipo_local: "Ghana", equipo_visitante: "Panamá", fecha_hora: Timestamp.fromDate(new Date("2026-06-17T17:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_24", equipo_local: "Uzbekistán", equipo_visitante: "Colombia", fecha_hora: Timestamp.fromDate(new Date("2026-06-17T20:00:00-06:00")), estado_partido: "pendiente" }
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
        console.log("✅ ¡Jornada 1 completa inyectada con éxito!");
        return true;
    } catch (error) {
        console.error("❌ Error al inyectar fixture:", error);
        return false;
    }
}