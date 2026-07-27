/**
 * HALAMAN REGISTER
 * =================
 * Menangani proses pendaftaran pengguna baru.
 */

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');

    if (!registerForm) return;

    // Jika user sudah login, redirect ke dashboard
    auth.onAuthStateChanged(function (user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Ambil nilai form
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validasi
        if (!name || !email || !password || !confirmPassword) {
            showError('errorMessage', 'Semua field wajib diisi.');
            return;
        }

        if (password.length < 6) {
            showError('errorMessage', 'Password minimal 6 karakter.');
            return;
        }

        if (password !== confirmPassword) {
            showError('errorMessage', 'Konfirmasi password tidak sama.');
            return;
        }

        // Tampilkan loading
        hideError('errorMessage');
        showLoading('loadingIndicator');

        try {
            // Buat akun baru
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Simpan data user ke Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            });

            // Update profil display name
            await user.updateProfile({
                displayName: name
            });

            // Register berhasil, redirect ke dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            // Tangani error
            hideLoading('loadingIndicator');

            let message = 'Terjadi kesalahan. Silakan coba lagi.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Email sudah terdaftar. Silakan login.';
                    break;
                case 'auth/invalid-email':
                    message = 'Format email tidak valid.';
                    break;
                case 'auth/weak-password':
                    message = 'Password terlalu lemah. Minimal 6 karakter.';
                    break;
                case 'auth/operation-not-allowed':
                    message = 'Pendaftaran dengan email/password belum diaktifkan.';
                    break;
                default:
                    message = error.message;
            }

            showError('errorMessage', message);
        }
    });
});

