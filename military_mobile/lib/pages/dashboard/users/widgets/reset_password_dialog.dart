import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/users_controller.dart';

class ResetPasswordDialog extends StatelessWidget {
  final UsersController controller;
  final int userId;
  final String userName;

  const ResetPasswordDialog({
    super.key,
    required this.controller,
    required this.userId,
    required this.userName,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppTheme.darkCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Obx(() {
          final newPwd = controller.newPassword.value;
          final isResetting = controller.isResetting.value;

          return Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Reset Password',
                    style: TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                    color: Colors.grey,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (newPwd == null && !isResetting) ...[
                Text(
                  'Reset password untuk $userName? Password baru akan digenerate secara otomatis.',
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                ),
                const SizedBox(height: 20),
                if (controller.errorMessage.value != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                    ),
                    child: Text(controller.errorMessage.value ?? '',
                        style: const TextStyle(color: Colors.red, fontSize: 12)),
                  ),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: AppTheme.border),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Batal'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => controller.resetPassword(userId),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Reset',
                            style: TextStyle(color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ] else if (isResetting) ...[
                const Center(child: CircularProgressIndicator()),
                const SizedBox(height: 16),
                const Center(
                  child: Text('Mereset password...',
                      style: TextStyle(color: Colors.white, fontSize: 14)),
                ),
              ] else ...[
                const Text(
                  'Password baru berhasil digenerate:',
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.darkSurface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          newPwd ?? '',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 2,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: newPwd ?? ''));
                          Get.snackbar('Disalin', 'Password disalin ke clipboard');
                        },
                        icon: const Icon(Icons.copy, size: 20),
                        color: AppTheme.primary,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Simpan password ini sebelum menutup dialog.',
                  style: TextStyle(color: Colors.orange.shade300, fontSize: 12),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      controller.newPassword.value = null;
                      Navigator.of(context).pop();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Selesai', style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ],
          );
        }),
      ),
    );
  }
}
