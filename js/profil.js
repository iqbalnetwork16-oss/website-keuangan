/**
 * HALAMAN PROFIL
 * ===============
 * Menampilkan dan mengelola profil pengguna.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Cek auth
    auth.onAuthStateChanged(async function (user) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Tampilkan data profil
        const userNameEl = document.getElementById('profileName');
        const userEmailEl = document.getElementById('profileEmail');

        if (userNameEl) {
            const userData = await getUserData(user.uid);
            if (userData && userData.name) {
                userNameEl.textContent = userData.name;
            } else if (user.displayName) {
                userNameEl.textContent = user.displayName;
            } else {
                userNameEl.textContent = 'Pengguna';
            }
        }

        if (userEmailEl) {
            userEmailEl.textContent = user.email || 'Email tidak tersedia';
        }

        // Sembunyikan loading
        hideLoading('loadingIndicator');

        // Inisialisasi event listeners
        initEventListeners(user);
    });
});

/**
 * Inisialisasi event listeners untuk halaman profil
 */
function initEventListeners(user) {
    // Ganti password
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function () {
            openPasswordModal();
        });
    }

    // Form ganti password
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handlePasswordChange(user);
        });
    }

    // Modal close
    const passwordModalClose = document.getElementById('passwordModalClose');
    if (passwordModalClose) passwordModalClose.addEventListener('click', closePasswordModal);

    const passwordCancel = document.getElementById('passwordCancel');
    if (passwordCancel) passwordCancel.addEventListener('click', closePasswordModal);

    // Tutup modal jika klik di luar
    window.addEventListener('click', function (e) {
        const modal = document.getElementById('passwordModal');
        if (e.target === modal) closePasswordModal();
    });

    // Logout di profil
    const logoutBtn = document.getElementById('logoutBtnProfile');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            }).catch(error => {
                alert('Gagal logout: ' + error.message);
            });
        });
    }
}

/**
 * Buka modal ganti password
 */
function openPasswordModal() {
    document.getElementById('passwordForm').reset();
    hideError('passwordError');
    hideError('passwordSuccess');
    document.getElementById('passwordModal').classList.add('show');
}

/**
 * Tutup modal ganti password
 */
function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('show');
}

/**
 * Proses ganti password
 */
async function handlePasswordChange(user) {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Validasi
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showError('passwordError', 'Semua field wajib diisi.');
        return;
    }

    if (newPassword.length < 6) {
        showError('passwordError', 'Password baru minimal 6 karakter.');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showError('passwordError', 'Konfirmasi password baru tidak sama.');
        return;
    }

    hideError('passwordError');
    hideError('passwordSuccess');

    // Tampilkan loading
    const submitBtn = document.querySelector('#passwordForm .btn-primary');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses...';
    }

    try {
        // Re-autentikasi user dengan password saat ini
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        await user.reauthenticateWithCredential(credential);

        // Update password
        await user.updatePassword(newPassword);

        // Tampilkan sukses
        const successEl = document.getElementById('passwordSuccess');
        if (successEl) {
            successEl.textContent = 'Password berhasil diubah!';
            successEl.style.display = 'block';
        }

        // Reset form
        document.getElementById('passwordForm').reset();

        // Tutup modal setelah 2 detik
        setTimeout(() => {
            closePasswordModal();
        }, 2000);

    } catch (error) {
        let message = 'Gagal mengubah password.';
        
        switch (error.code) {
            case 'auth/wrong-password':
                message = 'Password saat ini salah.';
                break;
            case 'auth/weak-password':
                message = 'Password baru terlalu lemah.';
                break;
            case 'auth/requires-recent-login':
                message = 'Silakan logout dan login kembali untuk mengubah password.';
                break;
            default:
                message = error.message;
        }

        showError('passwordError', message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan';
        }
    }
}

