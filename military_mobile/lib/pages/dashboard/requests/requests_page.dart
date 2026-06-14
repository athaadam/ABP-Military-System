import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../config/theme.dart';
import '../../../controllers/requests_controller.dart';
import '../../../controllers/inventory_controller.dart';
import 'widgets/request_list_item.dart';
import 'widgets/create_request_modal.dart';

class RequestsPage extends StatelessWidget {
  final RequestsController _requestsController = Get.isRegistered<RequestsController>()
      ? Get.find<RequestsController>()
      : Get.put(RequestsController());
  final InventoryController _inventoryController = Get.isRegistered<InventoryController>()
      ? Get.find<InventoryController>()
      : Get.put(InventoryController());

  final _statusFilter = Rx<String>('all');

  RequestsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: Obx(
          () => Text(_requestsController.isAdminScope ? 'Permintaan Pending' : 'Permintaan Saya'),
        ),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
        actions: [
          Obx(
            () => _requestsController.isLoading.value
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
                    onPressed: () => _requestsController.fetchRequests(),
                  ),
          ),
        ],
      ),
      floatingActionButton: Obx(
        () => _requestsController.isAdminScope
            ? const SizedBox.shrink()
            : FloatingActionButton(
                backgroundColor: AppTheme.primary,
                onPressed: () => _showCreateModal(context),
                child: const Icon(Icons.add),
              ),
      ),
      body: Obx(
        () {
          if (_requestsController.isLoading.value && _requestsController.requests.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (_requestsController.errorMessage.value != null &&
              _requestsController.requests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    _requestsController.errorMessage.value ?? 'Gagal memuat permintaan',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _requestsController.fetchRequests(),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }

          final filteredRequests = _statusFilter.value == 'all'
              ? _requestsController.requests
              : _requestsController.requests
                  .where((r) => r.status.toLowerCase() == _statusFilter.value)
                  .toList();

          if (filteredRequests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inbox, size: 48, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text(
                    _requestsController.isAdminScope
                        ? 'Tidak ada permintaan pending'
                        : 'Belum ada permintaan',
                    style: const TextStyle(color: Colors.grey),
                  ),
                  if (!_requestsController.isAdminScope) ...[
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () => _showCreateModal(context),
                      icon: const Icon(Icons.add),
                      label: const Text('Buat Permintaan'),
                    ),
                  ],
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => _requestsController.fetchRequests(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (!_requestsController.isAdminScope) ...[
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('Semua', 'all'),
                        const SizedBox(width: 8),
                        _buildFilterChip('Menunggu', 'pending'),
                        const SizedBox(width: 8),
                        _buildFilterChip('Disetujui', 'approved'),
                        const SizedBox(width: 8),
                        _buildFilterChip('Ditolak', 'rejected'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredRequests.length,
                  separatorBuilder: (context, index) => Divider(color: AppTheme.border),
                  itemBuilder: (context, index) {
                    final request = filteredRequests[index];
                    return RequestListItem(
                      request: request,
                      isAdminScope: _requestsController.isAdminScope,
                      onApprove: () => _requestsController.approveRequest(request.id),
                      onReject: () => _requestsController.rejectRequest(request.id),
                    );
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    return Obx(
      () => GestureDetector(
        onTap: () => _statusFilter.value = value,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _statusFilter.value == value ? AppTheme.primary : AppTheme.darkSurface,
            border: Border.all(
              color: _statusFilter.value == value ? AppTheme.primary : AppTheme.border,
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: _statusFilter.value == value ? Colors.white : AppTheme.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  void _showCreateModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => CreateRequestModal(
        controller: _requestsController,
        items: _inventoryController.items,
      ),
    );
  }
}
