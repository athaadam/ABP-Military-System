import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../config/theme.dart';
import '../../../controllers/users_controller.dart';
import '../../../models/user.dart';
import 'widgets/user_list_item.dart';
import 'widgets/create_user_modal.dart';
import 'widgets/edit_user_modal.dart';
import 'widgets/delete_user_dialog.dart';
import 'widgets/reset_password_dialog.dart';

class UsersPage extends StatelessWidget {
  final UsersController _usersController = Get.isRegistered<UsersController>()
      ? Get.find<UsersController>()
      : Get.put(UsersController());

  UsersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('Manajemen User'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
        actions: [
          Obx(
            () => _usersController.isLoading.value
                ? const Padding(
                    padding: EdgeInsets.all(16),
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : IconButton(
                    icon: const Icon(Icons.refresh),
                    onPressed: () => _usersController.fetchData(),
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primary,
        onPressed: () => _showCreateModal(context),
        child: const Icon(Icons.person_add),
      ),
      body: Obx(
        () {
          if (_usersController.isLoading.value && _usersController.users.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (_usersController.errorMessage.value != null &&
              _usersController.users.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    _usersController.errorMessage.value ?? 'Gagal memuat users',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _usersController.fetchData(),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }

          if (_usersController.users.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.people_outline, size: 48, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text(
                    'Belum ada user terdaftar',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showCreateModal(context),
                    icon: const Icon(Icons.person_add),
                    label: const Text('Tambah Admin'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => _usersController.fetchData(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _usersController.users.length,
              separatorBuilder: (context, index) => Divider(color: AppTheme.border),
              itemBuilder: (context, index) {
                final user = _usersController.users[index];
                return UserListItem(
                  user: user,
                  unitName: _usersController.getUnitName(user.unitId),
                  onEdit: () => _showEditModal(context, user),
                  onDelete: () => _showDeleteDialog(context, user),
                  onResetPassword: () => _showResetPasswordDialog(context, user),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _showCreateModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => CreateUserModal(controller: _usersController),
    );
  }

  void _showEditModal(BuildContext context, User user) {
    showDialog(
      context: context,
      builder: (context) => EditUserModal(controller: _usersController, user: user),
    );
  }

  void _showDeleteDialog(BuildContext context, User user) {
    showDialog(
      context: context,
      builder: (context) => DeleteUserDialog(
        controller: _usersController,
        userId: user.id,
        userName: user.name,
      ),
    );
  }

  void _showResetPasswordDialog(BuildContext context, User user) {
    _usersController.newPassword.value = null;
    showDialog(
      context: context,
      builder: (context) => ResetPasswordDialog(
        controller: _usersController,
        userId: user.id,
        userName: user.name,
      ),
    );
  }
}
