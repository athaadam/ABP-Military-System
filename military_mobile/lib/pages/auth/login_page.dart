import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../config/theme.dart';
import '../../controllers/auth_controller.dart';
import '../../widgets/common/custom_button.dart';
import '../../widgets/common/custom_input.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authController = Get.find<AuthController>();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (_formKey.currentState?.validate() ?? false) {
      _authController.login(
        _emailController.text,
        _passwordController.text,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      body: SingleChildScrollView(
        child: Container(
          height: MediaQuery.of(context).size.height,
          decoration: BoxDecoration(
            color: AppTheme.darkBg,
            gradient: RadialGradient(
              radius: 1.5,
              colors: [
                Color(0xFF3B82F6).withValues(alpha: 0.1),
                AppTheme.darkBg,
              ],
              stops: [0.0, 0.5],
            ),
          ),
          child: Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [AppTheme.primary, AppTheme.secondary],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primary.withValues(alpha: 0.3),
                          blurRadius: 20,
                          spreadRadius: 0,
                        ),
                      ],
                    ),
                    child: Icon(Icons.military_tech, size: 32, color: Colors.white),
                  ),
                  SizedBox(height: 24),

                  // Title
                  Text(
                    'Military System',
                    style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Silakan login ke akun Anda',
                    style: TextStyle(
                      color: AppTheme.textTertiary,
                      fontSize: 14,
                    ),
                  ),
                  SizedBox(height: 40),

                  // Form
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        CustomInput(
                          label: 'Email',
                          hintText: 'your@email.com',
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          prefixIcon: Icons.mail_outline,
                          validator: (value) {
                            if (value?.isEmpty ?? true) {
                              return 'Email tidak boleh kosong';
                            }
                            if (!GetUtils.isEmail(value!)) {
                              return 'Email tidak valid';
                            }
                            return null;
                          },
                        ),
                        SizedBox(height: 20),
                        CustomInput(
                          label: 'Password',
                          hintText: '••••••••',
                          controller: _passwordController,
                          obscureText: true,
                          prefixIcon: Icons.lock_outline,
                          suffixIcon: Icons.visibility,
                          validator: (value) {
                            if (value?.isEmpty ?? true) {
                              return 'Password tidak boleh kosong';
                            }
                            if ((value?.length ?? 0) < 6) {
                              return 'Password minimal 6 karakter';
                            }
                            return null;
                          },
                        ),
                        SizedBox(height: 24),
                      ],
                    ),
                  ),

                  // Error Message
                  Obx(
                    () => _authController.errorMessage.value != null
                        ? Container(
                            padding: EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppTheme.error.withValues(alpha: 0.1),
                              border: Border.all(color: AppTheme.error, width: 1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.error_outline, color: AppTheme.error, size: 20),
                                SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    _authController.errorMessage.value ?? '',
                                    style: TextStyle(
                                      color: AppTheme.error,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )
                        : SizedBox.shrink(),
                  ),
                  SizedBox(height: 32),

                  // Login Button
                  Obx(
                    () => CustomButton(
                      label: _authController.isLoading.value ? 'Sedang login...' : 'Login',
                      onPressed: _authController.isLoading.value ? null : _handleLogin,
                      isLoading: _authController.isLoading.value,
                      fullWidth: true,
                      icon: Icons.login,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
