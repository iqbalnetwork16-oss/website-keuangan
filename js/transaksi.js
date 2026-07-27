/**
 * HALAMAN TRANSAKSI
 * ==================
 * CRUD transaksi pemasukan dan pengeluaran.
 */

// Variabel global untuk state
let currentUserId = null;
let allTransactions = [];
let editingTransactionId = null;
let deletingTransactionId = null;

document.addEventListener('DOMContentLoaded', function () {
    // Cek auth
    auth.onAuthStateChanged(async function (user) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        currentUserId = user.uid;
        
        // Set default date ke hari ini
        const dateInput = document.getElementById('date');
        if (dateInput) dateInput.value = getTodayDate();

        // Muat transaksi
        await loadTransactions();

        // Sembunyikan loading
        hideLoading('loadingIndicator');

        // Inisialisasi event listeners
        initEventListeners();
    });
});

/**
 * Inisialisasi semua event listeners
 */
function initEventListeners() {
    // Tombol tambah transaksi
    const addBtn = document.getElementById('addTransactionBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            openAddModal();
        });
    }

    // Form transaksi (submit)
    const form = document.getElementById('transactionForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Modal close
    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);

    const modalCancel = document.getElementById('modalCancel');
    if (modalCancel) modalCancel.addEventListener('click', closeModal);

    // Delete modal
    const deleteModalClose = document.getElementById('deleteModalClose');
    if (deleteModalClose) deleteModalClose.addEventListener('click', closeDeleteModal);

    const deleteCancel = document.getElementById('deleteCancel');
    if (deleteCancel) deleteCancel.addEventListener('click', closeDeleteModal);

    const deleteConfirm = document.getElementById('deleteConfirm');
    if (deleteConfirm) deleteConfirm.addEventListener('click', confirmDelete);

    // Filter event listeners
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', filterTransactions);

    const monthFilter = document.getElementById('monthFilter');
    if (monthFilter) monthFilter.addEventListener('change', filterTransactions);

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.addEventListener('change', filterTransactions);

    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) typeFilter.addEventListener('change', filterTransactions);

    // Tutup modal jika klik di luar
    window.addEventListener('click', function (e) {
        const modal = document.getElementById('transactionModal');
        const deleteModal = document.getElementById('deleteModal');
        if (e.target === modal) closeModal();
        if (e.target === deleteModal) closeDeleteModal();
    });
}



/**
 * Memuat semua transaksi dari Firestore
 * ========================================
 * Catatan: Tidak menggunakan orderBy() karena membutuhkan
 * composite index di Firebase. Menggunakan sort manual sebagai gantinya.
 */
