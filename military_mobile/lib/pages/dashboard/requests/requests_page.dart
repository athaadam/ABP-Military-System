import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../models/request_model.dart';
import '../../../services/api_service.dart';

class RequestsPage extends StatefulWidget {
  const RequestsPage({super.key});

  @override
  State<RequestsPage> createState() => _RequestsPageState();
}

class _RequestsPageState extends State<RequestsPage> {
  final _api = ApiService();

  List<RequestModel> _requests = [];
  List<RequestModel> _filtered = [];
  String _selectedFilter = 'All';
  bool _loading = true;
  String? _error;

  final _filters = ['All', 'pending', 'approved', 'rejected', 'completed'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      setState(() { _loading = true; _error = null; });
      final requests = await _api.fetchMyRequests();
      if (mounted) {
        setState(() {
          _requests = requests;
          _applyFilter(_selectedFilter);
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  void _applyFilter(String filter) {
    setState(() {
      _selectedFilter = filter;
      _filtered = filter == 'All'
          ? _requests
          : _requests.where((r) => r.status == filter).toList();
    });
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'approved': return AppTheme.success;
      case 'pending': return AppTheme.warning;
      case 'rejected': return AppTheme.error;
      case 'completed': return AppTheme.primary;
      default: return AppTheme.textTertiary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('Requests'),
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _filters.map((f) {
                    final selected = _selectedFilter == f;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => _applyFilter(f),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: selected ? AppTheme.primary : AppTheme.darkSurface,
                            border: Border.all(
                              color: selected ? AppTheme.primary : AppTheme.border,
                            ),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            f == 'All' ? 'All' : f[0].toUpperCase() + f.substring(1),
                            style: TextStyle(
                              color: selected ? Colors.white : AppTheme.textSecondary,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 20),
              if (_loading)
                const Center(child: CircularProgressIndicator())
              else if (_error != null)
                Center(child: Text('Error: $_error', style: TextStyle(color: AppTheme.error)))
              else ...[
                Text(
                  'Requests (${_filtered.length})',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                if (_filtered.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Text('Tidak ada request', style: TextStyle(color: AppTheme.textTertiary)),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _filtered.length,
                    separatorBuilder: (_, _) => Divider(color: AppTheme.border),
                    itemBuilder: (context, index) {
                      final req = _filtered[index];
                      return Padding(
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
                                        req.itemName ?? 'Item #${req.itemId}',
                                        style: TextStyle(
                                          color: AppTheme.textPrimary,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Request #${req.id}',
                                        style: TextStyle(color: AppTheme.textTertiary, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _statusColor(req.status).withValues(alpha: 0.2),
                                    border: Border.all(color: _statusColor(req.status)),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    req.status[0].toUpperCase() + req.status.substring(1),
                                    style: TextStyle(
                                      color: _statusColor(req.status),
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
                                Text('Qty: ${req.quantity}',
                                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                                Text(
                                  '${req.createdAt.day}/${req.createdAt.month}/${req.createdAt.year}',
                                  style: TextStyle(color: AppTheme.textTertiary, fontSize: 12),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
