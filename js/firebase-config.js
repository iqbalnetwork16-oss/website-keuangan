/**
 * Konfigurasi Firebase
 * =====================
 * 
 * CARA SETUP:
 * 1. Buka https://console.firebase.google.com
 * 2. Buat project baru
 * 3. Masuk ke Project Settings > General > Your apps > Web app
 * 4. Copy konfigurasi di bawah ini
 * 5. Ganti nilai placeholder dengan konfigurasi Firebase Anda
 * 
 * PASTikan:
 * - Authentication (Email/Password) sudah diaktifkan
 * - Firestore Database sudah dibuat
 * 
 * NOTE: File ini aman di-commit karena hanya berisi placeholder.
 * Ganti nilainya dengan konfigurasi Firebase asli Anda secara lokal.
 */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Inisialisasi Auth & Firestore
const auth = firebase.auth();
const db = firebase.firestore();