async function loadTransactions() {
    try {
        // Query tanpa orderBy untuk menghindari kebutuhan index Firebase
        const snapshot = await db.collection('transactions')
            .where('uid', '==', currentUserId)
            .get();

        allTransactions = [];
        snapshot.forEach(doc => {
            allTransactions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sorting manual berdasarkan tanggal (descending)
        allTransactions.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        });

        renderTransactions(allTransactions);
        updateFilterCount();
    } catch (error) {
        console.error('Error loading transactions:', error);
        
        // Tampilkan pesan error yang jelas ke user
        const container = document.getElementById('transactionList');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-error" style="display: block;">
                    Gagal memuat transaksi: ${error.message || 'Terjadi kesalahan.'}
                    <br>
                    <strong>Kemungkinan penyebab:</strong>
                    <ol style="margin-top: 8px; padding-left: 20px;">
                        <li>Firestore Database belum dibuat di Firebase Console</li>
                        <li>Security Rules Firestore memblokir akses</li>
                        <li>Belum login dengan benar</li>
                    </ol>
                </div>
            `;
        }
    }
}

/**
 * Menampilkan daftar transaksi ke HTML
 */
function renderTransactions(transactions) {
    const container = document.getElementById('transactionList');
    
    if (!container) return;

    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-muted">Tidak ada transaksi.</p>';
        return;
    }

    let html = '';
    transactions.forEach(t => {
        const isIncome = t.type === 'pemasukan';
        const amountClass = isIncome ? 'pemasukan' : 'pengeluaran';
        const prefix = isIncome ? '+' : '-';

        html += `
            <div class="transaction-card">
                <div class="transaction-card-left">
                    <div class="transaction-card-icon ${t.type}">
                        ${isIncome ? '📈' : '📉'}
                    </div>
                    <div class="transaction-card-info">
                        <h4>${t.category || 'Tanpa Kategori'}</h4>
                        <p class="transaction-category">${t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</p>
                        ${t.note ? `<p class="transaction-note">${t.note}</p>` : ''}
                    </div>
                </div>
                <div class="transaction-card-right">
                    <div>
                        <div class="transaction-card-amount ${amountClass}">
                            ${prefix}${formatRupiah(t.amount)}
                        </div>
                        <div class="transaction-card-date">${formatDateShort(t.date)}</div>
                    </div>
                    <div class="transaction-actions">
                        <button class="btn-icon-sm edit" onclick="editTransaction('${t.id}')" title="Edit">✏️</button>
                        <button class="btn-icon-sm delete" onclick="deleteTransaction('${t.id}')" title="Hapus">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Filter transaksi berdasarkan input pencarian, bulan, kategori, dan tipe
 */
function filterTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const month = document.getElementById('monthFilter').value;
    const category = document.getElementById('categoryFilter').value;
    const type = document.getElementById('typeFilter').value;

    let filtered = allTransactions.filter(t => {
        // Filter search
        if (searchTerm) {
            const matchCategory = (t.category || '').toLowerCase().includes(searchTerm);
            const matchNote = (t.note || '').toLowerCase().includes(searchTerm);
            const matchAmount = t.amount.toString().includes(searchTerm);
            if (!matchCategory && !matchNote && !matchAmount) return false;
        }

        // Filter bulan
        if (month) {
            const tMonth = t.date.split('-')[1];
            if (tMonth !== month) return false;
        }

        // Filter kategori
        if (category && t.category !== category) return false;

        // Filter tipe
        if (type && t.type !== type) return false;

        return true;
    });

    renderTransactions(filtered);
}

/**
 * Update jumlah transaksi yang ditampilkan
 */
function updateFilterCount() {
    // Optional: tambahkan counter transaksi
}

/**
 * Buka modal untuk tambah transaksi
 */
function openAddModal() {
    editingTransactionId = null;
    document.getElementById('modalTitle').textContent = 'Tambah Transaksi';
    document.getElementById('transactionForm').reset();
    document.getElementById('transactionId').value = '';
    document.getElementById('date').value = getTodayDate();
    hideError('formError');
    document.getElementById('transactionModal').classList.add('show');
}

/**
 * Buka modal untuk edit transaksi
 */
function editTransaction(transactionId) {
    const transaction = allTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    editingTransactionId = transactionId;
    document.getElementById('modalTitle').textContent = 'Edit Transaksi';
    document.getElementById('transactionId').value = transactionId;
    
    // Set nilai form
    document.querySelector('input[name="type"][value="' + transaction.type + '"]').checked = true;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('category').value = transaction.category || '';
    document.getElementById('date').value = transaction.date;
    document.getElementById('note').value = transaction.note || '';

    hideError('formError');
    document.getElementById('transactionModal').classList.add('show');
}

/**
 * Tutup modal transaksi
 */
function closeModal() {
    document.getElementById('transactionModal').classList.remove('show');
    editingTransactionId = null;
}

/**
 * Handler submit form transaksi
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const type = document.querySelector('input[name="type"]:checked').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const note = document.getElementById('note').value.trim();
    const transactionId = document.getElementById('transactionId').value;

    // Validasi
    if (!amount || amount <= 0) {
        showError('formError', 'Nominal harus diisi dan lebih dari 0.');
        return;
    }
    if (!category) {
        showError('formError', 'Pilih kategori transaksi.');
        return;
    }
    if (!date) {
        showError('formError', 'Pilih tanggal transaksi.');
        return;
    }

    hideError('formError');
    showLoading('loadingIndicator');

    try {
        const transactionData = {
            uid: currentUserId,
            type: type,
            amount: Number(amount),
            category: category,
            date: date,
            note: note || '',
            updatedAt: new Date().toISOString()
        };

        if (editingTransactionId) {
            // Update transaksi yang sudah ada
            await db.collection('transactions').doc(editingTransactionId).update(transactionData);
        } else {
            // Tambah transaksi baru
            transactionData.createdAt = new Date().toISOString();
            await db.collection('transactions').add(transactionData);
        }

        // Tutup modal dan reload data
        closeModal();
        await loadTransactions();
    } catch (error) {
        console.error('Error saving transaction:', error);
        showError('formError', 'Gagal menyimpan transaksi. Silakan coba lagi.');
    } finally {
        hideLoading('loadingIndicator');
    }
}

/**
 * Buka modal konfirmasi hapus
 */
function deleteTransaction(transactionId) {
    deletingTransactionId = transactionId;
    document.getElementById('deleteModal').classList.add('show');
}

/**
 * Tutup modal konfirmasi hapus
 */
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    deletingTransactionId = null;
}

/**
 * Konfirmasi hapus transaksi
 */
async function confirmDelete() {
    if (!deletingTransactionId) return;

    try {
        await db.collection('transactions').doc(deletingTransactionId).delete();
        closeDeleteModal();
        await loadTransactions();
    } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Gagal menghapus transaksi. Silakan coba lagi.');
    }
}

