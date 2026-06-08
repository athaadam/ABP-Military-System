class Item {
  final int id;
  final String name;
  final String category;
  final int stock;
  final String condition;
  final int warehouseId;
  final String? warehouseName;

  Item({
    required this.id,
    required this.name,
    required this.category,
    required this.stock,
    required this.condition,
    required this.warehouseId,
    this.warehouseName,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      category: json['category'] as String? ?? '',
      stock: json['stock'] as int? ?? 0,
      condition: json['condition'] as String? ?? '',
      warehouseId: json['warehouseId'] as int? ?? 0,
      warehouseName: json['warehouseName'] as String?,
    );
  }
}
