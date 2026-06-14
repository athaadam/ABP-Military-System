import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/theme.dart';
import '../../../../controllers/inventory_controller.dart';
import '../../../../models/warehouse.dart';

class CreateInventoryModal extends StatefulWidget {
  final InventoryController controller;
  final List<Warehouse> warehouses;

  const CreateInventoryModal({
    super.key,
    required this.controller,
    required this.warehouses,
  });

  @override
  State<CreateInventoryModal> createState() => _CreateInventoryModalState();
}

class _CreateInventoryModalState extends State<CreateInventoryModal> {
  late TextEditingController _nameController;
  late TextEditingController _stockController;
  String? _selectedCategory;
  String? _selectedCondition;
  int? _selectedWarehouseId;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _stockController = TextEditingController(text: '0');
    _selectedCategory = InventoryController.categories.first;
    _selectedCondition = InventoryController.conditions.first;
    if (widget.warehouses.isNotEmpty) {
      _selectedWarehouseId = widget.warehouses.first.id;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _stockController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    if (_selectedWarehouseId == null) {
      widget.controller.errorMessage.value = 'Pilih gudang terlebih dahulu';
      return;
    }
    widget.controller.errorMessage.value = null;

    await widget.controller.createItem(
      name: _nameController.text,
      category: _selectedCategory ?? InventoryController.categories.first,
      stock: int.tryParse(_stockController.text) ?? 0,
      condition: _selectedCondition ?? InventoryController.conditions.first,
      warehouseId: _selectedWarehouseId!,
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
                    'Tambah Item',
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
              _buildTextField(_nameController, 'Nama Item', 'cth. Senapan M16'),
              const SizedBox(height: 12),
              _buildDropdown<String>(
                label: 'Kategori',
                value: _selectedCategory,
                items: InventoryController.categories,
                itemLabel: (c) => c,
                onChanged: (v) => setState(() => _selectedCategory = v),
              ),
              const SizedBox(height: 12),
              _buildTextField(
                _stockController,
                'Stok',
                '0',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              _buildDropdown<String>(
                label: 'Kondisi',
                value: _selectedCondition,
                items: InventoryController.conditions,
                itemLabel: (c) => c,
                onChanged: (v) => setState(() => _selectedCondition = v),
              ),
              const SizedBox(height: 12),
              _buildDropdown<int>(
                label: 'Gudang',
                value: _selectedWarehouseId,
                items: widget.warehouses.map((w) => w.id).toList(),
                itemLabel: (id) => widget.warehouses.firstWhere((w) => w.id == id).name,
                onChanged: (v) => setState(() => _selectedWarehouseId = v),
                emptyHint: 'Tidak ada gudang tersedia',
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
                      child: const Text('Batal'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Obx(
                      () => ElevatedButton(
                        onPressed: widget.controller.isCreating.value ? null : _handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: Text(
                          widget.controller.isCreating.value ? 'Menyimpan...' : 'Simpan',
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

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    String hint, {
    TextInputType keyboardType = TextInputType.text,
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
          style: TextStyle(color: AppTheme.textPrimary),
          decoration: InputDecoration(
            hintText: hint,
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
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown<T>({
    required String label,
    required T? value,
    required List<T> items,
    required String Function(T) itemLabel,
    required void Function(T?) onChanged,
    String? emptyHint,
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
        items.isEmpty
            ? Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Text(
                  emptyHint ?? 'Tidak ada pilihan',
                  style: TextStyle(color: AppTheme.textTertiary, fontSize: 14),
                ),
              )
            : Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppTheme.darkSurface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: DropdownButton<T>(
                  value: value,
                  isExpanded: true,
                  dropdownColor: AppTheme.darkCard,
                  style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                  underline: const SizedBox.shrink(),
                  items: items
                      .map((item) => DropdownMenuItem<T>(
                            value: item,
                            child: Text(itemLabel(item)),
                          ))
                      .toList(),
                  onChanged: onChanged,
                ),
              ),
      ],
    );
  }
}
