import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, Timestamp } from "firebase/firestore";

// -------------------------------------------------------------
// INYECCIÓN DIRECTA Y OFICIAL DE DIECISEISAVOS (CALENDARIO FIFA)
// -------------------------------------------------------------
export async function calcularYGenerar16avos() {
    const llaves16avos = [
        // Domingo 28 de junio
        { id: "wc26_73", local: "Sudáfrica", vis: "Canadá", fecha: "2026-06-28T13:00:00-06:00" },

        // Lunes 29 de junio
        { id: "wc26_76", local: "Brasil", vis: "Japón", fecha: "2026-06-29T11:00:00-06:00" },
        { id: "wc26_74", local: "Alemania", vis: "Paraguay", fecha: "2026-06-29T14:30:00-06:00" },
        { id: "wc26_75", local: "Países Bajos", vis: "Marruecos", fecha: "2026-06-29T19:00:00-06:00" },

        // Martes 30 de junio
        { id: "wc26_78", local: "Costa de Marfil", vis: "Noruega", fecha: "2026-06-30T11:00:00-06:00" },
        { id: "wc26_77", local: "Francia", vis: "Suecia", fecha: "2026-06-30T15:00:00-06:00" },
        { id: "wc26_79", local: "México", vis: "Ecuador", fecha: "2026-06-30T19:00:00-06:00" },

        // Miércoles 1 de julio
        { id: "wc26_80", local: "Inglaterra", vis: "RD Congo", fecha: "2026-07-01T10:00:00-06:00" },
        { id: "wc26_82", local: "Bélgica", vis: "Senegal", fecha: "2026-07-01T14:00:00-06:00" },
        { id: "wc26_81", local: "Estados Unidos", vis: "Bosnia", fecha: "2026-07-01T18:00:00-06:00" },

        // Jueves 2 de julio
        { id: "wc26_84", local: "España", vis: "Austria", fecha: "2026-07-02T13:00:00-06:00" },
        { id: "wc26_83", local: "Portugal", vis: "Croacia", fecha: "2026-07-02T17:00:00-06:00" },
        { id: "wc26_85", local: "Suiza", vis: "Argelia", fecha: "2026-07-02T21:00:00-06:00" },

        // Viernes 3 de julio
        { id: "wc26_88", local: "Australia", vis: "Egipto", fecha: "2026-07-03T12:00:00-06:00" },
        { id: "wc26_86", local: "Argentina", vis: "Cabo Verde", fecha: "2026-07-03T16:00:00-06:00" },
        { id: "wc26_87", local: "Colombia", vis: "Ghana", fecha: "2026-07-03T19:00:00-06:00" }
    ];

    for (const llave of llaves16avos) {
        const fechaObj = new Date(llave.fecha);
        await setDoc(doc(db, "partidos", llave.id), {
            equipo_local: llave.local,
            equipo_visitante: llave.vis,
            jornada: 4,
            estado_partido: "pendiente",
            fecha_hora: fechaObj.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' }),
            fecha_original: Timestamp.fromDate(fechaObj)
        }, { merge: true });
    }

    return true;
}

// -------------------------------------------------------------
// OPERACIONES DE ARRASTRE DE BRACKET EN CASCADA 
// -------------------------------------------------------------

export async function generarOctavos() {
    const querySnapshot = await getDocs(collection(db, "partidos"));
    const partidos: Record<string, any> = {};
    querySnapshot.forEach(doc => { partidos[doc.id] = doc.data(); });

    const avanza = (id: string) => partidos[id]?.ganador_avanza || "Ganador P" + id.split("_")[1];

    const llaves = [
        { id: "wc26_89", local: avanza("wc26_73"), vis: avanza("wc26_75"), fecha: "2026-07-04T11:00:00-06:00" },
        { id: "wc26_90", local: avanza("wc26_74"), vis: avanza("wc26_77"), fecha: "2026-07-04T15:00:00-06:00" },
        { id: "wc26_91", local: avanza("wc26_76"), vis: avanza("wc26_78"), fecha: "2026-07-05T14:00:00-06:00" },
        { id: "wc26_92", local: avanza("wc26_79"), vis: avanza("wc26_80"), fecha: "2026-07-05T18:00:00-06:00" },
        { id: "wc26_93", local: avanza("wc26_83"), vis: avanza("wc26_84"), fecha: "2026-07-06T13:00:00-06:00" },
        { id: "wc26_94", local: avanza("wc26_81"), vis: avanza("wc26_82"), fecha: "2026-07-06T18:00:00-06:00" },
        { id: "wc26_95", local: avanza("wc26_86"), vis: avanza("wc26_88"), fecha: "2026-07-07T10:00:00-06:00" },
        { id: "wc26_96", local: avanza("wc26_85"), vis: avanza("wc26_87"), fecha: "2026-07-07T14:00:00-06:00" }
    ];

    for (const l of llaves) {
        const fechaObj = new Date(l.fecha);
        await setDoc(doc(db, "partidos", l.id), {
            equipo_local: l.local,
            equipo_visitante: l.vis,
            jornada: 5,
            estado_partido: "pendiente",
            fecha_hora: fechaObj.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' }),
            fecha_original: Timestamp.fromDate(fechaObj)
        }, { merge: true });
    }
    return true;
}

