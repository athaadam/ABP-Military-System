import 'package:get/get.dart';
import '../pages/auth/login_page.dart';
import '../pages/dashboard/dashboard_page.dart';
import '../pages/dashboard/inventory/inventory_page.dart';
import '../pages/dashboard/requests/requests_page.dart';
import '../pages/dashboard/statistics/statistics_page.dart';
import '../pages/dashboard/units/units_page.dart';
import '../pages/dashboard/warehouses/warehouses_page.dart';
import '../pages/dashboard/users/users_page.dart';
import '../pages/dashboard/settings/settings_page.dart';
import '../pages/user/user_dashboard_page.dart';
import '../pages/auth/register_page.dart';

abstract class Routes {
  static const String login = '/login';
  static const String register = '/register';
  static const String dashboard = '/dashboard';
  static const String userDashboard = '/user-dashboard';
  static const String inventory = '/inventory';
  static const String requests = '/requests';
  static const String statistics = '/statistics';
  static const String units = '/units';
  static const String warehouses = '/warehouses';
  static const String users = '/users';
  static const String settings = '/settings';
}

abstract class AppPages {
  static final pages = [
    GetPage(
      name: Routes.login,
      page: () => LoginPage(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: Routes.register,
      page: () => const RegisterPage(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.dashboard,
      page: () => const DashboardPage(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: Routes.userDashboard,
      page: () => const UserDashboardPage(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: Routes.inventory,
      page: () => InventoryPage(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.requests,
      page: () => RequestsPage(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.statistics,
      page: () => const StatisticsPage(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.units,
      page: () => UnitsPage(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.warehouses,
      page: () => WarehousesPage(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.users,
      page: () => UsersPage(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.settings,
      page: () => const SettingsPage(),
      transition: Transition.rightToLeft,
    ),
  ];
}
