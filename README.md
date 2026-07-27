# 💰 KeuanganKu - Aplikasi Rekap Keuangan Pribadi

Aplikasi web sederhana untuk mencatat pemasukan dan pengeluaran keuangan pribadi. Dibangun dengan **Vanilla JavaScript**, **Firebase Authentication**, dan **Firestore Database**.

## ✨ Fitur

- 🔐 **Autentikasi Pengguna** — Login & Register dengan Firebase Authentication
- 📊 **Dashboard** — Ringkasan saldo, pemasukan, pengeluaran, dan transaksi terbaru
- 📝 **CRUD Transaksi** — Tambah, edit, hapus, cari, filter transaksi
- 📈 **Laporan** — Grafik pengeluaran per kategori & grafik bulanan (Chart.js)
- 🌙 **Dark Mode** — Toggle tema gelap/terang
- 📄 **Export CSV** — Download data transaksi ke CSV
- 📱 **Responsive** — Tampilan optimal di desktop & mobile

## 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| HTML5     | Struktur halaman |
| CSS3      | Styling (tanpa framework) |
| Vanilla JavaScript (ES6) | Logika aplikasi |
| Firebase Authentication | Login & Register |
| Firebase Firestore | Database |
| Chart.js  | Grafik laporan |
| Google Fonts (Inter) | Tipografi |

## 📁 Struktur Folder

```
website-keuangan/
├── index.html          # Halaman utama (landing page)
├── login.html          # Halaman login
├── register.html       # Halaman register
├── dashboard.html      # Halaman dashboard
├── transaksi.html      # Halaman CRUD transaksi
├── laporan.html        # Halaman laporan + grafik
├── profil.html         # Halaman profil pengguna
├── css/
│   ├── style.css       # CSS utama (global)
│   ├── login.css       # CSS halaman auth
│   ├── dashboard.css   # CSS dashboard
│   ├── transaksi.css   # CSS transaksi
│   ├── laporan.css     # CSS laporan
│   └── profil.css      # CSS profil
├── js/
│   ├── firebase-config.js  # Konfigurasi Firebase
│   ├── utils.js            # Fungsi utilitas
│   ├── auth.js             # Shared auth logic
│   ├── login.js            # Login handler
│   ├── register.js         # Register handler
│   ├── dashboard.js        # Dashboard logic
│   ├── transaksi.js        # CRUD transaksi
│   ├── laporan.js          # Laporan & grafik
│   └── profil.js           # Profil & ganti password
├── assets/
│   ├── images/
│   └── icons/
├── README.md
└── .gitignore
```

## 🚀 Cara Menjalankan

1. **Clone repository**

```bash
git clone https://github.com/iqbalnetwork16-oss/website-keuangan.git
cd website-keuangan
```

2. **Buka dengan browser**

Cukup buka file `index.html` di browser. Atau gunakan live server:

```bash
# Dengan Python (built-in)
python -m http.server 8000

# Dengan VS Code Live Server
# Klik kanan index.html > Open with Live Server
```

3. **Setup Firebase** (lihat panduan di bawah)

## 🔥 Cara Setup Firebase

### 1. Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik **Add project**
3. Masukkan nama project (contoh: `keuanganku`)
4. Ikuti langkah-langkahnya hingga selesai

### 2. Aktifkan Authentication

1. Di sidebar kiri, klik **Build > Authentication**
2. Klik **Get started**
3. Pilih tab **Sign-in method**
4. Klik **Email/Password**
5. Aktifkan **Enable**, lalu klik **Save**

### 3. Buat Firestore Database

1. Di sidebar kiri, klik **Build > Firestore Database**
2. Klik **Create database**
3. Pilih mode **Start in test mode** (untuk development)
4. Pilih region terdekat (misal: `asia-southeast2`)
5. Klik **Create**

### 4. Dapatkan Konfigurasi Firebase

1. Di Firebase Console, klik ikon **gear** > **Project settings**
2. Scroll ke **Your apps**
3. Klik **Add app** > **Web** (icon `</>`)
4. Beri nama app (contoh: `keuanganku-web`)
5. Copy objek `firebaseConfig` yang muncul
6. Buka file `js/firebase-config.js` di project
7. Ganti nilai placeholder dengan konfigurasi Firebase Anda:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "project-123.firebaseapp.com",
    projectId: "project-123",
    storageBucket: "project-123.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### 5. Atur Firestore Security Rules

Di Firestore, buka tab **Rules** dan gunakan aturan berikut:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /transactions/{transaction} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

## 🌐 Cara Deploy ke Cloudflare Pages

### Persiapan

1. Push semua kode ke GitHub:

```bash
git add .
git commit -m "Initial Project"
git push origin main
```

### Deploy Manual

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Klik **Pages** di sidebar
3. Klik **Create a project** > **Connect to Git**
4. Pilih repository `website-keuangan`
5. Pengaturan build:
   - **Framework preset**: None
   - **Build command**: (kosongkan)
   - **Build output directory**: (kosongkan atau `/`)
6. Klik **Save and Deploy**

### Deploy via Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages project create website-keuangan
wrangler pages deploy . --project-name=website-keuangan
```

## 📝 Penjelasan Halaman

### Halaman Utama (`index.html`)
Landing page dengan hero section dan fitur-fitur unggulan. Navigasi ke halaman login/register.

### Login (`login.html`)
Form login dengan validasi. Fitur "Lupa Password" mengirim email reset via Firebase.

### Register (`register.html`)
Form pendaftaran dengan validasi lengkap. Setelah register, data user disimpan di Firestore.

### Dashboard (`dashboard.html`)
Ringkasan keuangan: saldo, pemasukan bulan ini, pengeluaran bulan ini, 5 transaksi terbaru.

### Transaksi (`transaksi.html`)
CRUD transaksi dengan fitur:
- Tambah, edit, hapus transaksi
- Pencarian teks
- Filter bulan, kategori, tipe
- Konfirmasi sebelum hapus

### Laporan (`laporan.html`)
Laporan keuangan dengan:
- Ringkasan total pemasukan, pengeluaran, saldo
- Grafik doughnut pengeluaran per kategori
- Grafik bar pemasukan & pengeluaran per bulan
- Tombol cetak, export PDF, export CSV

### Profil (`profil.html`)
Informasi profil dan pengaturan:
- Nama & email
- Ganti password (dengan re-autentikasi)
- Logout

## 🎨 Warna Tema

| Warna | Hex | Penggunaan |
|-------|-----|------------|
| Biru Utama | `#2563EB` | Tombol, link, aksen |
| Hijau | `#22C55E` | Pemasukan |
| Merah | `#EF4444` | Pengeluaran |
| Abu-abu Muda | `#F5F7FA` | Background |

## 📄 Lisensi

Proyek ini dibuat untuk tujuan belajar. Silakan gunakan dan modifikasi sesuai kebutuhan.

