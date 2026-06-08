class RequestModel {
  final int id;
  final int userId;
  final int itemId;
  final String? itemName;
  final int quantity;
  final String reason;
  final String status;
  final DateTime createdAt;

  RequestModel({
    required this.id,
    required this.userId,
    required this.itemId,
    this.itemName,
    required this.quantity,
    required this.reason,
    required this.status,
    required this.createdAt,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    return RequestModel(
      id: json['id'] as int,
      userId: json['userId'] as int? ?? 0,
      itemId: json['itemId'] as int? ?? 0,
      itemName: json['itemName'] as String?,
      quantity: json['quantity'] as int? ?? 0,
      reason: json['reason'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
    );
  }
}
