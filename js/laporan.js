/**
 * HALAMAN LAPORAN
 * ================
 * Menampilkan laporan keuangan dengan grafik menggunakan Chart.js.
 * Catatan: Tidak menggunakan orderBy() pada Firestore karena membutuhkan
 * composite index. Menggunakan sort manual sebagai gantinya.
 */

let currentUserId = null;
let categoryChart = null;
let monthlyChart = null;

document.addEventListener('DOMContentLoaded', function () {
    // Cek auth
    auth.onAuthStateChanged(async function (user) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        currentUserId = user.uid;
        await loadReportData();
        hideLoading('loadingIndicator');
        initEventListeners();
    });
});

/**
 * Inisialisasi event listeners
 */
function initEventListeners() {
    // Cetak
    const printBtn = document.getElementById('printBtn');
    if (printBtn) printBtn.addEventListener('click', printReport);

    // Export PDF
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportPDF);

    // Export CSV
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportCSV);
}

/**
 * Memuat data laporan dari Firestore
 */
async function loadReportData() {
    try {
        const snapshot = await db.collection('transactions')
            .where('uid', '==', currentUserId)
            .get();

        const transactions = [];
        snapshot.forEach(doc => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sorting manual descending by date
        transactions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        // Hitung ringkasan
        calculateSummary(transactions);

        // Buat grafik
        createCategoryChart(transactions);
        createMonthlyChart(transactions);

    } catch (error) {
        console.error('Error loading report data:', error);
    }
}

/**
 * Hitung dan tampilkan ringkasan keuangan
 */
function calculateSummary(transactions) {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'pemasukan') {
            totalIncome += Number(t.amount);
        } else {
            totalExpense += Number(t.amount);
        }
    });

    const balance = totalIncome - totalExpense;

    document.getElementById('totalIncome').textContent = formatRupiah(totalIncome);
    document.getElementById('totalExpense').textContent = formatRupiah(totalExpense);
    document.getElementById('totalBalance').textContent = formatRupiah(balance);
}

/**
 * Buat grafik pengeluaran per kategori (Pie/Doughnut)
 */
function createCategoryChart(transactions) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Filter hanya pengeluaran
    const expenses = transactions.filter(t => t.type === 'pengeluaran');

    // Group by kategori
    const categoryTotals = {};
    expenses.forEach(t => {
        const cat = t.category || 'Lainnya';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    const colors = generateColors(categories.length);

    // Hancurkan chart sebelumnya jika ada
    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 16,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return formatRupiah(context.parsed) + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Buat grafik pemasukan & pengeluaran per bulan (Bar)
 */
function createMonthlyChart(transactions) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    // Group by bulan
    const monthlyData = {};
    transactions.forEach(t => {
        const [year, month] = t.date.split('-');
        const key = year + '-' + month;
        
        if (!monthlyData[key]) {
            monthlyData[key] = { income: 0, expense: 0 };
        }

        if (t.type === 'pemasukan') {
            monthlyData[key].income += Number(t.amount);
        } else {
            monthlyData[key].expense += Number(t.amount);
        }
    });

    // Sort by date
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        return getMonthName(month) + ' ' + year;
    });
    const incomeData = sortedMonths.map(m => monthlyData[m].income);
    const expenseData = sortedMonths.map(m => monthlyData[m].expense);

    // Hancurkan chart sebelumnya jika ada
    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pemasukan',
                    data: incomeData,
                    backgroundColor: '#22C55E',
                    borderRadius: 6,
                    barPercentage: 0.6
                },
                {
                    label: 'Pengeluaran',
                    data: expenseData,
                    backgroundColor: '#EF4444',
                    borderRadius: 6,
                    barPercentage: 0.6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 16,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + formatRupiah(context.parsed);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'Rp' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.06)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Generate warna untuk grafik
 */
function generateColors(count) {
    const baseColors = [
        '#2563EB', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
        '#06B6D4', '#D946EF', '#10B981', '#EAB308', '#0EA5E9'
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
}

/**
 * Cetak laporan
 */
function printReport() {
    window.print();
}

/**
 * Export ke PDF (menggunakan window.print dengan simpan sebagai PDF)
 */
function exportPDF() {
    alert('Silakan gunakan fitur Cetak dan pilih "Simpan sebagai PDF" pada dialog printer.');
    window.print();
}

/**
 * Export ke CSV
 */
function exportCSV() {
    if (!currentUserId) return;

    db.collection('transactions')
        .where('uid', '==', currentUserId)
        .get()
        .then(snapshot => {
            let csv = 'Tanggal,Tipe,Kategori,Nominal,Catatan\n';
            
            // Convert to array and sort manually
            const transactions = [];
            snapshot.forEach(doc => {
                transactions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by date descending
            transactions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            transactions.forEach(t => {
                const date = t.date || '';
                const type = t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
                const category = t.category || '';
                const amount = t.amount || 0;
                const note = (t.note || '').replace(/,/g, ';'); // Hindari konflik CSV
                
                csv += `${date},${type},${category},${amount},${note}\n`;
            });

            // Buat blob dan download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'laporan-keuangan-' + getTodayDate() + '.csv';
            link.click();
            URL.revokeObjectURL(link.href);
        })
        .catch(error => {
            console.error('Error exporting CSV:', error);
            alert('Gagal export CSV.');
        });
}
