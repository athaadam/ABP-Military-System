import 'package:flutter/material.dart';
import '../../../../config/theme.dart';
import '../../../../models/request_model.dart';

class RequestListItem extends StatelessWidget {
  final RequestModel request;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  const RequestListItem({
    super.key,
    required this.request,
    required this.onEdit,
    required this.onDelete,
    required this.onApprove,
    required this.onReject,
  });

  Color _getStatusColor(String status) {
    final s = status.toLowerCase();
    if (s == 'approved') return Colors.green;
    if (s == 'pending') return Colors.orange;
    if (s == 'rejected') return Colors.red;
    return AppTheme.textTertiary;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      request.itemName,
                      style: TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'ID: ${request.id}',
                      style: TextStyle(
                        color: AppTheme.textTertiary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusColor(request.status).withValues(alpha: 0.2),
                  border: Border.all(color: _getStatusColor(request.status)),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  request.status.toUpperCase(),
                  style: TextStyle(
                    color: _getStatusColor(request.status),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Qty: ${request.quantity} ${request.unit}',
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                ),
              ),
              Text(
                request.createdAt.toString().split(' ')[0],
                style: TextStyle(
                  color: AppTheme.textTertiary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          if (request.reason.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'Reason: ${request.reason}',
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 11,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (request.isPending) ...[
                _ActionButton(
                  icon: Icons.check,
                  label: 'Approve',
                  onPressed: onApprove,
                  color: Colors.green,
                ),
                const SizedBox(width: 8),
                _ActionButton(
                  icon: Icons.close,
                  label: 'Reject',
                  onPressed: onReject,
                  color: Colors.red,
                ),
                const SizedBox(width: 8),
              ],
              _ActionButton(
                icon: Icons.edit,
                label: 'Edit',
                onPressed: onEdit,
                color: AppTheme.primary,
              ),
              const SizedBox(width: 8),
              _ActionButton(
                icon: Icons.delete,
                label: 'Delete',
                onPressed: onDelete,
                color: Colors.red,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;
  final Color color;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onPressed,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 16),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: color.withValues(alpha: 0.3)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }
}
