# 🚀 Flutter Military System - Quick Start

Panduan cepat untuk menjalankan aplikasi Mobile Flutter Military System.

## ✅ Prerequisites

- Flutter SDK v3.11.5+ ([Download](https://flutter.dev/docs/get-started/install))
- Android Studio atau Xcode (untuk emulator/device)
- Backend Military System berjalan di `http://localhost:5000`

## 📦 Setup Cepat (5 menit)

### 1. Navigate ke folder project
```bash
cd c:\Users\adam\Documents\ABP\military_mobile
```

### 2. Install dependencies
```bash
flutter pub get
```

Tunggu hingga selesai (biasanya 2-3 menit untuk first install).

### 3. Jalankan aplikasi
```bash
flutter run
```

Pilih target device saat diminta:
```
Which device do you want to use with this app?
1. Chrome (web)
2. Android Emulator
3. iOS Simulator
```

## 🎯 Test Login

Setelah app berjalan, gunakan credentials dari backend:

```
Email: admin@example.com
Password: password123
```

(Sesuaikan dengan credentials yang ada di backend Anda)

## 📁 Project Structure Utama

```
military_mobile/
├── lib/
│   ├── config/theme.dart           ← Warna & styling
│   ├── pages/auth/login_page.dart  ← Login screen
│   ├── pages/dashboard/            ← Dashboard & fitur utama
│   ├── controllers/                ← Business logic (GetX)
│   ├── services/                   ← API & storage
│   └── main.dart                   ← Entry point
├── pubspec.yaml                     ← Dependencies
└── README_FLUTTER.md                ← Full documentation
```

## 🎨 Design Features

✅ **Dark Theme** - #020617 background seperti frontend
✅ **Blue & Purple Gradient** - Sama dengan frontend React
✅ **Responsive Layout** - Mobile-first design
✅ **Typography Matching** - Font sizes sesuai frontend
✅ **Color Palette Complete** - Semua warna frontend sudah di-mapping

## 📱 Fitur yang Sudah Tersedia

### Auth
- ✅ Login form dengan validation
- ✅ Token storage & persistence
- ✅ Auto logout

### Dashboard
- ✅ Welcome card
- ✅ Quick stats (4 cards)
- ✅ Navigation menu

### Pages
- ✅ Inventory (list & search)
- ✅ Requests (dengan filter status)
- ✅ Statistics (dengan chart)
- ✅ Units (list)
- ✅ Warehouses (dengan capacity bar)

## 🔧 Konfigurasi

### Mengubah API URL

Edit `lib/services/api_service.dart`:
```dart
static const String baseUrl = 'http://localhost:5000/api';
```

Ganti `localhost:5000` dengan URL backend Anda.

### Mengubah Warna Theme

Edit `lib/config/theme.dart`:
```dart
static const Color primary = Color(0xFF3B82F6);    // Blue
static const Color secondary = Color(0xFF7C3AED); // Purple
```

### Menambah Halaman Baru

1. Buat file di `lib/pages/dashboard/nama_page.dart`
2. Tambahkan route di `lib/routes/app_routes.dart`
3. Tambahkan menu item di `dashboard_page.dart`

## 🔌 API Integration

Aplikasi sudah siap terhubung ke backend dengan endpoints:

```
POST   /api/auth/login      (Login)
GET    /api/items           (Get items)
GET    /api/requests        (Get requests)
GET    /api/statistics      (Get stats)
GET    /api/units           (Get units)
GET    /api/warehouses      (Get warehouses)
```

## 🐛 Troubleshooting

### Error: "No devices found"
```bash
# Check connected devices
flutter devices

# Jalankan emulator Android
emulator -list-avds
emulator -avd <nama_emulator>

# Atau buka iOS Simulator
open -a Simulator
```

### Error: "Dependency conflict"
```bash
flutter pub get
flutter pub upgrade
```

### Clean build
```bash
flutter clean
flutter pub get
flutter run
```

## 📊 State Management (GetX)

Aplikasi menggunakan **GetX** untuk state management:

```dart
// Controller
class AuthController extends GetxController {
  final isLoading = false.obs;        // Observable variable
  final user = Rx<User?>(null);       // Reactive variable
}

// Usage di UI
Obx(() => Text(authController.user.value?.name ?? 'User'))
```

## 🔒 Security

- Token disimpan di SharedPreferences
- Auto inject token di semua requests
- Auto logout saat token invalid (401)
- Input validation di semua form

## 📚 Dependencies Utama

```yaml
get: ^4.6.6                    # State management & routing
dio: ^5.4.0                    # HTTP client
shared_preferences: ^2.2.2     # Local storage
fl_chart: ^0.68.0              # Charts
intl: ^0.18.0                  # Date formatting
```

## 💡 Tips Development

### Hot Reload
Selama development, tekan `r` di terminal untuk hot reload:
```
flutter run -v
> r (hot reload)
> R (hot restart)
> q (quit)
```

### Debug Mode
```bash
flutter run --debug
```

### Release Mode
```bash
flutter run --release
```

## 📱 Build untuk Distribution

### Android APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-app.apk
```

### Android App Bundle (Play Store)
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### iOS IPA
```bash
flutter build ios --release
# Output: build/ios/iphoneos/Runner.app
```

## 🎯 Next Steps

1. ✅ Jalankan app dengan `flutter run`
2. ✅ Test login dengan backend credentials
3. ✅ Explore semua halaman & fitur
4. ✅ Customize warna/theme sesuai preferensi
5. ✅ Implement form untuk create requests
6. ✅ Add real data dari API

## 📖 Full Documentation

Untuk dokumentasi lengkap, lihat:
- **`README_FLUTTER.md`** - Setup & detailed guide
- **`FLUTTER_IMPLEMENTATION_GUIDE.md`** - Architecture & design mapping

## 🆘 Need Help?

- Check Flutter docs: https://flutter.dev
- GetX GitHub: https://github.com/jonataslaw/getx
- Dio docs: https://pub.dev/packages/dio
- FL Chart: https://pub.dev/packages/fl_chart

## ⏱️ Expected Runtime

- First `flutter run`: 2-5 minutes (depends on device)
- Subsequent runs: 30 seconds - 1 minute
- Hot reload: < 2 seconds

---

**Happy coding! 🎉**

Sekarang jalankan:
```bash
flutter run
```

Dan nikmati Military System Mobile App! 📱
