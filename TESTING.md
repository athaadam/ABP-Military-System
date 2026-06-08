# Panduan Running & Testing Lokal — ABP Military System

Dokumen ini menjelaskan cara menjalankan seluruh stack (backend, web frontend, mobile) di lokal beserta cara menjalankan testing yang tersedia.

---

## Daftar Isi

- [Prasyarat](#prasyarat)
- [1. Backend (Node.js + MySQL)](#1-backend-nodejs--mysql)
- [2. Web Frontend (React + Vite)](#2-web-frontend-react--vite)
- [3. Mobile (Flutter)](#3-mobile-flutter)
- [Troubleshooting](#troubleshooting)

---

## Prasyarat

Pastikan tools berikut sudah terinstal sebelum memulai:

| Tool | Versi Minimum | Link |
|------|---------------|------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Bawaan Node.js |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |
| Flutter SDK | 3.11.5+ | https://docs.flutter.dev/get-started/install |
| Dart SDK | 3.11.5+ | Bawaan Flutter |
| Git | latest | https://git-scm.com |

Cek instalasi:

```bash
node -v
npm -v
docker -v
flutter --version
```

---

## 1. Backend (Node.js + MySQL)

Backend berjalan sebagai container Docker (MySQL + Express API di port 3000).

### Setup & Jalankan

```bash
cd military-BE
```

**Buat file `.env`** (copy dari contoh):

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Isi `.env` (sudah sesuai docker-compose, tidak perlu diubah):

```env
DB_HOST=db
DB_USER=root
DB_PASS=rootpassword
DB_NAME=military_db
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

**Jalankan dengan Docker Compose:**

```bash
docker compose up --build
```

> Perintah ini akan membuat MySQL (`military_mysql`) dan backend API (`military_backend`) sekaligus. Database akan diinisialisasi otomatis dari `init.sql`.

**Cek API berjalan:**

```
GET http://localhost:3000/api
```

**Hentikan container:**

```bash
docker compose down
```

> Tambahkan flag `-v` untuk menghapus data MySQL juga: `docker compose down -v`

### Cek Log Backend

```bash
docker logs military_backend -f
docker logs military_mysql -f
```

### Testing Backend (Manual via Postman)

Backend belum memiliki automated test framework. Gunakan Postman collection yang sudah tersedia:

1. Buka Postman
2. Import file: `military-BE/postman_collection.json`
3. Set environment variable `base_url = http://localhost:3000/api`
4. Jalankan request satu per satu atau gunakan **Collection Runner**

---

## 2. Web Frontend (React + Vite)

### Setup

```bash
cd military-FE
npm install
```

**Buat file `.env`** (copy dari contoh):

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Pastikan isi `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Military System
VITE_ENVIRONMENT=development
```

> Pastikan backend sudah berjalan di port 3000 sebelum membuka web.

### Jalankan Dev Server

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:5173**

### Linting (Static Analysis)

Untuk mengecek kualitas kode dan potensi bug:

```bash
npm run lint
```

### Build Production (Smoke Test)

Pastikan tidak ada error TypeScript dan build berhasil:

```bash
npm run build
```

Output build akan ada di folder `dist/`. Jalankan preview:

```bash
npm run preview
```

Preview berjalan di: **http://localhost:4173**

### Alur Testing Manual Web

Setelah dev server berjalan, uji fitur-fitur berikut:

| Fitur | URL | Yang Dicek |
|-------|-----|------------|
| Login | `/login` | Form validasi, token tersimpan |
| Dashboard | `/dashboard` | Data statistik muncul |
| Inventory | `/inventory` | List barang, CRUD |
| Requests | `/requests` | Pengajuan permintaan |
| Units | `/units` | Data satuan |
| Warehouses | `/warehouses` | Data gudang |
| Statistics | `/statistics` | Grafik/chart tampil |

---

## 3. Mobile (Flutter)

### Setup

```bash
cd military_mobile
flutter pub get
```

Cek semua dependencies dan platform siap:

```bash
flutter doctor
```

Pastikan tidak ada issue kritis (tanda `[✓]`). Untuk Android, pastikan Android Studio / emulator sudah terkonfigurasi.

### Jalankan Aplikasi

**Di emulator/simulator:**

```bash
# Lihat device yang tersedia
flutter devices

# Jalankan di device tertentu
flutter run -d <device_id>

# Contoh: jalankan di Chrome (web)
flutter run -d chrome

# Contoh: jalankan di emulator Android
flutter run -d emulator-5554
```

**Sebelum menjalankan**, pastikan URL backend sudah benar di:
`lib/services/api_service.dart` — set base URL ke `http://10.0.2.2:3000/api` untuk Android emulator (10.0.2.2 adalah alias localhost dari emulator Android).

### Menjalankan Flutter Tests

Flutter menggunakan framework `flutter_test` yang sudah terkonfigurasi.

**Jalankan semua test:**

```bash
flutter test
```

**Jalankan test file tertentu:**

```bash
flutter test test/widget_test.dart
```

**Jalankan dengan verbose output:**

```bash
flutter test --reporter expanded
```

**Jalankan dengan coverage:**

```bash
flutter test --coverage
```

Report coverage akan tersimpan di `coverage/lcov.info`.

### Struktur Test

```
military_mobile/
└── test/
    └── widget_test.dart    # Widget test dasar (smoke test)
```

Test saat ini berupa smoke test default. Untuk menambahkan test baru, buat file di folder `test/` dengan format `*_test.dart`.

**Contoh menambahkan widget test:**

```dart
// test/login_page_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:military_mobile/pages/auth/login_page.dart';

void main() {
  testWidgets('Login page renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: LoginPage()));
    expect(find.text('Login'), findsOneWidget);
  });
}
```

### Analisis Kode Dart (Linting)

```bash
flutter analyze
```

---

## Troubleshooting

### Backend: MySQL container gagal start

```bash
# Hapus volume lama dan mulai ulang
docker compose down -v
docker compose up --build
```

### Web: `VITE_API_URL` tidak terbaca

Pastikan file `.env` ada di root folder `military-FE/` (bukan di subfolder) dan restart dev server setelah mengubah `.env`.

### Flutter: `flutter pub get` error

```bash
flutter clean
flutter pub get
```

### Flutter: Emulator tidak terdeteksi

```bash
# Cek ulang
flutter doctor -v
flutter devices
```

### CORS Error di web browser

Pastikan backend berjalan dan CORS sudah dikonfigurasi untuk `http://localhost:5173`. Cek konfigurasi di `military-BE/src/app.js`.

---

## Urutan Menjalankan (Full Stack)

Urutan yang direkomendasikan agar semua fitur berfungsi:

```
1. Jalankan backend:   cd military-BE  && docker compose up --build
2. Jalankan web:       cd military-FE  && npm run dev
3. Jalankan mobile:    cd military_mobile && flutter run -d <device>
```
