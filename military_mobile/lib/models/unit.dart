class Unit {
  final String id;
  final String name;
  final String? logo;
  final DateTime createdAt;
  final DateTime updatedAt;

  Unit({
    required this.id,
    required this.name,
    this.logo,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Unit.fromJson(Map<String, dynamic> json) {
    return Unit(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      logo: json['logo'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'logo': logo,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
