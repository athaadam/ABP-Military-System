import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../config/theme.dart';
import '../../../models/item.dart';
import '../../../services/inventory_service.dart';
import '../../../services/request_service.dart';

class CreateRequestPage extends StatefulWidget {
  const CreateRequestPage({super.key});

  @override
  State<CreateRequestPage> createState() => _CreateRequestPageState();
}

class _CreateRequestPageState extends State<CreateRequestPage> {
  final _inventoryService = InventoryService();
  final _requestService = RequestService();

  List<Item> _items = [];
  List<Item> _filtered = [];
  bool _loadingItems = true;
  String _searchQuery = '';

  Item? _selectedItem;
  final _quantityController = TextEditingController(text: '1');
  final _reasonController = TextEditingController();
  final _searchController = TextEditingController();

  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _reasonController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadItems() async {
    try {
      setState(() => _loadingItems = true);
      final items = await _inventoryService.getAll();
      setState(() {
        _items = items;
        _filtered = items;
        _loadingItems = false;
      });
    } catch (e) {
      setState(() => _loadingItems = false);
      Get.snackbar('Error', 'Gagal memuat daftar item');
    }
  }

  void _onSearch(String query) {
    setState(() {
      _searchQuery = query;
      _filtered = _items
          .where((item) =>
              item.name.toLowerCase().contains(query.toLowerCase()) ||
              item.category.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });
  }

  void _selectItem(Item item) {
    setState(() {
      _selectedItem = item;
      _errorMessage = null;
    });
  }

  Future<void> _submit() async {
    final qty = int.tryParse(_quantityController.text.trim()) ?? 0;
    final reason = _reasonController.text.trim();

    if (_selectedItem == null) {
      setState(() => _errorMessage = 'Pilih item terlebih dahulu');
      return;
    }
    if (qty <= 0) {
      setState(() => _errorMessage = 'Jumlah harus lebih dari 0');
      return;
    }
    if (reason.isEmpty) {
      setState(() => _errorMessage = 'Alasan wajib diisi');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      await _requestService.create(
        itemId: _selectedItem!.id,
        quantity: qty,
        reason: reason,
      );
      Get.back(result: true);
      Get.snackbar('Berhasil', 'Permintaan berhasil dikirim');
    } catch (e) {
      final msg = e.toString();
      setState(() {
        _errorMessage = msg.contains('Insufficient stock')
            ? 'Stok tidak mencukupi'
            : msg.contains('Connection refused')
                ? 'Tidak dapat terhubung ke server'
                : 'Gagal mengirim permintaan';
        _isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('Buat Permintaan'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
      ),
      body: Column(
        children: [
          // Item selection section
          if (_selectedItem != null)
            _buildSelectedItemBanner()
          else
            _buildItemPicker(),

          // Form section (only when item selected)
          if (_selectedItem != null) ...[
            Expanded(child: _buildForm()),
          ],
        ],
      ),
    );
  }

  Widget _buildSelectedItemBanner() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.primary.withValues(alpha: 0.15),
        border: Border.all(color: AppTheme.primary.withValues(alpha: 0.4)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(Icons.inventory_2, color: AppTheme.primary, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _selectedItem!.name,
                  style: TextStyle(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  '${_selectedItem!.category} • Stok: ${_selectedItem!.stock}',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => setState(() => _selectedItem = null),
            child: Text('Ganti', style: TextStyle(color: AppTheme.primary, fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Widget _buildItemPicker() {
    return Expanded(
      child: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearch,
              style: TextStyle(color: AppTheme.textPrimary),
              decoration: InputDecoration(
                hintText: 'Cari item...',
                hintStyle: TextStyle(color: AppTheme.textTertiary),
                prefixIcon: Icon(Icons.search, color: AppTheme.textTertiary),
                filled: true,
                fillColor: AppTheme.darkSurface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: AppTheme.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: AppTheme.border),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),

          // Item list
          Expanded(
            child: _loadingItems
                ? const Center(child: CircularProgressIndicator())
                : _filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inbox, size: 48, color: AppTheme.textTertiary),
                            const SizedBox(height: 12),
                            Text(
                              _searchQuery.isEmpty ? 'Tidak ada item' : 'Item tidak ditemukan',
                              style: TextStyle(color: AppTheme.textSecondary),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadItems,
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          itemCount: _filtered.length,
                          separatorBuilder: (context, i) =>
                              Divider(color: AppTheme.border, height: 1),
                          itemBuilder: (context, index) {
                            final item = _filtered[index];
                            return ListTile(
                              contentPadding: const EdgeInsets.symmetric(
                                  vertical: 8, horizontal: 4),
                              leading: Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: AppTheme.darkSurface,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppTheme.border),
                                ),
                                child: Icon(
                                  _categoryIcon(item.category),
                                  color: AppTheme.primary,
                                  size: 20,
                                ),
                              ),
                              title: Text(
                                item.name,
                                style: TextStyle(
                                  color: AppTheme.textPrimary,
                                  fontWeight: FontWeight.w500,
                                  fontSize: 14,
                                ),
                              ),
                              subtitle: Text(
                                item.category,
                                style: TextStyle(
                                    color: AppTheme.textSecondary, fontSize: 12),
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    'Stok: ${item.stock}',
                                    style: TextStyle(
                                      color: item.stock > 0
                                          ? Colors.green.shade400
                                          : Colors.red.shade400,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item.condition,
                                    style: TextStyle(
                                        color: AppTheme.textTertiary, fontSize: 11),
                                  ),
                                ],
                              ),
                              onTap: () => _selectItem(item),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Quantity
          Text(
            'Jumlah',
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _quantityController,
            keyboardType: TextInputType.number,
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
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
          ),
          const SizedBox(height: 16),

          // Reason
          Text(
            'Alasan Permintaan',
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _reasonController,
            maxLines: 4,
            style: TextStyle(color: AppTheme.textPrimary),
            decoration: InputDecoration(
              hintText: 'Kenapa Anda membutuhkan item ini?',
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
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
          ),

          if (_errorMessage != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                border:
                    Border.all(color: Colors.red.withValues(alpha: 0.3)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ),
          ],

          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            child: _isSubmitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                : const Text(
                    'Kirim Permintaan',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 15),
                  ),
          ),
        ],
      ),
    );
  }

  IconData _categoryIcon(String category) {
    switch (category) {
      case 'Persenjataan':
        return Icons.security;
      case 'Amunisi':
        return Icons.circle;
      case 'Kendaraan Militer':
        return Icons.directions_car;
      default:
        return Icons.inventory_2;
    }
  }
}
