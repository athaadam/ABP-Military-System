# Military Mobile App - Flutter Version

Aplikasi mobile untuk Military System yang dibangun dengan Flutter. Aplikasi ini memiliki design dan fitur yang sama dengan versi frontend React, dengan tema gelap (dark theme) menggunakan warna biru dan ungu sebagai aksen utama.

## 🎨 Design & Theme

- **Dark Theme**: Background #020617 dengan surface #1E293B
- **Primary Colors**: Blue (#3B82F6) dan Purple (#7C3AED)
- **Responsive Design**: Mobile-first approach yang cocok untuk semua ukuran layar

## 📦 Project Structure

```
lib/
├── config/
│   └── theme.dart                 # Theme configuration & colors
├── controllers/
│   └── auth_controller.dart       # Authentication logic (GetX)
├── models/
│   └── user.dart                  # User & AuthResponse models
├── routes/
│   └── app_routes.dart            # Route configuration
├── services/
│   ├── api_service.dart           # HTTP client (Dio)
│   └── storage_service.dart       # Local storage (SharedPreferences)
├── pages/
│   ├── auth/
│   │   └── login_page.dart        # Login screen
│   └── dashboard/
│       ├── dashboard_page.dart    # Main dashboard
│       ├── inventory/
│       │   └── inventory_page.dart
│       ├── requests/
│       │   └── requests_page.dart
│       ├── statistics/
│       │   └── statistics_page.dart
│       ├── units/
│       │   └── units_page.dart
│       └── warehouses/
│           └── warehouses_page.dart
├── widgets/
│   ├── common/
│   │   ├── custom_button.dart
│   │   └── custom_input.dart
│   └── dashboard/
│       └── stat_card.dart
├── utils/                         # Helpers & utilities
└── main.dart                      # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (version ^3.11.5)
- Dart SDK
- Android Studio / Xcode (untuk development)

### Installation

1. **Navigate ke project directory**
```bash
cd military_mobile
```

2. **Install dependencies**
```bash
flutter pub get
```

3. **Update API base URL** (jika diperlukan)
Edit `lib/services/api_service.dart`:
```dart
static const String baseUrl = 'http://localhost:5000/api';
```

4. **Run the app**
```bash
# Development mode
flutter run

# Release mode
flutter run --release
```

## 📱 Features

### Authentication
- Login dengan email & password
- Token-based authentication
- Local storage untuk persisten login
- Auto logout pada 401 response

### Dashboard
- Welcome card dengan info user
- Quick stats dengan grid layout
- Menu list untuk navigasi ke fitur utama
- Logout functionality

### Inventory Management
- List semua items dengan search functionality
- Item details (name, code, quantity, location)
- Real-time inventory display

### Request Management
- View semua requests dengan status
- Filter by status (All, Pending, Approved, Rejected)
- Create new request functionality

### Statistics
- Key metrics cards (Total Items, Requests, Pending, Completed)
- Interactive line chart untuk request trends
- Summary section dengan key information

### Units
- List semua military units
- Unit details (name, code, members, status)
- Member count display

### Warehouses
- List semua warehouses dengan capacity
- Capacity utilization percentage
- Progress bar untuk visualisasi kapasitas

## 🔧 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| get | ^4.6.6 | State management & routing |
| dio | ^5.4.0 | HTTP client |
| shared_preferences | ^2.2.2 | Local storage |
| fl_chart | ^0.68.0 | Charts & graphs |
| intl | ^0.18.0 | Internationalization & formatting |
| lottie | ^3.1.0 | Animations |
| iconsax | ^0.0.8 | Icons |

## 🎯 Architecture

### State Management (GetX)
- Controllers untuk manage state
- Reactive variables menggunakan `.obs`
- Binding untuk dependency injection

### API Integration
- Centralized API service dengan Dio
- Automatic token injection di headers
- Error handling dengan 401 interceptor

### Local Storage
- SharedPreferences untuk token & user data
- Persistent login across sessions

## 🌐 API Integration

Aplikasi ini menggunakan API dari backend Military System. Pastikan backend berjalan di:
```
http://localhost:5000
```

### Authentication Endpoints
- `POST /api/auth/login` - Login user
- Response: `{ user: User, token: string }`

### Main Endpoints
- `GET /api/items` - Get all items
- `GET /api/requests` - Get all requests
- `GET /api/units` - Get all units
- `GET /api/warehouses` - Get all warehouses
- `GET /api/statistics` - Get statistics

## 🎨 Customization

### Mengubah Warna
Edit `lib/config/theme.dart`:
```dart
static const Color primary = Color(0xFF3B82F6);
static const Color secondary = Color(0xFF7C3AED);
```

### Menambah Routes
Edit `lib/routes/app_routes.dart`:
```dart
static const String newPage = '/new-page';

GetPage(
  name: Routes.newPage,
  page: () => NewPage(),
)
```

## 📝 Development Tips

### Hot Reload
```bash
flutter run -v
# Press 'r' untuk hot reload
```

### Debug Mode
```bash
flutter run --debug
```

### Build Release APK
```bash
flutter build apk --release
```

### Build iOS IPA
```bash
flutter build ios --release
```

## 🐛 Troubleshooting

### Dependency Conflict
```bash
flutter pub get
flutter pub upgrade
```

### Clean Build
```bash
flutter clean
flutter pub get
flutter run
```

### Check Flutter Health
```bash
flutter doctor
```

## 📚 Resources

- [Flutter Documentation](https://flutter.dev)
- [GetX Documentation](https://github.com/jonataslaw/getx)
- [Dio Documentation](https://pub.dev/packages/dio)
- [FL Chart](https://pub.dev/packages/fl_chart)

## ✨ Fitur yang Akan Datang

- [ ] Offline mode support
- [ ] Dark/Light theme toggle
- [ ] Push notifications
- [ ] Advanced filtering
- [ ] Export data to PDF
- [ ] Multi-language support
- [ ] Biometric authentication
- [ ] Real-time updates dengan WebSocket

## 📄 License

Private project - All rights reserved

## 👥 Contributors

- Adam (Developer)
