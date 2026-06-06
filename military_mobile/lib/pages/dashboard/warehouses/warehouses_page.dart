import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class WarehousesPage extends StatelessWidget {
  const WarehousesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final warehouses = [
      {'name': 'Warehouse A', 'location': 'Jakarta', 'capacity': '1000', 'used': '650'},
      {'name': 'Warehouse B', 'location': 'Bandung', 'capacity': '800', 'used': '420'},
      {'name': 'Warehouse C', 'location': 'Surabaya', 'capacity': '1200', 'used': '890'},
    ];

    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: Text('Warehouses'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'All Warehouses (${warehouses.length})',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              itemCount: warehouses.length,
              separatorBuilder: (context, index) => Divider(color: AppTheme.border),
              itemBuilder: (context, index) {
                final warehouse = warehouses[index];
                final capacity = int.parse(warehouse['capacity']!);
                final used = int.parse(warehouse['used']!);
                final percentage = (used / capacity * 100).toStringAsFixed(0);

                return Container(
                  padding: EdgeInsets.symmetric(vertical: 12),
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
                                  warehouse['name']!,
                                  style: TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(Icons.location_on,
                                        size: 12, color: AppTheme.textTertiary),
                                    SizedBox(width: 4),
                                    Text(
                                      warehouse['location']!,
                                      style: TextStyle(
                                        color: AppTheme.textTertiary,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '$percentage%',
                            style: TextStyle(
                              color: AppTheme.primary,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 8),
                      // Capacity Bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: used / capacity,
                          minHeight: 6,
                          backgroundColor: AppTheme.border.withValues(alpha: 0.3),
                          valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primary),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        '${warehouse['used']}/${warehouse['capacity']} items',
                        style: TextStyle(
                          color: AppTheme.textTertiary,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
