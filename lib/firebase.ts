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