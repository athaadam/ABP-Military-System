import 'package:get/get.dart';
import '../pages/auth/login_page.dart';
import '../pages/dashboard/dashboard_page.dart';

abstract class Routes {
  static const String login = '/login';
  static const String dashboard = '/dashboard';
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
      name: Routes.dashboard,
      page: () => DashboardPage(),
      transition: Transition.fadeIn,
    ),
  ];
}
