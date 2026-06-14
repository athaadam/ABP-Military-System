class RequestModel {
  final int id;
  final int userId;
  final int itemId;
  final int quantity;
  final String reason;
  final String status;
  final int? approvedBy;
  final String? itemName;
  final String? userName;
  final String? approvedByName;
  final DateTime createdAt;
  final DateTime updatedAt;

  RequestModel({
    required this.id,
    required this.userId,
    required this.itemId,
    required this.quantity,
    required this.reason,
    required this.status,
    this.approvedBy,
    this.itemName,
    this.userName,
    this.approvedByName,
    required this.createdAt,
    required this.updatedAt,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    return RequestModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      userId: (json['userId'] as num?)?.toInt() ?? 0,
      itemId: (json['itemId'] as num?)?.toInt() ?? 0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      reason: json['reason'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      approvedBy: json['approvedBy'] != null ? (json['approvedBy'] as num).toInt() : null,
      itemName: json['itemName'] as String?,
      userName: json['userName'] as String?,
      approvedByName: json['approvedByName'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'itemId': itemId,
      'quantity': quantity,
      'reason': reason,
      'status': status,
      'approvedBy': approvedBy,
      'itemName': itemName,
      'userName': userName,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  bool get isPending => status.toLowerCase() == 'pending';
  bool get isApproved => status.toLowerCase() == 'approved';
  bool get isRejected => status.toLowerCase() == 'rejected';
  bool get isCompleted => status.toLowerCase() == 'completed';
}