export async function generarCuartos() {
    const querySnapshot = await getDocs(collection(db, "partidos"));
    const partidos: Record<string, any> = {};
    querySnapshot.forEach(doc => { partidos[doc.id] = doc.data(); });

    const avanza = (id: string) => partidos[id]?.ganador_avanza || "Ganador P" + id.split("_")[1];

    // 🔥 HORARIOS CORREGIDOS SEGÚN CALENDARIO OFICIAL FIFA
    const llaves = [
        // Jueves 9 de julio
        { id: "wc26_97", local: avanza("wc26_90"), vis: avanza("wc26_89"), fecha: "2026-07-09T14:00:00-06:00" }, // Francia vs Marruecos

        // Viernes 10 de julio
        { id: "wc26_98", local: avanza("wc26_93"), vis: avanza("wc26_94"), fecha: "2026-07-10T13:00:00-06:00" }, // España vs Bélgica

        // Sábado 11 de julio
        { id: "wc26_99", local: avanza("wc26_91"), vis: avanza("wc26_92"), fecha: "2026-07-11T15:00:00-06:00" }, // Noruega vs Inglaterra

        // Sábado 11 de julio
        { id: "wc26_100", local: avanza("wc26_95"), vis: avanza("wc26_96"), fecha: "2026-07-11T19:00:00-06:00" }  // Argentina vs Suiza
    ];

    for (const l of llaves) {
        // Convertimos el string a Date real para que Firebase lo procese bien
        const fechaObj = new Date(l.fecha);
        await setDoc(doc(db, "partidos", l.id), {
            equipo_local: l.local,
            equipo_visitante: l.vis,
            jornada: 6,
            estado_partido: "pendiente",
            fecha_hora: fechaObj.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' }),
            fecha_original: Timestamp.fromDate(fechaObj)
        }, { merge: true });
    }

    return true;
}

export async function generarSemis() {
    const querySnapshot = await getDocs(collection(db, "partidos"));
    const partidos: Record<string, any> = {};
    querySnapshot.forEach(doc => { partidos[doc.id] = doc.data(); });

    const avanza = (id: string) => partidos[id]?.ganador_avanza || "Ganador P" + id.split("_")[1];

    const llaves = [
        { id: "wc26_101", local: avanza("wc26_97"), vis: avanza("wc26_98") },
        { id: "wc26_102", local: avanza("wc26_99"), vis: avanza("wc26_100") }
    ];

    // 🔥 CORRECCIÓN: La hora oficial para ambas semifinales es 13:00 CST
    let baseFecha = new Date("2026-07-14T13:00:00-06:00");

    for (const l of llaves) {
        await setDoc(doc(db, "partidos", l.id), {
            equipo_local: l.local,
            equipo_visitante: l.vis,
            jornada: 7,
            estado_partido: "pendiente",
            fecha_hora: baseFecha.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' }),
            fecha_original: Timestamp.fromDate(baseFecha)
        }, { merge: true });

        // Suma 1 día exacto para el partido del miércoles 15 de julio a las 13:00
        baseFecha.setDate(baseFecha.getDate() + 1);
    }
    return true;
}

export async function generarFinal() {
    const querySnapshot = await getDocs(collection(db, "partidos"));
    const partidos: Record<string, any> = {};
    querySnapshot.forEach(doc => { partidos[doc.id] = doc.data(); });

    const avanza = (id: string) => partidos[id]?.ganador_avanza || "Ganador P" + id.split("_")[1];

    await setDoc(doc(db, "partidos", "wc26_103"), {
        equipo_local: avanza("wc26_101"),
        equipo_visitante: avanza("wc26_102"),
        jornada: 8, // La gran final es jornada 8
        estado_partido: "pendiente",
        fecha_hora: "Dom 19 Jul, 2:00 p.m.",
        fecha_original: Timestamp.fromDate(new Date("2026-07-19T14:00:00-06:00"))
    }, { merge: true });
    return true;
}