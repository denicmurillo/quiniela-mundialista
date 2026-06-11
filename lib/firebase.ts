// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 🛡️ CONTROL DE SEGURIDAD PARA EL COMPILADOR EN VERCEL (BUILD TIME)
const esLlaveValida = typeof window !== "undefined"
    ? !!firebaseConfig.apiKey
    : !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

let app: any;
let db: any;
let auth: any;
let analytics: any = null;

if (esLlaveValida) {
    // Inicializar Firebase Real (Evita duplicados en Next.js)
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);

    // Inicializamos Analytics SOLO si estamos del lado del cliente (navegador)
    if (typeof window !== "undefined") {
        isSupported().then((supported) => {
            if (supported) {
                analytics = getAnalytics(app);
            }
        });
    }
} else {
    // Proxies falsos temporales para engañar al proceso de compilación de Next.js
    app = {};
    db = {};
    auth = {};
}

export { app, db, auth, analytics };