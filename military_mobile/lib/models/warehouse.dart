class Warehouse {
  final int id;
  final String name;
  final String unitId;
  final String? unitName;

  Warehouse({
    required this.id,
    required this.name,
    required this.unitId,
    this.unitName,
  });

  factory Warehouse.fromJson(Map<String, dynamic> json) {
    return Warehouse(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? '',
      unitId: json['unitId'] as String? ?? '',
      unitName: json['unitName'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'unitId': unitId,
      'unitName': unitName,
    };
  }
}
