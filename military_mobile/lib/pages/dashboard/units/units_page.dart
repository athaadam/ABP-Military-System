import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class UnitsPage extends StatelessWidget {
  const UnitsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final units = [
      {'name': 'Alpha Unit', 'code': 'UNIT-001', 'members': '50', 'status': 'Active'},
      {'name': 'Bravo Unit', 'code': 'UNIT-002', 'members': '45', 'status': 'Active'},
      {'name': 'Charlie Unit', 'code': 'UNIT-003', 'members': '40', 'status': 'Inactive'},
      {'name': 'Delta Unit', 'code': 'UNIT-004', 'members': '55', 'status': 'Active'},
    ];

    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: Text('Units'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'All Units (${units.length})',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              itemCount: units.length,
              separatorBuilder: (context, index) => Divider(color: AppTheme.border),
              itemBuilder: (context, index) {
                final unit = units[index];
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
                                  unit['name']!,
                                  style: TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  unit['code']!,
                                  style: TextStyle(
                                    color: AppTheme.textTertiary,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: unit['status'] == 'Active'
                                  ? AppTheme.success.withValues(alpha: 0.2)
                                  : AppTheme.textTertiary.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              unit['status']!,
                              style: TextStyle(
                                color: unit['status'] == 'Active'
                                    ? AppTheme.success
                                    : AppTheme.textTertiary,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 8),
                      Text(
                        '${unit['members']} Members',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 12,
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
