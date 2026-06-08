import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../config/theme.dart';
import '../../../models/request_model.dart';
import '../../../services/api_service.dart';
import '../../../widgets/dashboard/stat_card.dart';

class StatisticsPage extends StatefulWidget {
  const StatisticsPage({super.key});

  @override
  State<StatisticsPage> createState() => _StatisticsPageState();
}

class _StatisticsPageState extends State<StatisticsPage> {
  final _api = ApiService();

  int _totalItems = 0;
  int _totalRequests = 0;
  int _pending = 0;
  int _approved = 0;
  int _rejected = 0;
  int _completed = 0;
  List<RequestModel> _requests = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      setState(() { _loading = true; _error = null; });
      final results = await Future.wait([
        _api.fetchItems(),
        _api.fetchMyRequests(),
      ]);
      final items = results[0];
      final reqs = results[1] as List<RequestModel>;
      if (mounted) {
        setState(() {
          _totalItems = items.length;
          _requests = reqs;
          _totalRequests = reqs.length;
          _pending = reqs.where((r) => r.status == 'pending').length;
          _approved = reqs.where((r) => r.status == 'approved').length;
          _rejected = reqs.where((r) => r.status == 'rejected').length;
          _completed = reqs.where((r) => r.status == 'completed').length;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  List<FlSpot> _buildTrendSpots() {
    final now = DateTime.now();
    final counts = List<double>.filled(7, 0);
    for (final r in _requests) {
      final diff = now.difference(r.createdAt).inDays;
      if (diff >= 0 && diff < 7) {
        counts[6 - diff] += 1;
      }
    }
    return List.generate(7, (i) => FlSpot(i.toDouble(), counts[i]));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('Statistics'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text('Error: $_error', style: TextStyle(color: AppTheme.error)))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Key Metrics', style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 12),
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: 1.2,
                          children: [
                            StatCard(title: 'Total Items', value: '$_totalItems', icon: Icons.inventory_2, iconColor: AppTheme.primary),
                            StatCard(title: 'Total Requests', value: '$_totalRequests', icon: Icons.request_page, iconColor: AppTheme.secondary),
                            StatCard(title: 'Pending', value: '$_pending', icon: Icons.schedule, iconColor: AppTheme.warning),
                            StatCard(title: 'Completed', value: '$_completed', icon: Icons.check_circle, iconColor: AppTheme.success),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Text('Request Trend (7 hari)', style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.darkCard,
                            border: Border.all(color: AppTheme.border),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: SizedBox(
                            height: 200,
                            child: LineChart(
                              LineChartData(
                                gridData: FlGridData(
                                  show: true,
                                  getDrawingHorizontalLine: (_) => FlLine(color: AppTheme.border.withValues(alpha: 0.2), strokeWidth: 1),
                                  getDrawingVerticalLine: (_) => FlLine(color: AppTheme.border.withValues(alpha: 0.2), strokeWidth: 1),
                                ),
                                titlesData: FlTitlesData(
                                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                  bottomTitles: AxisTitles(
                                    sideTitles: SideTitles(
                                      showTitles: true,
                                      getTitlesWidget: (value, _) {
                                        const days = ['6d', '5d', '4d', '3d', '2d', '1d', 'Hari ini'];
                                        final i = value.toInt();
                                        return Text(i < days.length ? days[i] : '', style: TextStyle(color: AppTheme.textTertiary, fontSize: 9));
                                      },
                                    ),
                                  ),
                                  leftTitles: AxisTitles(
                                    sideTitles: SideTitles(
                                      showTitles: true,
                                      getTitlesWidget: (value, _) => Text('${value.toInt()}', style: TextStyle(color: AppTheme.textTertiary, fontSize: 10)),
                                    ),
                                  ),
                                ),
                                borderData: FlBorderData(
                                  show: true,
                                  border: Border(
                                    bottom: BorderSide(color: AppTheme.border),
                                    left: BorderSide(color: AppTheme.border),
                                    right: const BorderSide(color: Colors.transparent),
                                    top: const BorderSide(color: Colors.transparent),
                                  ),
                                ),
                                minX: 0,
                                maxX: 6,
                                minY: 0,
                                lineBarsData: [
                                  LineChartBarData(
                                    spots: _buildTrendSpots(),
                                    isCurved: true,
                                    gradient: LinearGradient(colors: [AppTheme.primary, AppTheme.secondary]),
                                    barWidth: 2,
                                    dotData: FlDotData(
                                      getDotPainter: (_, _, _, _) => FlDotCirclePainter(
                                        radius: 3,
                                        color: AppTheme.primary,
                                        strokeColor: AppTheme.darkCard,
                                        strokeWidth: 2,
                                      ),
                                    ),
                                    belowBarData: BarAreaData(
                                      show: true,
                                      gradient: LinearGradient(
                                        colors: [AppTheme.primary.withValues(alpha: 0.2), Colors.transparent],
                                        begin: Alignment.topCenter,
                                        end: Alignment.bottomCenter,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text('Summary', style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.darkCard,
                            border: Border.all(color: AppTheme.border),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            children: [
                              _summaryRow('Total Items', '$_totalItems'),
                              Divider(color: AppTheme.border, height: 16),
                              _summaryRow('Pending Requests', '$_pending'),
                              Divider(color: AppTheme.border, height: 16),
                              _summaryRow('Approved', '$_approved'),
                              Divider(color: AppTheme.border, height: 16),
                              _summaryRow('Rejected', '$_rejected'),
                            ],
                          ),
                        ),
                      ],
                    ),
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
        Text(value, style: TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
