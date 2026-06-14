import 'package:flutter/material.dart';
import '../../../../config/theme.dart';
import '../../../../models/warehouse.dart';

class WarehouseListItem extends StatelessWidget {
  final Warehouse warehouse;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const WarehouseListItem({
    super.key,
    required this.warehouse,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final occupancyColor = warehouse.occupancyPercentage > 80
        ? Colors.red
        : warehouse.occupancyPercentage > 50
            ? Colors.orange
            : Colors.green;

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
                      warehouse.name,
                      style: TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      warehouse.id,
                      style: TextStyle(
                        color: AppTheme.textTertiary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.darkSurface,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              warehouse.location,
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 11,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Capacity',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    '${warehouse.occupied}/${warehouse.capacity}',
                    style: TextStyle(
                      color: occupancyColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: warehouse.occupancyPercentage / 100,
                  minHeight: 6,
                  backgroundColor: AppTheme.darkSurface,
                  valueColor: AlwaysStoppedAnimation<Color>(occupancyColor),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${warehouse.occupancyPercentage.toStringAsFixed(1)}% occupied',
                style: TextStyle(
                  color: AppTheme.textTertiary,
                  fontSize: 10,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
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
