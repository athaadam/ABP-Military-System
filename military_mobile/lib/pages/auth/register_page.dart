import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../config/theme.dart';
import '../../controllers/auth_controller.dart';
import '../../models/unit.dart';
import '../../services/unit_service.dart';
import '../../widgets/common/custom_button.dart';
import '../../widgets/common/custom_input.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _authController = Get.find<AuthController>();
  final _unitService = UnitService();

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  List<Unit> _units = [];
  Unit? _selectedUnit;
  bool _loadingUnits = true;
  bool _unitsLoadFailed = false;
  final _unitIdController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUnits();
    _authController.errorMessage.value = null;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _unitIdController.dispose();
    super.dispose();
  }

  Future<void> _loadUnits() async {
    try {
      setState(() { _loadingUnits = true; _unitsLoadFailed = false; });
      final units = await _unitService.getAll();
      if (mounted) {
        setState(() { _units = units; _loadingUnits = false; });
      }
    } catch (_) {
      if (mounted) {
        setState(() { _loadingUnits = false; _unitsLoadFailed = true; });
      }
    }
  }

  void _submit() {
    _authController.errorMessage.value = null;
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final unitId = _unitsLoadFailed
        ? _unitIdController.text.trim()
        : _selectedUnit?.id ?? '';

    if (unitId.isEmpty) {
      _authController.errorMessage.value = 'Pilih unit terlebih dahulu';
      return;
    }

    _authController.register(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      unitId: unitId,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      body: SingleChildScrollView(
        child: Container(
          constraints: BoxConstraints(
            minHeight: MediaQuery.of(context).size.height,
          ),
          decoration: BoxDecoration(
            color: AppTheme.darkBg,
            gradient: RadialGradient(
              radius: 1.5,
              colors: [
                const Color(0xFF7C3AED).withValues(alpha: 0.08),
                AppTheme.darkBg,
              ],
              stops: const [0.0, 0.5],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Back button
                  GestureDetector(
                    onTap: () => Get.back(),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.darkCard,
                        border: Border.all(color: AppTheme.border),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(Icons.arrow_back, color: AppTheme.textSecondary, size: 20),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Header
                  const Text(
                    'Buat Akun',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Daftarkan diri sebagai anggota sistem',
                    style: TextStyle(color: AppTheme.textTertiary, fontSize: 14),
                  ),
                  const SizedBox(height: 32),

                  // Form
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        // Nama
                        CustomInput(
                          label: 'Nama Lengkap',
                          hintText: 'Nama Anda',
                          controller: _nameController,
                          prefixIcon: Icons.person_outline,
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) return 'Nama wajib diisi';
                            if (v.trim().length < 3) return 'Nama minimal 3 karakter';
                            return null;
                          },
                        ),
                        const SizedBox(height: 20),

                        // Email
                        CustomInput(
                          label: 'Email',
                          hintText: 'email@contoh.com',
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          prefixIcon: Icons.mail_outline,
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) return 'Email wajib diisi';
                            if (!GetUtils.isEmail(v.trim())) return 'Format email tidak valid';
                            return null;
                          },
                        ),
                        const SizedBox(height: 20),

                        // Unit selector
                        _buildUnitField(),
                        const SizedBox(height: 20),

                        // Password
                        CustomInput(
                          label: 'Password',
                          hintText: '••••••••',
                          controller: _passwordController,
                          obscureText: true,
                          prefixIcon: Icons.lock_outline,
                          suffixIcon: Icons.visibility,
                          validator: (v) {
                            if (v == null || v.isEmpty) return 'Password wajib diisi';
                            if (v.length < 6) return 'Password minimal 6 karakter';
                            return null;
                          },
                        ),
                        const SizedBox(height: 20),

                        // Confirm Password
                        CustomInput(
                          label: 'Konfirmasi Password',
                          hintText: '••••••••',
                          controller: _confirmPasswordController,
                          obscureText: true,
                          prefixIcon: Icons.lock_outline,
                          suffixIcon: Icons.visibility,
                          validator: (v) {
                            if (v == null || v.isEmpty) return 'Konfirmasi password wajib diisi';
                            if (v != _passwordController.text) return 'Password tidak cocok';
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),

                  // Error Message
                  Obx(() {
                    final err = _authController.errorMessage.value;
                    if (err == null) return const SizedBox.shrink();
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.error.withValues(alpha: 0.1),
                          border: Border.all(color: AppTheme.error),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.error_outline, color: AppTheme.error, size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                err,
                                style: TextStyle(color: AppTheme.error, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),

                  // Submit button
                  Obx(
                    () => CustomButton(
                      label: _authController.isRegistering.value
                          ? 'Mendaftarkan...'
                          : 'Daftar',
                      onPressed: _authController.isRegistering.value ? null : _submit,
                      isLoading: _authController.isRegistering.value,
                      fullWidth: true,
                      icon: Icons.app_registration,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Login link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Sudah punya akun?',
                        style: TextStyle(color: AppTheme.textTertiary, fontSize: 14),
                      ),
                      TextButton(
                        onPressed: () => Get.back(),
                        child: Text(
                          'Login',
                          style: TextStyle(
                            color: AppTheme.primary,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUnitField() {
    if (_loadingUnits) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Unit',
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            height: 48,
            decoration: BoxDecoration(
              color: AppTheme.darkSurface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.border),
            ),
            child: const Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          ),
        ],
      );
    }

    if (_unitsLoadFailed || _units.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CustomInput(
            label: 'Kode Unit',
            hintText: 'Masukkan kode unit Anda',
            controller: _unitIdController,
            prefixIcon: Icons.business_outlined,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Kode unit wajib diisi';
              return null;
            },
          ),
          if (_unitsLoadFailed) ...[
            const SizedBox(height: 6),
            GestureDetector(
              onTap: _loadUnits,
              child: Text(
                'Coba muat daftar unit',
                style: TextStyle(
                  color: AppTheme.primary,
                  fontSize: 12,
                  decoration: TextDecoration.underline,
                  decorationColor: AppTheme.primary,
                ),
              ),
            ),
          ],
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Unit',
          style: TextStyle(
            color: AppTheme.textSecondary,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<Unit>(
          initialValue: _selectedUnit,
          dropdownColor: AppTheme.darkCard,
          icon: Icon(Icons.keyboard_arrow_down, color: AppTheme.textTertiary),
          decoration: InputDecoration(
            hintText: 'Pilih unit',
            hintStyle: TextStyle(color: AppTheme.textTertiary),
            prefixIcon: Icon(Icons.business_outlined, color: AppTheme.textTertiary, size: 20),
            filled: true,
            fillColor: AppTheme.darkSurface,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppTheme.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppTheme.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppTheme.primary, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppTheme.error),
            ),
          ),
          style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
          items: _units
              .map((u) => DropdownMenuItem<Unit>(
                    value: u,
                    child: Text(u.name),
                  ))
              .toList(),
          onChanged: (u) => setState(() => _selectedUnit = u),
          validator: (_) {
            if (_selectedUnit == null) return 'Pilih unit terlebih dahulu';
            return null;
          },
        ),
      ],
    );
  }
}
