import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'config/theme.dart';
import 'controllers/auth_controller.dart';
import 'routes/app_routes.dart';
import 'services/storage_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await StorageService.init();
  Get.put(AuthController());

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Military System',
      theme: AppTheme.darkTheme,
      getPages: AppPages.pages,
      initialRoute: Routes.login,
      debugShowCheckedModeBanner: false,
      home: _HomeWrapper(),
    );
  }
}

class _HomeWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();

    return Obx(() {
      if (authController.isAuthenticated.value) {
        return SizedBox.shrink();
      } else {
        return SizedBox.shrink();
      }
    });
  }
}
