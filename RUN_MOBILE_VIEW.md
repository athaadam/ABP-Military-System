# 📱 Menjalankan Flutter App dalam Mobile View

Aplikasi Flutter sudah dijalankan di Windows desktop Anda. Berikut cara melihatnya dalam format mobile:

## 🎯 Option 1: Resize Window ke Mobile Size (PALING MUDAH)

1. **Buka Flutter app yang sedang running**
2. **Resize window ke ukuran mobile** (sekitar 400x800 pixel)
   - Tarik corner window untuk mengecilkan
   - Atau gunakan Windows Snap untuk split screen

**Ukuran referensi:**
- iPhone 12: 390x844px
- Samsung Galaxy: 412x914px
- Umum: 400x900px

**Hasil**: App akan terlihat seperti mobile app karena sudah responsive!

---

## 🎯 Option 2: Buka DevTools untuk Mobile Emulation

Jika Flutter app sudah running, tekan:
```
h → Untuk lihat semua commands
```

Lalu cari opsi untuk DevTools atau Developer Tools.

### Manual Open DevTools:
```bash
# Di terminal Flutter, press 'h' untuk lihat commands
# Atau buka browser ke URL DevTools yang ditampilkan
```

---

## 🎯 Option 3: Modifikasi main.dart untuk Fixed Mobile Size

Edit `lib/main.dart` dan tambahkan code berikut untuk lock ukuran window:

```dart
import 'package:window_manager/window_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set fixed mobile size
  windowManager.ensureInitialized();
  
  WindowOptions windowOptions = const WindowOptions(
    size: Size(390, 844),  // iPhone 12 size
    center: true,
    backgroundColor: Colors.transparent,
    skipTaskbar: false,
    titleBarStyle: TitleBarStyle.hidden,
  );
  
  windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.show();
    await windowManager.focus();
  });

  await StorageService.init();
  Get.put(AuthController());

  runApp(const MyApp());
}
```

**Langkah implementasi:**
1. Tambahkan dependency di `pubspec.yaml`:
```yaml
dependencies:
  window_manager: ^0.3.7
```

2. Run `flutter pub get`
3. Run `flutter run -d windows` lagi

---

## 📱 Lihat Sekarang!

### Sudah Running - Tinggal Resize:

1. **Temukan window Flutter** yang sedang berjalan
2. **Kecilkan ke ~400x900px** - akan terlihat seperti mobile phone
3. **Explore aplikasi** dalam mobile view!

### Jika Belum Running:

```bash
cd c:\Users\adam\Documents\ABP\military_mobile
flutter run -d windows
```

---

## 🔍 Apa yang Bisa Dilihat

Setelah app running dalam mobile view:

### Login Screen ✅
- Dark background #020617
- Gradient blue-purple logo
- Email & password input dengan icons
- Gradient login button
- Error message display

**Test credentials** (sesuaikan dengan backend Anda):
```
Email: admin@example.com
Password: password123
```

### Dashboard Screen ✅
- Welcome card dengan gradient
- 4 stat cards (2x2 grid)
- Menu list dengan 6 fitur:
  - Inventory
  - Requests
  - Statistics
  - Warehouses
  - Units
  - Settings

### Navigasi ke Fitur ✅
Tap/click menu items untuk navigate ke:
- **Inventory** - List items dengan search
- **Requests** - List dengan filter status
- **Statistics** - Chart & metrics
- **Units** - List units
- **Warehouses** - Capacity display
- **Settings** - Coming soon

---

## 🎮 Flutter Commands Saat Running

Tekan di terminal Flutter:

```
r     → Hot reload (refresh tanpa restart)
R     → Hot restart (restart app)
h     → Show all commands
d     → Detach (henti debug tapi app tetap running)
c     → Clear screen
q     → Quit app
```

---

## 🎬 Demo Walkthrough

### 1. **Login Page** (saat pertama kali buka)
```
Lihat:
- Dark blue/purple gradient background
- Military System title
- Email field dengan mail icon
- Password field dengan lock icon
- Login button dengan gradient
- Error handling untuk invalid input
```

