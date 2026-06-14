class RequestModel {
  final String id;
  final String itemId;
  final String itemName;
  final int quantity;
  final String unit;
  final String status;
  final String requestedBy;
  final String approvedBy;
  final String reason;
  final DateTime createdAt;
  final DateTime updatedAt;

  RequestModel({
    required this.id,
    required this.itemId,
    required this.itemName,
    required this.quantity,
    required this.unit,
    required this.status,
    required this.requestedBy,
    required this.approvedBy,
    required this.reason,
    required this.createdAt,
    required this.updatedAt,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    return RequestModel(
      id: json['id'] as String? ?? '',
      itemId: json['item_id'] as String? ?? '',
      itemName: json['item_name'] as String? ?? '',
      quantity: json['quantity'] as int? ?? 0,
      unit: json['unit'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      requestedBy: json['requested_by'] as String? ?? '',
      approvedBy: json['approved_by'] as String? ?? '',
      reason: json['reason'] as String? ?? '',
      createdAt: DateTime.parse(json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'item_id': itemId,
      'item_name': itemName,
      'quantity': quantity,
      'unit': unit,
      'status': status,
      'requested_by': requestedBy,
      'approved_by': approvedBy,
      'reason': reason,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  bool get isPending => status.toLowerCase() == 'pending';
  bool get isApproved => status.toLowerCase() == 'approved';
  bool get isRejected => status.toLowerCase() == 'rejected';
}
