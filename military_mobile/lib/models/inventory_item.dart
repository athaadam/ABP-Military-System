class InventoryItem {
  final String id;
  final String name;
  final String code;
  final String category;
  final int quantity;
  final String unit;
  final int minStock;
  final String warehouseId;
  final DateTime createdAt;
  final DateTime updatedAt;

  InventoryItem({
    required this.id,
    required this.name,
    required this.code,
    required this.category,
    required this.quantity,
    required this.unit,
    required this.minStock,
    required this.warehouseId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      code: json['code'] as String? ?? '',
      category: json['category'] as String? ?? '',
      quantity: json['quantity'] as int? ?? 0,
      unit: json['unit'] as String? ?? '',
      minStock: json['min_stock'] as int? ?? 0,
      warehouseId: json['warehouse_id'] as String? ?? '',
      createdAt: DateTime.parse(json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'category': category,
      'quantity': quantity,
      'unit': unit,
      'min_stock': minStock,
      'warehouse_id': warehouseId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  bool get isLowStock => quantity <= minStock;
}
