class Warehouse {
  final String id;
  final String name;
  final String location;
  final int capacity;
  final int occupied;
  final DateTime createdAt;
  final DateTime updatedAt;

  Warehouse({
    required this.id,
    required this.name,
    required this.location,
    required this.capacity,
    required this.occupied,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Warehouse.fromJson(Map<String, dynamic> json) {
    return Warehouse(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      location: json['location'] as String? ?? '',
      capacity: json['capacity'] as int? ?? 0,
      occupied: json['occupied'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'location': location,
      'capacity': capacity,
      'occupied': occupied,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  double get occupancyPercentage => capacity > 0 ? (occupied / capacity) * 100 : 0;
}
