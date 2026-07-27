/**
 * UTILITAS
 * ========
 * Berisi fungsi-fungsi pembantu yang digunakan di seluruh halaman.
 */

/**
 * Format angka ke format Rupiah (IDR)
 * Contoh: 25000 -> "Rp 25.000"
 */
function formatRupiah(amount) {
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

/**
 * Format tanggal ke format Indonesia
 * Contoh: 2024-01-15 -> "15 Januari 2024"
 */
function formatDate(dateString) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

/**
 * Format tanggal singkat (untuk tabel/list)
 * Contoh: 2024-01-15 -> "15 Jan 2024"
 */
function formatDateShort(dateString) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
 */
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Mendapatkan bulan dan tahun saat ini
 * Contoh: { month: "01", year: "2024" }
 */
function getCurrentMonthYear() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString();
    return { month, year };
}

/**
 * Menampilkan loading spinner
 */
function showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'flex';
}

/**
 * Menyembunyikan loading spinner
 */
function hideLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

/**
 * Menampilkan pesan error
 */
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

/**
 * Menyembunyikan pesan error
 */
function hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

/**
 * Mendapatkan nama bulan dari angka (1-12)
 */
function getMonthName(monthNumber) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[parseInt(monthNumber) - 1] || '';
}

/**
 * Cek apakah user sedang login
 * Jika tidak, redirect ke halaman login
 */
function checkAuth() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

/**
 * Dark Mode Toggle
 */
function initDarkMode() {
    const toggleBtn = document.getElementById('darkModeToggle');
    if (!toggleBtn) return;

    // Cek preferensi tersimpan
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleBtn.textContent = '☀️';
    }

    // Event toggle
    toggleBtn.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            toggleBtn.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            toggleBtn.textContent = '☀️';
        }
    });
}

/**
 * Logout
 */
function initLogout() {
    const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtnProfile');
    logoutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                auth.signOut().then(() => {
                    window.location.href = 'login.html';
                }).catch(error => {
                    alert('Gagal logout: ' + error.message);
                });
            });
        }
    });
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('navbarMenu');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('active');
        });
    }
}

/**
 * Inisialisasi semua komponen UI umum
 */
function initCommonUI() {
    initDarkMode();
    initLogout();
    initMobileMenu();
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', function () {
    initCommonUI();
});

