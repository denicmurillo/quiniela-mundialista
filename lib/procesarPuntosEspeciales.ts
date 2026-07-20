import { collection, getDocs, doc, writeBatch, setDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

// 1. Sanitización de texto (Quita mayúsculas y tildes)
const limpiarTexto = (texto: string) => {
    if (!texto) return "";
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};

// 2. Motor de Coincidencia Inteligente
const esCoincidencia = (oficial: string, usuario: string) => {
    const strOficial = limpiarTexto(oficial);
    const strUser = limpiarTexto(usuario);

    if (strUser === "") return false;

    // Si escribieron exactamente lo mismo
    if (strOficial === strUser) return true;

    // Si el usuario escribió solo el apellido o una parte (ej. oficial: "kylian mbappe", user: "mbappe")
    if (strUser.length >= 4 && strOficial.includes(strUser)) return true;

    // Viceversa, si el usuario escribió de más (ej. oficial: "espana", user: "la seleccion de espana")
    if (strOficial.length >= 4 && strUser.includes(strOficial)) return true;

    return false;
};

export async function asignarPuntosEspeciales(campeonOficial: string, golesOficial: string, mvpOficial: string) {
    try {
        // Guardar los resultados oficiales exactos en admin para el registro histórico
        const configRef = doc(db, "admin", "resultadosEspeciales");
        await setDoc(configRef, {
            campeon: campeonOficial,
            goles: golesOficial,
            mvp: mvpOficial,
            procesado: true
        });

        // Obtener predicciones e inicializar Batch
        const prediccionesSnap = await getDocs(collection(db, "predicciones_especiales"));
        const batch = writeBatch(db);

        prediccionesSnap.forEach((predDoc) => {
            const data = predDoc.data();
            let puntosExtra = 0;

            // Evaluamos con nuestra función inteligente
            if (esCoincidencia(campeonOficial, data.campeon)) puntosExtra += 3;
            if (esCoincidencia(golesOficial, data.goles)) puntosExtra += 3;
            if (esCoincidencia(mvpOficial, data.mvp)) puntosExtra += 3;

            // Asignar puntos al usuario correspondiente
            if (puntosExtra > 0 && data.usuario_id) {
                const usuarioRef = doc(db, "usuarios", data.usuario_id);
                batch.update(usuarioRef, {
                    puntaje_total: increment(puntosExtra)
                });
            }
        });

        // Ejecutar las actualizaciones en la base de datos
        await batch.commit();

        return { success: true, message: "¡Puntos calculados con éxito! Se aplicó el filtro inteligente de coincidencias." };

    } catch (error) {
        console.error("Error al asignar puntos especiales:", error);
        return { success: false, message: "Hubo un error de conexión al procesar los puntos." };
    }
}