### 2. **Dashboard** (setelah login)
```
Lihat:
- Gradient welcome card ("Selamat datang!")
- 4 stat cards:
  • Total Items: 1,234
  • Requests: 56
  • Warehouses: 8
  • Units: 12
- Menu list dengan 6 items
- Logout button di top-right
```

### 3. **Navigate & Test**
```
Click "Inventory"
  → Lihat list items dengan search bar
  
Click back → Dashboard

Click "Requests"
  → Lihat list requests dengan filter tabs
  → Status badges (Approved/Pending/Rejected)
  
Click "Statistics"
  → Lihat key metrics cards
  → Interactive line chart
  
Click "Units"
  → Lihat units list
  
Click "Warehouses"
  → Lihat warehouses dengan capacity bar
```

---

## 🎨 Design Elements Untuk Diperhatikan

✅ **Color Scheme**
- Background: Very dark #020617
- Cards: Slate #0F172A
- Accent: Blue #3B82F6
- Secondary: Purple #7C3AED

✅ **Typography**
- Titles: Bold 20px
- Body: Regular 14px
- Labels: Regular 12px

✅ **Layout**
- Padding: Consistent 16px
- Rounded corners: 8-12px
- Dividers: Slate border

✅ **Interactive**
- Smooth transitions
- Loading states
- Error messages
- Status badges

---

## 📸 Screenshot Apa yang Diharapkan

### Login Screen
```
┌─────────────────────────────┐
│                             │
│        [BLUE ICON]          │
│                             │
│     Military System         │
│  Silakan login ke akun Anda │
│                             │
│  ┌───────────────────────┐  │
│  │📧 your@email.com      │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │🔒 ••••••••            │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   🔐 Login            │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### Dashboard Screen
```
┌─────────────────────────────┐
│  Dashboard              🚪  │
├─────────────────────────────┤
│ ╔═════════════════════════╗ │
│ ║  Selamat datang!        ║ │
│ ║  John Doe              ║ │
│ ╚═════════════════════════╝ │
│                             │
│ ┌──────────┬──────────┐    │
│ │📦 1,234  │📄 56     │    │
│ │Items     │Requests  │    │
│ ├──────────┼──────────┤    │
│ │🏢 8      │👥 12     │    │
│ │Warehouse │Units     │    │
│ └──────────┴──────────┘    │
│                             │
│ • Inventory →               │
│ • Requests →                │
│ • Statistics →              │
│ • Warehouses →              │
│ • Units →                   │
│ • Settings →                │
│                             │
└─────────────────────────────┘
```

---

## 🚀 Recommended Flow

1. **Buka terminal** di `military_mobile`
2. **Run**: `flutter run -d windows`
3. **Resize window** ke 400x900px
4. **Lihat login screen**
5. **Login** dengan credentials backend
6. **Explore** semua halaman
7. **Test** navigasi antar fitur

---

## ✨ Hasil Yang Akan Dilihat

✅ Beautiful dark theme
✅ Responsive mobile layout
✅ Smooth navigation
✅ Color-coded status badges
✅ Interactive elements (tabs, buttons)
✅ Charts & graphs
✅ Clean, modern design

---

## 🎯 Quick Commands

```bash
# Run di Windows dengan mobile view
cd c:\Users\adam\Documents\ABP\military_mobile
flutter run -d windows

# Hot reload (saat ada perubahan code)
# Tekan 'r' di terminal

# Lihat semua commands
# Tekan 'h' di terminal
```

---

## 📝 Notes

- **API**: Pastikan backend berjalan di `http://localhost:5000`
- **Credentials**: Sesuaikan dengan user di database backend
- **Network**: Jika error 500, check backend logs
- **Hot Reload**: Cocok untuk development - jauh lebih cepat daripada restart

---

Sekarang **open file** yang sudah dibuat dan test aplikasinya! 🎉

Jika ada error, check:
1. Backend API berjalan?
2. Credentials valid?
3. Network connection OK?

Enjoy! 📱✨
