import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../config/theme.dart';
import '../../controllers/auth_controller.dart';
import 'inventory/inventory_page.dart';
import 'requests/requests_page.dart';
import 'statistics/statistics_page.dart';
import 'units/units_page.dart';
import 'warehouses/warehouses_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final _authController = Get.find<AuthController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: Text('Dashboard'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () => _authController.logout(),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Welcome Card
                    Container(
                      padding: EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppTheme.primary, AppTheme.secondary],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withValues(alpha: 0.3),
                            blurRadius: 20,
                            spreadRadius: 0,
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Selamat datang!',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 8),
                          Obx(
                            () => Text(
                              _authController.user.value?.name ?? 'User',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.9),
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 24),

                    // Quick Stats
                    Text(
                      'Quick Stats',
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
                        _buildStatCard('Total Items', '1,234', Icons.inventory_2),
                        _buildStatCard('Requests', '56', Icons.request_page),
                        _buildStatCard('Warehouses', '8', Icons.warehouse),
                        _buildStatCard('Units', '12', Icons.business),
                      ],
                    ),
                    SizedBox(height: 24),

                    // Menu
                    Text(
                      'Menu',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    SizedBox(height: 12),
                    _buildMenuList(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.darkCard,
        border: Border.all(color: AppTheme.border, width: 1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: AppTheme.primary, size: 24),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 4),
              Text(
                title,
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
  }

  Widget _buildMenuList() {
    final menuItems = [
      {'label': 'Inventory', 'icon': Icons.inventory_2, 'page': InventoryPage()},
      {'label': 'Requests', 'icon': Icons.request_page, 'page': RequestsPage()},
      {'label': 'Statistics', 'icon': Icons.bar_chart, 'page': StatisticsPage()},
      {'label': 'Warehouses', 'icon': Icons.warehouse, 'page': WarehousesPage()},
      {'label': 'Units', 'icon': Icons.business, 'page': UnitsPage()},
      {'label': 'Settings', 'icon': Icons.settings, 'page': null},
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: menuItems.length,
      separatorBuilder: (context, index) => Divider(color: AppTheme.border, height: 1),
      itemBuilder: (context, index) {
        final item = menuItems[index];
        return ListTile(
          leading: Icon(item['icon'] as IconData, color: AppTheme.primary),
          title: Text(
            item['label'] as String,
            style: TextStyle(color: AppTheme.textSecondary),
          ),
          trailing: Icon(Icons.arrow_forward_ios, size: 16, color: AppTheme.textTertiary),
          onTap: () {
            if (item['page'] != null) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => item['page'] as Widget),
              );
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${item['label']} coming soon')),
              );
            }
          },
        );
      },
    );
  }
}
