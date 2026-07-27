/**
 * Konfigurasi Firebase
 * =====================
 * Berisi konfigurasi Firebase untuk menghubungkan aplikasi
 * dengan project Firebase "website-keuangan-8b737".
 * 
 * Layanan yang digunakan:
 * - Firebase Authentication (Email/Password)
 * - Firestore Database
 * 
 * Sumber konfigurasi: Firebase Console > Project Settings > General > Your apps
 */

const firebaseConfig = {
    apiKey: "AIzaSyAzVYTnjEus86Xs0JYvtfc7pGhO_TmZ9jM",
    authDomain: "website-keuangan-8b737.firebaseapp.com",
    projectId: "website-keuangan-8b737",
    storageBucket: "website-keuangan-8b737.firebasestorage.app",
    messagingSenderId: "953759510314",
    appId: "1:953759510314:web:7be4db6cb5f9488ae9b853",
    measurementId: "G-3G9NQWN72V"
};

// Inisialisasi Firebase dengan compat SDK (via CDN)
firebase.initializeApp(firebaseConfig);

// Inisialisasi Auth & Firestore untuk digunakan di seluruh halaman
const auth = firebase.auth();
const db = firebase.firestore();
