/**
 * AUTHENTICATION SHARED LOGIC
 * ===========================
 * Berisi fungsi auth yang digunakan login.js, register.js, dan halaman lainnya.
 */

/**
 * Mendapatkan data user dari Firestore
 */
async function getUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

/**
 * Cek status autentikasi dan redirect jika perlu
 * Dipanggil di halaman yang membutuhkan login (dashboard, transaksi, laporan, profil)
 */
function requireAuth() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Listen to auth state changes untuk semua halaman
auth.onAuthStateChanged(function (user) {
    // Logika per halaman ditangani di masing-masing file JS
    // Ini hanya untuk update global jika diperlukan
    if (user) {
        document.body.classList.add('logged-in');
    } else {
        document.body.classList.remove('logged-in');
    }
});

