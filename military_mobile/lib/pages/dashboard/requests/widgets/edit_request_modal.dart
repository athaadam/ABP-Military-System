import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/requests_controller.dart';
import '../../../../models/request_model.dart';

class EditRequestModal extends StatefulWidget {
  final RequestsController controller;
  final RequestModel request;

  const EditRequestModal({
    super.key,
    required this.controller,
    required this.request,
  });

  @override
  State<EditRequestModal> createState() => _EditRequestModalState();
}

class _EditRequestModalState extends State<EditRequestModal> {
  late TextEditingController _itemNameController;
  late TextEditingController _quantityController;
  late TextEditingController _unitController;
  late TextEditingController _reasonController;

  @override
  void initState() {
    super.initState();
    _itemNameController = TextEditingController(text: widget.request.itemName);
    _quantityController = TextEditingController(text: widget.request.quantity.toString());
    _unitController = TextEditingController(text: widget.request.unit);
    _reasonController = TextEditingController(text: widget.request.reason);
  }

  @override
  void dispose() {
    _itemNameController.dispose();
    _quantityController.dispose();
    _unitController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    widget.controller.updateRequest(
      id: widget.request.id,
      itemId: widget.request.itemId,
      itemName: _itemNameController.text,
      quantity: int.tryParse(_quantityController.text) ?? widget.request.quantity,
      unit: _unitController.text,
      reason: _reasonController.text,
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
                    'Edit Request',
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
              _buildReadOnlyField('Request ID', widget.request.id),
              const SizedBox(height: 12),
              _buildTextField(_itemNameController, 'Item Name'),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      _quantityController,
                      'Quantity',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(_unitController, 'Unit'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildTextField(
                _reasonController,
                'Reason',
                maxLines: 3,
              ),
              const SizedBox(height: 20),
              Obx(
                () => widget.controller.errorMessage.value != null
                    ? Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
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
                        onPressed: widget.controller.isUpdating.value
                            ? null
                            : _handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: Text(
                          widget.controller.isUpdating.value
                              ? 'Updating...'
                              : 'Update Request',
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

  Widget _buildReadOnlyField(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppTheme.textSecondary,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppTheme.darkSurface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppTheme.border),
          ),
          child: Text(
            value,
            style: TextStyle(color: AppTheme.textSecondary),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label, {
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppTheme.textSecondary,
          ),
        ),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          style: TextStyle(color: AppTheme.textPrimary),
          decoration: InputDecoration(
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
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
        ),
      ],
    );
  }
}
