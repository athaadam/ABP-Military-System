import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../config/theme.dart';
import '../../../controllers/requests_controller.dart';
import 'widgets/request_list_item.dart';
import 'widgets/create_request_modal.dart';
import 'widgets/edit_request_modal.dart';
import 'widgets/delete_request_dialog.dart';

class RequestsPage extends StatelessWidget {
  final _requestsController = Get.put(RequestsController());
  final _statusFilter = Rx<String>('all');

  RequestsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('Requests'),
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
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primary,
        onPressed: () => _showCreateModal(context),
        child: const Icon(Icons.add),
      ),
      body: Obx(
        () {
          if (_requestsController.isLoading.value && _requestsController.requests.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (_requestsController.errorMessage.value != null && _requestsController.requests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    _requestsController.errorMessage.value ?? 'Failed to load requests',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _requestsController.fetchRequests(),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
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
                  const Text(
                    'No requests found',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showCreateModal(context),
                    icon: const Icon(Icons.add),
                    label: const Text('Create Request'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => _requestsController.fetchRequests(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('All', 'all'),
                      const SizedBox(width: 8),
                      _buildFilterChip('Pending', 'pending'),
                      const SizedBox(width: 8),
                      _buildFilterChip('Approved', 'approved'),
                      const SizedBox(width: 8),
                      _buildFilterChip('Rejected', 'rejected'),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredRequests.length,
                  separatorBuilder: (context, index) => Divider(color: AppTheme.border),
                  itemBuilder: (context, index) {
                    final request = filteredRequests[index];
                    return RequestListItem(
                      request: request,
                      onEdit: () => _showEditModal(context, request),
                      onDelete: () => _showDeleteDialog(context, request.id),
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
      builder: (context) => CreateRequestModal(controller: _requestsController),
    );
  }

  void _showEditModal(BuildContext context, dynamic request) {
    showDialog(
      context: context,
      builder: (context) => EditRequestModal(
        controller: _requestsController,
        request: request,
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, String requestId) {
    showDialog(
      context: context,
      builder: (context) => DeleteRequestDialog(
        controller: _requestsController,
        requestId: requestId,
      ),
    );
  }
}
