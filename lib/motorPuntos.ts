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