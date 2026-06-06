import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class RequestsPage extends StatefulWidget {
  const RequestsPage({super.key});

  @override
  State<RequestsPage> createState() => _RequestsPageState();
}

class _RequestsPageState extends State<RequestsPage> {
  final _requests = [
    {
      'id': 'REQ-001',
      'item': 'Rifle',
      'qty': '50',
      'status': 'Approved',
      'date': '2024-01-15',
    },
    {
      'id': 'REQ-002',
      'item': 'Ammunition',
      'qty': '1000',
      'status': 'Pending',
      'date': '2024-01-16',
    },
    {
      'id': 'REQ-003',
      'item': 'Helmet',
      'qty': '100',
      'status': 'Rejected',
      'date': '2024-01-14',
    },
  ];

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Approved':
        return AppTheme.success;
      case 'Pending':
        return AppTheme.warning;
      case 'Rejected':
        return AppTheme.error;
      default:
        return AppTheme.textTertiary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: Text('Requests'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('New request form coming soon')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Filter tabs
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('All', true),
                  SizedBox(width: 8),
                  _buildFilterChip('Pending', false),
                  SizedBox(width: 8),
                  _buildFilterChip('Approved', false),
                  SizedBox(width: 8),
                  _buildFilterChip('Rejected', false),
                ],
              ),
            ),
            SizedBox(height: 20),

            // Requests List
            Text(
              'Recent Requests (${_requests.length})',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              itemCount: _requests.length,
              separatorBuilder: (context, index) => Divider(color: AppTheme.border),
              itemBuilder: (context, index) {
                final req = _requests[index];
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
                                  req['item']!,
                                  style: TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Request ID: ${req['id']}',
                                  style: TextStyle(
                                    color: AppTheme.textTertiary,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: _getStatusColor(req['status']!).withValues(alpha: 0.2),
                              border: Border.all(
                                color: _getStatusColor(req['status']!),
                              ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              req['status']!,
                              style: TextStyle(
                                color: _getStatusColor(req['status']!),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Qty: ${req['qty']}',
                            style: TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            req['date']!,
                            style: TextStyle(
                              color: AppTheme.textTertiary,
                              fontSize: 12,
                            ),
                          ),
                        ],
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

  Widget _buildFilterChip(String label, bool selected) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: selected ? AppTheme.primary : AppTheme.darkSurface,
        border: Border.all(
          color: selected ? AppTheme.primary : AppTheme.border,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: selected ? Colors.white : AppTheme.textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
