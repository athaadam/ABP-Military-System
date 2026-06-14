import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/units_controller.dart';

class CreateUnitModal extends StatefulWidget {
  final UnitsController controller;

  const CreateUnitModal({
    super.key,
    required this.controller,
  });

  @override
  State<CreateUnitModal> createState() => _CreateUnitModalState();
}

class _CreateUnitModalState extends State<CreateUnitModal> {
  late TextEditingController _idController;
  late TextEditingController _nameController;

  @override
  void initState() {
    super.initState();
    _idController = TextEditingController();
    _nameController = TextEditingController();
  }

  @override
  void dispose() {
    _idController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    widget.controller.createUnit(
      id: _idController.text,
      name: _nameController.text,
    );

    if (widget.controller.errorMessage.value == null) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppTheme.darkCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Create Unit',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                    color: Colors.grey,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                'Unit Code',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _idController,
                style: TextStyle(color: AppTheme.textPrimary),
                decoration: InputDecoration(
                  hintText: 'e.g., ALPHA-01',
                  hintStyle: TextStyle(color: AppTheme.textTertiary),
                  filled: true,
                  fillColor: AppTheme.darkSurface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppTheme.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppTheme.border),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Unit Name',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _nameController,
                style: TextStyle(color: AppTheme.textPrimary),
                decoration: InputDecoration(
                  hintText: 'e.g., Alpha Squad',
                  hintStyle: TextStyle(color: AppTheme.textTertiary),
                  filled: true,
                  fillColor: AppTheme.darkSurface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppTheme.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppTheme.border),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Obx(
                () => widget.controller.errorMessage.value != null
                    ? Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: Colors.red.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Text(
                          widget.controller.errorMessage.value ?? '',
                          style: const TextStyle(color: Colors.red, fontSize: 12),
                        ),
                      )
                    : const SizedBox.shrink(),
              ),
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
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Obx(
                      () => ElevatedButton(
                        onPressed: widget.controller.isCreating.value
                            ? null
                            : _handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: Text(
                          widget.controller.isCreating.value
                              ? 'Creating...'
                              : 'Create',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
