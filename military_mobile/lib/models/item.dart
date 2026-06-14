class Item {
  final int id;
  final String name;
  final String category;
  final int stock;
  final String condition;
  final int warehouseId;
  final String? imageUrl;
  final String? warehouseName;
  final String? unitId;

  Item({
    required this.id,
    required this.name,
    required this.category,
    required this.stock,
    required this.condition,
    required this.warehouseId,
    this.imageUrl,
    this.warehouseName,
    this.unitId,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? '',
      category: json['category'] as String? ?? '',
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      condition: json['condition'] as String? ?? 'Aktif',
      warehouseId: (json['warehouseId'] as num?)?.toInt() ?? 0,
      imageUrl: json['imageUrl'] as String?,
      warehouseName: json['warehouseName'] as String?,
      unitId: json['unitId'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'stock': stock,
      'condition': condition,
      'warehouseId': warehouseId,
      'imageUrl': imageUrl,
      'warehouseName': warehouseName,
      'unitId': unitId,
    };
  }
}
