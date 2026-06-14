import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/users_controller.dart';
import '../../../../models/user.dart';
import '../../../../models/unit.dart';

class EditUserModal extends StatefulWidget {
  final UsersController controller;
  final User user;

  const EditUserModal({super.key, required this.controller, required this.user});

  @override
  State<EditUserModal> createState() => _EditUserModalState();
}

class _EditUserModalState extends State<EditUserModal> {
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late String _selectedRole;
  late String _selectedUnitId;

  static const List<String> _roles = ['admin', 'user'];

  List<Unit> get units => widget.controller.units;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user.name);
    _emailController = TextEditingController(text: widget.user.email);
    _selectedRole = _roles.contains(widget.user.role) ? widget.user.role : 'user';
    _selectedUnitId = widget.user.unitId;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    widget.controller.errorMessage.value = null;

    await widget.controller.updateUser(
      widget.user.id,
      name: _nameController.text,
      email: _emailController.text,
      role: _selectedRole,
      unitId: _selectedUnitId,
    );

    if (widget.controller.errorMessage.value == null && mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppTheme.darkCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Edit User',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                    color: Colors.grey,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _buildTextField(_nameController, 'Nama'),
              const SizedBox(height: 12),
              _buildTextField(_emailController, 'Email',
                  keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 12),
              _buildRoleDropdown(),
              const SizedBox(height: 12),
              _buildUnitDropdown(),
              const SizedBox(height: 20),
              Obx(() => widget.controller.errorMessage.value != null
                  ? _buildError(widget.controller.errorMessage.value!)
                  : const SizedBox.shrink()),
              const SizedBox(height: 20),
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
                    child: Obx(() => ElevatedButton(
                          onPressed: widget.controller.isUpdating.value ? null : _handleSubmit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: Text(
                            widget.controller.isUpdating.value ? 'Menyimpan...' : 'Simpan',
                            style: const TextStyle(color: Colors.white),
                          ),
                        )),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label, {
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: TextStyle(color: AppTheme.textPrimary),
          decoration: InputDecoration(
            filled: true,
            fillColor: AppTheme.darkSurface,
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: AppTheme.border)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: AppTheme.border)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
        ),
      ],
    );
  }

  Widget _buildRoleDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Role',
            style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppTheme.darkSurface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppTheme.border),
          ),
          child: DropdownButton<String>(
            value: _selectedRole,
            isExpanded: true,
            dropdownColor: AppTheme.darkCard,
            style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
            underline: const SizedBox.shrink(),
            items: const [
              DropdownMenuItem(value: 'admin', child: Text('Admin')),
              DropdownMenuItem(value: 'user', child: Text('User')),
            ],
            onChanged: (v) => setState(() => _selectedRole = v ?? _selectedRole),
          ),
        ),
      ],
    );
  }

  Widget _buildUnitDropdown() {
    final unitList = widget.controller.units;
    // Pastikan _selectedUnitId ada di list; kalau tidak, pakai yang pertama
    final validId = unitList.any((u) => u.id == _selectedUnitId)
        ? _selectedUnitId
        : (unitList.isNotEmpty ? unitList.first.id : _selectedUnitId);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Unit',
            style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
        const SizedBox(height: 4),
        unitList.isEmpty
            ? Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Text('Tidak ada unit', style: TextStyle(color: AppTheme.textTertiary)),
              )
            : Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: DropdownButton<String>(
                  value: validId,
                  isExpanded: true,
                  dropdownColor: AppTheme.darkCard,
                  style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                  underline: const SizedBox.shrink(),
                  items: unitList
                      .map((u) => DropdownMenuItem<String>(
                            value: u.id,
                            child: Text(u.name),
                          ))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedUnitId = v ?? _selectedUnitId),
                ),
              ),
      ],
    );
  }

  Widget _buildError(String message) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
      ),
      child: Text(message, style: const TextStyle(color: Colors.red, fontSize: 12)),
    );
  }
}
