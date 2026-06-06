import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../config/theme.dart';
import '../../../widgets/dashboard/stat_card.dart';

class StatisticsPage extends StatelessWidget {
  const StatisticsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: Text('Statistics'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Key Metrics
            Text(
              'Key Metrics',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.2,
              children: [
                StatCard(
                  title: 'Total Items',
                  value: '1,234',
                  icon: Icons.inventory_2,
                  iconColor: AppTheme.primary,
                ),
                StatCard(
                  title: 'Total Requests',
                  value: '156',
                  icon: Icons.request_page,
                  iconColor: AppTheme.secondary,
                ),
                StatCard(
                  title: 'Pending',
                  value: '23',
                  icon: Icons.schedule,
                  iconColor: AppTheme.warning,
                ),
                StatCard(
                  title: 'Completed',
                  value: '128',
                  icon: Icons.check_circle,
                  iconColor: AppTheme.success,
                ),
              ],
            ),
            SizedBox(height: 24),

            // Chart Section
            Text(
              'Request Trend',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 12),
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                border: Border.all(color: AppTheme.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  SizedBox(
                    height: 200,
                    child: LineChart(
                      LineChartData(
                        gridData: FlGridData(
                          show: true,
                          drawVerticalLine: true,
                          horizontalInterval: 50,
                          verticalInterval: 1,
                          getDrawingHorizontalLine: (value) {
                            return FlLine(
                              color: AppTheme.border.withValues(alpha: 0.2),
                              strokeWidth: 1,
                            );
                          },
                          getDrawingVerticalLine: (value) {
                            return FlLine(
                              color: AppTheme.border.withValues(alpha: 0.2),
                              strokeWidth: 1,
                            );
                          },
                        ),
                        titlesData: FlTitlesData(
                          show: true,
                          rightTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          topTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                const titles = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                if (value.toInt() < titles.length) {
                                  return Text(
                                    titles[value.toInt()],
                                    style: TextStyle(
                                      color: AppTheme.textTertiary,
                                      fontSize: 10,
                                    ),
                                  );
                                }
                                return Text('');
                              },
                            ),
                          ),
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                return Text(
                                  value.toInt().toString(),
                                  style: TextStyle(
                                    color: AppTheme.textTertiary,
                                    fontSize: 10,
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                        borderData: FlBorderData(
                          show: true,
                          border: Border(
                            bottom: BorderSide(color: AppTheme.border, width: 1),
                            left: BorderSide(color: AppTheme.border, width: 1),
                            right: BorderSide(color: Colors.transparent),
                            top: BorderSide(color: Colors.transparent),
                          ),
                        ),
                        minX: 0,
                        maxX: 6,
                        minY: 0,
                        maxY: 200,
                        lineBarsData: [
                          LineChartBarData(
                            spots: const [
                              FlSpot(0, 50),
                              FlSpot(1, 80),
                              FlSpot(2, 60),
                              FlSpot(3, 120),
                              FlSpot(4, 100),
                              FlSpot(5, 140),
                              FlSpot(6, 160),
                            ],
                            isCurved: true,
                            gradient: LinearGradient(
                              colors: [
                                AppTheme.primary,
                                AppTheme.secondary,
                              ],
                            ),
                            barWidth: 2,
                            isStrokeCapRound: true,
                            dotData: FlDotData(
                              show: true,
                              getDotPainter: (spot, percent, barData, index) {
                                return FlDotCirclePainter(
                                  radius: 3,
                                  color: AppTheme.primary,
                                  strokeColor: AppTheme.darkCard,
                                  strokeWidth: 2,
                                );
                              },
                            ),
                            belowBarData: BarAreaData(
                              show: true,
                              gradient: LinearGradient(
                                colors: [
                                  AppTheme.primary.withValues(alpha: 0.2),
                                  Colors.transparent,
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 24),

            // Summary
            Text(
              'Summary',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 12),
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.darkCard,
                border: Border.all(color: AppTheme.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  _buildSummaryRow('Total Inventory Value', 'Rp 50.000.000'),
                  Divider(color: AppTheme.border, height: 16),
                  _buildSummaryRow('Active Requests', '23'),
                  Divider(color: AppTheme.border, height: 16),
                  _buildSummaryRow('Last Updated', 'Today at 14:30'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: AppTheme.textSecondary,
            fontSize: 13,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
