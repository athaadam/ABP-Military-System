# ABP Military System

Sistem manajemen logistik militer yang terdiri dari **Backend API**, **Frontend Web**, dan **Mobile App (Android/Flutter)**.

---

## Struktur Proyek

```
ABP-Military-System/
├── military-BE/        # Backend Node.js + Express
├── military-FE/        # Frontend React + Vite
└── military_mobile/    # Mobile Flutter (Android)
```

---

## Prerequisites

Pastikan semua tools berikut sudah terinstall sebelum mulai:

| Tool | Versi Minimum | Cek |
|------|--------------|-----|
| [Node.js](https://nodejs.org/) | v18+ | `node --version` |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | v24+ | `docker --version` |
| [Flutter](https://docs.flutter.dev/get-started/install) | v3.10+ | `flutter --version` |
| [Git](https://git-scm.com/) | v2+ | `git --version` |

---

## 1. Backend + Database (Docker)

Backend berjalan di dalam Docker bersama MySQL.

### Langkah

```bash
cd military-BE
docker compose up -d --build
```

> **Catatan:** Jika port `3306` sudah dipakai MySQL lokal, edit `docker-compose.yml` baris `"3306:3306"` menjadi `"3307:3306"` lalu jalankan ulang.

Tunggu hingga container sehat, lalu cek:

```bash
docker ps
# military_backend   → Up (port 3000)
# military_mysql     → Up (healthy)
```

Jika backend sudah up, restart container backend sekali agar koneksi DB terbentuk:

```bash
docker restart military_backend
```

Verifikasi backend berjalan:

```bash
curl http://localhost:3000/api
# {"message":"API route jalan 🚀"}
```

### Default Credentials

Akun superadmin dibuat otomatis dari `init.sql`:

| Field | Value |
|-------|-------|
| Email | `superadmin@military.com` |
| Password | `password123` |
| Role | `superadmin` |

> Jika login gagal (hash tidak cocok), reset password via Docker:
> ```bash
> # 1. Generate hash baru untuk password pilihan kamu
> cd military-BE
> node -e "const b=require('bcryptjs'); console.log(b.hashSync('admin123',10))"
>
> # 2. Update di database (ganti HASH dengan output di atas)
> docker exec military_mysql mysql -u root -prootpassword military_db \
>   -e "UPDATE user SET password='HASH' WHERE email='superadmin@military.com';"
> ```

### Menghentikan Backend

```bash
cd military-BE
docker compose down
```

---

## 2. Frontend Web (React + Vite)

### Langkah

```bash
cd military-FE
npm install
npm run dev
```

Buka browser: **http://localhost:5173**

Frontend otomatis konek ke backend di `http://localhost:3000/api`. Jika backend berjalan di port berbeda, buat file `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Build Production

```bash
npm run build
```

---

## 3. Mobile App (Flutter Android)

### Persiapan

```bash
cd military_mobile
flutter pub get
```

### Konfigurasi API URL

Edit file [military_mobile/lib/services/api_service.dart](military_mobile/lib/services/api_service.dart) baris 5:

| Target | URL yang dipakai |
|--------|-----------------|
| Android Emulator | `http://10.0.2.2:3000/api` |
| HP fisik (USB/WiFi) | `http://<IP_PC>:3000/api` |

Cari IP PC kamu:
- **Windows:** `ipconfig` → cari IPv4 di adapter Wi-Fi
- **Mac/Linux:** `ifconfig` → cari `inet` di `en0`/`wlan0`

### Jalankan di Emulator

```bash
# Lihat emulator yang tersedia
flutter emulators

# Launch emulator
flutter emulators --launch <emulator_id>

# Jalankan app (pastikan baseUrl = http://10.0.2.2:3000/api)
flutter run
```

### Jalankan di HP Fisik

1. Aktifkan **USB Debugging** di HP: Settings → Developer Options → USB Debugging ON
2. Colok kabel USB ke PC
3. Ganti `baseUrl` ke IP PC kamu (misal `http://192.168.1.10:3000/api`)
4. Pastikan HP dan PC terhubung ke **WiFi yang sama**
5. Jalankan:

```bash
flutter devices        # cek device terdeteksi
flutter run -d <device_id>
```

### Build APK

```bash
# Debug APK (untuk testing)
flutter build apk --debug

# APK ada di:
# build/app/outputs/flutter-apk/app-debug.apk
```

Install manual ke emulator/device:

```bash
adb install -r build/app/outputs/flutter-apk/app-debug.apk
```

---

## Ringkasan Port

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | http://localhost:3000/api |
| MySQL (Docker) | 3307* | localhost:3307 |
| Frontend Web | 5173 | http://localhost:5173 |

\* Port host 3307 dipakai jika MySQL lokal sudah running di 3306. Sesuaikan jika perlu.

---

## API Endpoints Utama

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/login` | ❌ | Login, dapat JWT token |
| GET | `/api/items` | Admin | List semua item |
| GET | `/api/requests/my` | User | Request milik user |
| GET | `/api/requests/pending/list` | Admin | Request pending |
| GET | `/api/warehouses` | Admin | List gudang |
| GET | `/api/units` | Superadmin | List unit |

Semua endpoint (kecuali login) membutuhkan header:
```
Authorization: Bearer <token>
```

---

## Troubleshooting

**Backend tidak bisa konek ke DB:**
```bash
docker restart military_backend
docker logs military_backend   # cek log
```

**Port 3000 bentrok:**
```bash
# Cek proses yang pakai port 3000
netstat -ano | findstr :3000   # Windows
lsof -i :3000                  # Mac/Linux
```

**Flutter tidak detect device:**
```bash
flutter doctor    # cek masalah setup
adb devices       # cek device/emulator
```

**App mobile tidak bisa konek ke backend:**
- Pastikan HP/emulator dan PC di jaringan yang sama
- Pastikan `baseUrl` di `api_service.dart` sudah benar
- Emulator → `10.0.2.2`, HP fisik → IP WiFi PC
