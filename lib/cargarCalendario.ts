// lib/cargarCalendario.ts
import { db } from "./firebase";
import { collection, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";

const partidosFaseGrupos = [
    // ==========================================
    // 🗓️ JORNADA 1 (24 Partidos) - 11 al 17 de Junio
    // ==========================================
    { id: "wc26_01", jornada: 1, equipo_local: "México", equipo_visitante: "Sudáfrica", fecha_hora: Timestamp.fromDate(new Date("2026-06-11T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_02", jornada: 1, equipo_local: "Corea del Sur", equipo_visitante: "Chequia", fecha_hora: Timestamp.fromDate(new Date("2026-06-11T20:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_03", jornada: 1, equipo_local: "Canadá", equipo_visitante: "Bosnia", fecha_hora: Timestamp.fromDate(new Date("2026-06-12T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_04", jornada: 1, equipo_local: "Estados Unidos", equipo_visitante: "Paraguay", fecha_hora: Timestamp.fromDate(new Date("2026-06-12T19:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_05", jornada: 1, equipo_local: "Catar", equipo_visitante: "Suiza", fecha_hora: Timestamp.fromDate(new Date("2026-06-13T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_06", jornada: 1, equipo_local: "Brasil", equipo_visitante: "Marruecos", fecha_hora: Timestamp.fromDate(new Date("2026-06-13T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_07", jornada: 1, equipo_local: "Haití", equipo_visitante: "Escocia", fecha_hora: Timestamp.fromDate(new Date("2026-06-13T19:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_08", jornada: 1, equipo_local: "Australia", equipo_visitante: "Turquía", fecha_hora: Timestamp.fromDate(new Date("2026-06-13T22:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_09", jornada: 1, equipo_local: "Alemania", equipo_visitante: "Curazao", fecha_hora: Timestamp.fromDate(new Date("2026-06-14T11:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_10", jornada: 1, equipo_local: "Países Bajos", equipo_visitante: "Japón", fecha_hora: Timestamp.fromDate(new Date("2026-06-14T14:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_11", jornada: 1, equipo_local: "Costa de Marfil", equipo_visitante: "Ecuador", fecha_hora: Timestamp.fromDate(new Date("2026-06-14T17:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_12", jornada: 1, equipo_local: "Suecia", equipo_visitante: "Túnez", fecha_hora: Timestamp.fromDate(new Date("2026-06-14T20:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_13", jornada: 1, equipo_local: "España", equipo_visitante: "Cabo Verde", fecha_hora: Timestamp.fromDate(new Date("2026-06-15T10:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_14", jornada: 1, equipo_local: "Bélgica", equipo_visitante: "Egipto", fecha_hora: Timestamp.fromDate(new Date("2026-06-15T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_15", jornada: 1, equipo_local: "Arabia Saudita", equipo_visitante: "Uruguay", fecha_hora: Timestamp.fromDate(new Date("2026-06-15T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_16", jornada: 1, equipo_local: "Irán", equipo_visitante: "Nueva Zelanda", fecha_hora: Timestamp.fromDate(new Date("2026-06-15T19:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_17", jornada: 1, equipo_local: "Francia", equipo_visitante: "Senegal", fecha_hora: Timestamp.fromDate(new Date("2026-06-16T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_18", jornada: 1, equipo_local: "Irak", equipo_visitante: "Noruega", fecha_hora: Timestamp.fromDate(new Date("2026-06-16T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_19", jornada: 1, equipo_local: "Argentina", equipo_visitante: "Argelia", fecha_hora: Timestamp.fromDate(new Date("2026-06-16T19:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_20", jornada: 1, equipo_local: "Austria", equipo_visitante: "Jordania", fecha_hora: Timestamp.fromDate(new Date("2026-06-16T22:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_21", jornada: 1, equipo_local: "Portugal", equipo_visitante: "RD Congo", fecha_hora: Timestamp.fromDate(new Date("2026-06-17T11:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_22", jornada: 1, equipo_local: "Inglaterra", equipo_visitante: "Croacia", fecha_hora: Timestamp.fromDate(new Date("2026-06-17T14:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_23", jornada: 1, equipo_local: "Ghana", equipo_visitante: "Panamá", fecha_hora: Timestamp.fromDate(new Date("2026-06-17T17:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_24", jornada: 1, equipo_local: "Uzbekistán", equipo_visitante: "Colombia", fecha_hora: Timestamp.fromDate(new Date("2026-06-17T20:00:00-06:00")), estado_partido: "pendiente" },

    // ==========================================
    // 🗓️ JORNADA 2 (24 Partidos) - 18 al 23 de Junio
    // ==========================================
    { id: "wc26_25", jornada: 2, equipo_local: "Chequia", equipo_visitante: "Sudáfrica", fecha_hora: Timestamp.fromDate(new Date("2026-06-18T10:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_26", jornada: 2, equipo_local: "Suiza", equipo_visitante: "Bosnia", fecha_hora: Timestamp.fromDate(new Date("2026-06-18T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_27", jornada: 2, equipo_local: "Canadá", equipo_visitante: "Catar", fecha_hora: Timestamp.fromDate(new Date("2026-06-18T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_28", jornada: 2, equipo_local: "México", equipo_visitante: "Corea del Sur", fecha_hora: Timestamp.fromDate(new Date("2026-06-18T19:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_29", jornada: 2, equipo_local: "Estados Unidos", equipo_visitante: "Australia", fecha_hora: Timestamp.fromDate(new Date("2026-06-19T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_30", jornada: 2, equipo_local: "Escocia", equipo_visitante: "Marruecos", fecha_hora: Timestamp.fromDate(new Date("2026-06-19T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_31", jornada: 2, equipo_local: "Brasil", equipo_visitante: "Haití", fecha_hora: Timestamp.fromDate(new Date("2026-06-19T18:30:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_32", jornada: 2, equipo_local: "Turquía", equipo_visitante: "Paraguay", fecha_hora: Timestamp.fromDate(new Date("2026-06-19T21:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_33", jornada: 2, equipo_local: "Países Bajos", equipo_visitante: "Suecia", fecha_hora: Timestamp.fromDate(new Date("2026-06-20T11:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_34", jornada: 2, equipo_local: "Alemania", equipo_visitante: "Costa de Marfil", fecha_hora: Timestamp.fromDate(new Date("2026-06-20T14:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_35", jornada: 2, equipo_local: "Ecuador", equipo_visitante: "Curazao", fecha_hora: Timestamp.fromDate(new Date("2026-06-20T18:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_36", jornada: 2, equipo_local: "Túnez", equipo_visitante: "Japón", fecha_hora: Timestamp.fromDate(new Date("2026-06-20T22:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_37", jornada: 2, equipo_local: "España", equipo_visitante: "Arabia Saudita", fecha_hora: Timestamp.fromDate(new Date("2026-06-21T10:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_38", jornada: 2, equipo_local: "Bélgica", equipo_visitante: "Irán", fecha_hora: Timestamp.fromDate(new Date("2026-06-21T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_39", jornada: 2, equipo_local: "Uruguay", equipo_visitante: "Cabo Verde", fecha_hora: Timestamp.fromDate(new Date("2026-06-21T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_40", jornada: 2, equipo_local: "Nueva Zelanda", equipo_visitante: "Egipto", fecha_hora: Timestamp.fromDate(new Date("2026-06-21T19:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_41", jornada: 2, equipo_local: "Argentina", equipo_visitante: "Austria", fecha_hora: Timestamp.fromDate(new Date("2026-06-22T11:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_42", jornada: 2, equipo_local: "Francia", equipo_visitante: "Irak", fecha_hora: Timestamp.fromDate(new Date("2026-06-22T15:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_43", jornada: 2, equipo_local: "Noruega", equipo_visitante: "Senegal", fecha_hora: Timestamp.fromDate(new Date("2026-06-22T18:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_44", jornada: 2, equipo_local: "Jordania", equipo_visitante: "Argelia", fecha_hora: Timestamp.fromDate(new Date("2026-06-22T21:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_45", jornada: 2, equipo_local: "Portugal", equipo_visitante: "Uzbekistán", fecha_hora: Timestamp.fromDate(new Date("2026-06-23T11:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_46", jornada: 2, equipo_local: "Inglaterra", equipo_visitante: "Ghana", fecha_hora: Timestamp.fromDate(new Date("2026-06-23T14:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_47", jornada: 2, equipo_local: "Panamá", equipo_visitante: "Croacia", fecha_hora: Timestamp.fromDate(new Date("2026-06-23T17:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_48", jornada: 2, equipo_local: "Colombia", equipo_visitante: "RD Congo", fecha_hora: Timestamp.fromDate(new Date("2026-06-23T20:00:00-06:00")), estado_partido: "pendiente" },

    // ==========================================
    // 🗓️ JORNADA 3 (24 Partidos) - 24 al 27 de Junio
    // ==========================================
    { id: "wc26_49", jornada: 3, equipo_local: "Suiza", equipo_visitante: "Canadá", fecha_hora: Timestamp.fromDate(new Date("2026-06-24T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_50", jornada: 3, equipo_local: "Bosnia", equipo_visitante: "Catar", fecha_hora: Timestamp.fromDate(new Date("2026-06-24T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_51", jornada: 3, equipo_local: "Marruecos", equipo_visitante: "Haití", fecha_hora: Timestamp.fromDate(new Date("2026-06-24T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_52", jornada: 3, equipo_local: "Brasil", equipo_visitante: "Escocia", fecha_hora: Timestamp.fromDate(new Date("2026-06-24T16:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_53", jornada: 3, equipo_local: "Sudáfrica", equipo_visitante: "Corea del Sur", fecha_hora: Timestamp.fromDate(new Date("2026-06-24T19:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_54", jornada: 3, equipo_local: "Chequia", equipo_visitante: "México", fecha_hora: Timestamp.fromDate(new Date("2026-06-24T19:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_55", jornada: 3, equipo_local: "Curazao", equipo_visitante: "Costa de Marfil", fecha_hora: Timestamp.fromDate(new Date("2026-06-25T14:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_56", jornada: 3, equipo_local: "Ecuador", equipo_visitante: "Alemania", fecha_hora: Timestamp.fromDate(new Date("2026-06-25T14:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_57", jornada: 3, equipo_local: "Japón", equipo_visitante: "Suecia", fecha_hora: Timestamp.fromDate(new Date("2026-06-25T17:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_58", jornada: 3, equipo_local: "Túnez", equipo_visitante: "Países Bajos", fecha_hora: Timestamp.fromDate(new Date("2026-06-25T17:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_59", jornada: 3, equipo_local: "Paraguay", equipo_visitante: "Australia", fecha_hora: Timestamp.fromDate(new Date("2026-06-25T20:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_60", jornada: 3, equipo_local: "Turquía", equipo_visitante: "Estados Unidos", fecha_hora: Timestamp.fromDate(new Date("2026-06-25T20:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_61", jornada: 3, equipo_local: "Noruega", equipo_visitante: "Francia", fecha_hora: Timestamp.fromDate(new Date("2026-06-26T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_62", jornada: 3, equipo_local: "Senegal", equipo_visitante: "Irak", fecha_hora: Timestamp.fromDate(new Date("2026-06-26T13:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_63", jornada: 3, equipo_local: "Cabo Verde", equipo_visitante: "Arabia Saudita", fecha_hora: Timestamp.fromDate(new Date("2026-06-26T18:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_64", jornada: 3, equipo_local: "Uruguay", equipo_visitante: "España", fecha_hora: Timestamp.fromDate(new Date("2026-06-26T18:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_65", jornada: 3, equipo_local: "Egipto", equipo_visitante: "Irán", fecha_hora: Timestamp.fromDate(new Date("2026-06-26T21:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_66", jornada: 3, equipo_local: "Nueva Zelanda", equipo_visitante: "Bélgica", fecha_hora: Timestamp.fromDate(new Date("2026-06-26T21:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_67", jornada: 3, equipo_local: "Croacia", equipo_visitante: "Ghana", fecha_hora: Timestamp.fromDate(new Date("2026-06-27T15:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_68", jornada: 3, equipo_local: "Panamá", equipo_visitante: "Inglaterra", fecha_hora: Timestamp.fromDate(new Date("2026-06-27T15:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_69", jornada: 3, equipo_local: "Colombia", equipo_visitante: "Portugal", fecha_hora: Timestamp.fromDate(new Date("2026-06-27T17:30:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_70", jornada: 3, equipo_local: "RD Congo", equipo_visitante: "Uzbekistán", fecha_hora: Timestamp.fromDate(new Date("2026-06-27T17:30:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_71", jornada: 3, equipo_local: "Argelia", equipo_visitante: "Austria", fecha_hora: Timestamp.fromDate(new Date("2026-06-27T20:00:00-06:00")), estado_partido: "pendiente" },
    { id: "wc26_72", jornada: 3, equipo_local: "Jordania", equipo_visitante: "Argentina", fecha_hora: Timestamp.fromDate(new Date("2026-06-27T20:00:00-06:00")), estado_partido: "pendiente" }
];

export async function sembrarCalendario() {
    try {
        const partidosRef = collection(db, "partidos");
        let procesados = 0;

        for (const partido of partidosFaseGrupos) {
            const partidoDocRef = doc(partidosRef, partido.id);
            const snap = await getDoc(partidoDocRef);

            if (snap.exists() && snap.data().estado_partido === "finalizado") {
                await setDoc(partidoDocRef, { jornada: partido.jornada }, { merge: true });
            } else {
                await setDoc(partidoDocRef, {
                    equipo_local: partido.equipo_local,
                    equipo_visitante: partido.equipo_visitante,
                    fecha_hora: partido.fecha_hora,
                    estado_partido: partido.estado_partido,
                    jornada: partido.jornada
                }, { merge: true });
            }
            procesados++;
        }

        console.log(`✅ ¡Fase de grupos completa (${procesados} partidos) sincronizada de forma segura!`);
        return true;
    } catch (error) {
        console.error("❌ Error al inyectar el calendario:", error);
        return false;
    }
}