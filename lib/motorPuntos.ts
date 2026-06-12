import { doc, updateDoc, getDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

export function calcularPuntos(
    pronosticoLocal: number,
    pronosticoVisitante: number,
    resultadoRealLocal: number,
    resultadoRealVisitante: number
): number {
    if (pronosticoLocal === resultadoRealLocal && pronosticoVisitante === resultadoRealVisitante) {
        return 3;
    }
    const tendenciaReal = Math.sign(resultadoRealLocal - resultadoRealVisitante);
    const tendenciaPronostico = Math.sign(pronosticoLocal - pronosticoVisitante);

    if (tendenciaReal === tendenciaPronostico) {
        return 1;
    }
    return 0;
}

export async function procesarPuntosDePrediccion(
    prediccionId: string,
    usuarioId: string,
    pronosticoLocal: number,
    pronosticoVisitante: number,
    realLocal: number,
    realVisitante: number,
    jornada: number // NUEVO PARÁMETRO: Necesitamos saber de qué jornada es el partido
) {
    const puntosNuevos = calcularPuntos(pronosticoLocal, pronosticoVisitante, realLocal, realVisitante);
    const prediccionRef = doc(db, "predicciones", prediccionId);
    const prediccionSnap = await getDoc(prediccionRef);

    // LÓGICA IDEMPOTENTE: Revisamos si ya le habíamos dado puntos antes por este partido
    let puntosAnteriores = 0;
    if (prediccionSnap.exists()) {
        puntosAnteriores = prediccionSnap.data().puntos_ganados || 0;
    }

    // Calculamos la diferencia (si corriges un partido de 0 a 3 puntos, la diferencia es +3)
    const diferencia = puntosNuevos - puntosAnteriores;

    // Actualizamos el registro de la predicción con el puntaje final
    await updateDoc(prediccionRef, {
        puntos_ganados: puntosNuevos
    });

    // Solo tocamos el perfil del usuario si los puntos realmente cambiaron
    if (diferencia !== 0) {
        const usuarioRef = doc(db, "usuarios", usuarioId);

        // Creamos la llave dinámica: "puntaje_j1", "puntaje_j2", etc.
        const campoJornada = jornada > 3 ? "puntaje_elim" : `puntaje_j${jornada}`;

        await updateDoc(usuarioRef, {
            puntaje_total: increment(diferencia),
            [campoJornada]: increment(diferencia) // Incrementamos también el contador de la jornada específica
        });
    }
}