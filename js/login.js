/**
 * HALAMAN LOGIN
 * =============
 * Menangani proses login pengguna.
 */

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) return;

    // Jika user sudah login, redirect ke dashboard
    auth.onAuthStateChanged(function (user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Ambil nilai form
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validasi
        if (!email) {
            showError('errorMessage', 'Email wajib diisi.');
            return;
        }

        if (password.length < 6) {
            showError('errorMessage', 'Password minimal 6 karakter.');
            return;
        }

        // Tampilkan loading
        hideError('errorMessage');
        showLoading('loadingIndicator');

        try {
            // Proses login
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Login berhasil, redirect ke dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            // Tangani error
            hideLoading('loadingIndicator');
            
            let message = 'Terjadi kesalahan. Silakan coba lagi.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'Email tidak terdaftar. Silakan daftar terlebih dahulu.';
                    break;
                case 'auth/wrong-password':
                    message = 'Password salah. Silakan coba lagi.';
                    break;
                case 'auth/invalid-email':
                    message = 'Format email tidak valid.';
                    break;
                case 'auth/user-disabled':
                    message = 'Akun ini telah dinonaktifkan.';
                    break;
                case 'auth/too-many-requests':
                    message = 'Terlalu banyak percobaan. Silakan coba beberapa saat lagi.';
                    break;
                default:
                    message = error.message;
            }
            
            showError('errorMessage', message);
        }
    });

    // Fitur Lupa Password
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', async function (e) {
            e.preventDefault();
            
            const email = prompt('Masukkan email Anda untuk mereset password:');
            if (!email) return;

            try {
                await auth.sendPasswordResetEmail(email);
                alert('Link reset password telah dikirim ke ' + email + '. Silakan cek email Anda.');
            } catch (error) {
                let message = 'Gagal mengirim email reset.';
                if (error.code === 'auth/user-not-found') {
                    message = 'Email tidak terdaftar.';
                } else if (error.code === 'auth/invalid-email') {
                    message = 'Format email tidak valid.';
                }
                alert(message);
            }
        });
    }
});

