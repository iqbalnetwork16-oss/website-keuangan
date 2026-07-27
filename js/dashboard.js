/**
 * HALAMAN DASHBOARD
 * ==================
 * Menampilkan ringkasan keuangan pengguna.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Cek auth
    auth.onAuthStateChanged(async function (user) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Tampilkan nama user
        const userNameEl = document.getElementById('userName');
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

        // Muat data dashboard
        await loadDashboardData(user.uid);

        // Sembunyikan loading
        hideLoading('loadingIndicator');
    });
});

/**
 * Memuat data dashboard dari Firestore
 */
async function loadDashboardData(uid) {
    try {
        // Ambil semua transaksi user
        const snapshot = await db.collection('transactions')
            .where('uid', '==', uid)
            .orderBy('date', 'desc')
            .get();

        const transactions = [];
        snapshot.forEach(doc => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Hitung total saldo, pemasukan, pengeluaran
        let totalIncome = 0;
        let totalExpense = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let monthlyIncome = 0;
        let monthlyExpense = 0;

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

            if (t.type === 'pemasukan') {
                totalIncome += Number(t.amount);
                if (isCurrentMonth) monthlyIncome += Number(t.amount);
            } else {
                totalExpense += Number(t.amount);
                if (isCurrentMonth) monthlyExpense += Number(t.amount);
            }
        });

        const balance = totalIncome - totalExpense;

        // Update UI
        document.getElementById('currentBalance').textContent = formatRupiah(balance);
        document.getElementById('monthlyIncome').textContent = formatRupiah(monthlyIncome);
        document.getElementById('monthlyExpense').textContent = formatRupiah(monthlyExpense);
        document.getElementById('totalTransactions').textContent = transactions.length;

        // Tampilkan 5 transaksi terbaru
        displayRecentTransactions(transactions.slice(0, 5));

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        document.getElementById('recentTransactions').innerHTML = 
            '<p class="text-muted">Gagal memuat data. Silakan refresh halaman.</p>';
    }
}

/**
 * Menampilkan daftar transaksi terbaru di dashboard
 */
function displayRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    
    if (!container) return;

    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-muted">Belum ada transaksi.</p>';
        return;
    }

    let html = '';
    transactions.forEach(t => {
        const isIncome = t.type === 'pemasukan';
        const icon = isIncome ? '📈' : '📉';
        const iconClass = isIncome ? 'income-icon' : 'expense-icon';
        const amountClass = isIncome ? 'income' : 'expense';
        const prefix = isIncome ? '+' : '-';

        html += `
            <div class="transaction-item">
                <div class="transaction-item-left">
                    <div class="transaction-icon ${iconClass}">${icon}</div>
                    <div class="transaction-detail">
                        <h4>${t.category || 'Tanpa Kategori'}</h4>
                        <p>${t.note ? t.note : formatDateShort(t.date)}</p>
                    </div>
                </div>
                <div class="transaction-item-right">
                    <div class="transaction-amount ${amountClass}">
                        ${prefix} ${formatRupiah(t.amount)}
                    </div>
                    <small class="text-muted">${formatDateShort(t.date)}</small>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

