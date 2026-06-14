import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../config/theme.dart';
import '../../controllers/auth_controller.dart';
import '../../services/api_service.dart';
import 'inventory/inventory_page.dart';
import 'requests/requests_page.dart';
import 'statistics/statistics_page.dart';
import 'units/units_page.dart';
import 'warehouses/warehouses_page.dart';
import 'users/users_page.dart';
import 'settings/settings_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final _authController = Get.find<AuthController>();
  final _api = ApiService();

  int _totalItems = 0;
  int _totalRequests = 0;
  int _totalWarehouses = 0;
  int _totalUnits = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  bool get _isAdmin {
    final role = _authController.user.value?.role ?? 'user';
    return role == 'admin' || role == 'superadmin';
  }

  bool get _isSuperAdmin => _authController.user.value?.role == 'superadmin';

  Future<void> _loadStats() async {
    try {
      final requestsFuture = _isAdmin
          ? _api.fetchPendingRequests()
          : _api.fetchMyRequests();

      final results = await Future.wait([
        _api.fetchItems(),
        requestsFuture,
        _api.fetchWarehouses(),
        _api.fetchUnits(),
      ]);
      if (mounted) {
        setState(() {
          _totalItems = results[0].length;
          _totalRequests = results[1].length;
          _totalWarehouses = results[2].length;
          _totalUnits = results[3].length;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('Dashboard'),
        elevation: 0,
        backgroundColor: AppTheme.darkCard,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SettingsPage()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _authController.logout(),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadStats,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome Card
                Container(
                  padding: const EdgeInsets.all(20),
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
                      const Text(
                        'Selamat datang!',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Obx(
                        () => Text(
                          _authController.user.value?.name ?? 'User',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.9),
                            fontSize: 16,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Obx(
                        () => Text(
                          _roleLabel(_authController.user.value?.role ?? 'user'),
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.7),
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                Text('Statistik', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12),
                _loading
                    ? const Center(child: CircularProgressIndicator())
                    : GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 1.2,
                        children: [
                          _buildStatCard('Total Item', '$_totalItems', Icons.inventory_2),
                          _buildStatCard(
                            _isAdmin ? 'Permintaan Pending' : 'Permintaan Saya',
                            '$_totalRequests',
                            Icons.request_page,
                          ),
                          _buildStatCard('Gudang', '$_totalWarehouses', Icons.warehouse),
                          _buildStatCard('Unit', '$_totalUnits', Icons.business),
                        ],
                      ),
                const SizedBox(height: 24),

                Text('Menu', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12),
                _buildMenuList(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'Anggota';
    }
  }

  Widget _buildStatCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
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
              const SizedBox(height: 4),
              Text(title, style: TextStyle(color: AppTheme.textTertiary, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMenuList(BuildContext context) {
    final menuItems = <Map<String, dynamic>>[
      {
        'label': 'Inventory',
        'icon': Icons.inventory_2,
        'builder': () => InventoryPage(),
      },
      {
        'label': 'Permintaan',
        'icon': Icons.request_page,
        'builder': () => RequestsPage(),
      },
      {
        'label': 'Statistik',
        'icon': Icons.bar_chart,
        'builder': () => const StatisticsPage(),
      },
      {
        'label': 'Gudang',
        'icon': Icons.warehouse,
        'builder': () => WarehousesPage(),
      },
      {
        'label': 'Unit',
        'icon': Icons.business,
        'builder': () => UnitsPage(),
      },
      if (_isSuperAdmin)
        {
          'label': 'Manajemen User',
          'icon': Icons.people,
          'builder': () => UsersPage(),
        },
      {
        'label': 'Pengaturan',
        'icon': Icons.settings,
        'builder': () => const SettingsPage(),
      },
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
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
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => (item['builder'] as Widget Function())(),
            ),
          ),
        );
      },
    );
  }
}
