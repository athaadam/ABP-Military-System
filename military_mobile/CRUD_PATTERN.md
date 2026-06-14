# CRUD Pattern Implementation Guide

Dokumentasi cara implement CRUD untuk resource lain di Flutter mobile app.

## Struktur File

Untuk setiap resource (Unit, Warehouse, Inventory, Request, etc), buat struktur seperti ini:

```
lib/
├── models/
│   └── {resource}.dart           # Model class
├── services/
│   └── {resource}_service.dart   # API calls
├── controllers/
│   └── {resource}s_controller.dart  # State management (GetX)
└── pages/dashboard/{resource}s/
    ├── {resource}s_page.dart     # Main page
    └── widgets/
        ├── {resource}_list_item.dart
        ├── create_{resource}_modal.dart
        ├── edit_{resource}_modal.dart
        └── delete_{resource}_dialog.dart
```

## Langkah-langkah Implementasi

### 1. Create Model (`lib/models/{resource}.dart`)

```dart
class YourResource {
  final String id;
  final String name;
  // ... other fields

  YourResource({
    required this.id,
    required this.name,
    // ...
  });

  factory YourResource.fromJson(Map<String, dynamic> json) {
    return YourResource(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      // ...
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      // ...
    };
  }
}
```

### 2. Create Service (`lib/services/{resource}_service.dart`)

```dart
import '../models/{resource}.dart';
import 'api_service.dart';

class YourResourceService {
  final ApiService _apiService = ApiService();

  Future<List<YourResource>> getAll() async {
    final response = await _apiService.get('/endpoint');
    final List<dynamic> data = response.data as List<dynamic>? ?? [];
    return data.map((item) => YourResource.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<YourResource> getById(String id) async {
    final response = await _apiService.get('/endpoint/$id');
    return YourResource.fromJson(response.data as Map<String, dynamic>);
  }

  Future<YourResource> create({required String name, /* ... */}) async {
    final response = await _apiService.post(
      '/endpoint',
      data: {
        'name': name,
        // ...
      },
    );
    return YourResource.fromJson(response.data as Map<String, dynamic>);
  }

  Future<YourResource> update(String id, {required String name, /* ... */}) async {
    final response = await _apiService.put(
      '/endpoint/$id',
      data: {
        'name': name,
        // ...
      },
    );
    return YourResource.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> delete(String id) async {
    await _apiService.delete('/endpoint/$id');
  }
}
```

### 3. Create Controller (`lib/controllers/{resource}s_controller.dart`)

```dart
import 'package:get/get.dart';
import '../models/{resource}.dart';
import '../services/{resource}_service.dart';

class YourResourcesController extends GetxController {
  final _service = YourResourceService();

  final items = <YourResource>[].obs;
  final isLoading = false.obs;
  final isCreating = false.obs;
  final isUpdating = false.obs;
  final isDeleting = false.obs;
  final errorMessage = Rx<String?>(null);
  final successMessage = Rx<String?>(null);

  @override
  void onInit() {
    super.onInit();
    fetch();
  }

  Future<void> fetch() async {
    try {
      isLoading.value = true;
      errorMessage.value = null;
      final itemList = await _service.getAll();
      items.value = itemList;
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to fetch');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> create({required String name, /* ... */}) async {
    try {
      isCreating.value = true;
      errorMessage.value = null;
      
      if (name.trim().isEmpty) {
        errorMessage.value = 'Name is required';
        return;
      }

      await _service.create(name: name.trim(), /* ... */);
      successMessage.value = 'Created successfully';
      await fetch();
      Get.snackbar('Success', 'Created successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to create');
    } finally {
      isCreating.value = false;
    }
  }

  Future<void> update(String id, {required String name, /* ... */}) async {
    try {
      isUpdating.value = true;
      errorMessage.value = null;
      
      if (name.trim().isEmpty) {
        errorMessage.value = 'Name is required';
        return;
      }

      await _service.update(id, name: name.trim(), /* ... */);
      successMessage.value = 'Updated successfully';
      await fetch();
      Get.snackbar('Success', 'Updated successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to update');
    } finally {
      isUpdating.value = false;
    }
  }

  Future<void> delete(String id) async {
    try {
      isDeleting.value = true;
      errorMessage.value = null;
      await _service.delete(id);
      await fetch();
      Get.snackbar('Success', 'Deleted successfully');
    } catch (e) {
      errorMessage.value = _getErrorMessage(e);
      Get.snackbar('Error', errorMessage.value ?? 'Failed to delete');
    } finally {
      isDeleting.value = false;
    }
  }

  String? _getErrorMessage(dynamic error) {
    final message = error.toString();
    if (message.contains('401')) return 'Unauthorized';
    if (message.contains('404')) return 'Not found';
    if (message.contains('409')) return 'Already exists';
    if (message.contains('Connection refused')) return 'Cannot connect to server';
    return message;
  }
}
```

### 4. Create Main Page (`lib/pages/dashboard/{resource}s/{resource}s_page.dart`)

Lihat `units_page.dart` sebagai reference. Structure:
- Use GetX controller dengan Obx untuk reactive updates
- FAB untuk create
- List dengan Dismiss untuk refresh
- Show dialogs untuk create/edit/delete

### 5. Create Widgets

- `{resource}_list_item.dart` - Item card/row untuk list
- `create_{resource}_modal.dart` - Dialog untuk create
- `edit_{resource}_modal.dart` - Dialog untuk edit
- `delete_{resource}_dialog.dart` - Confirmation dialog untuk delete

## API Response Format (Expected)

List endpoint:
```json
[
  {
    "id": "value",
    "name": "value",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

Create/Update endpoint:
```json
{
  "id": "value",
  "name": "value",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Tips

1. **Validation**: Lakukan di controller sebelum call API
2. **Error Handling**: Gunakan snackbar untuk user feedback
3. **Loading State**: Selalu show loading indicator saat fetch/create/update/delete
4. **Empty State**: Show meaningful message ketika list kosong
5. **Refresh**: Refresh list setelah create/update/delete berhasil
6. **Modal Management**: Close modal setelah berhasil, keep open jika ada error

## Contoh Implementation

Untuk Warehouse, Inventory, atau Request, ikuti pattern yang sama dengan Units tapi adjust:
- Field names sesuai API
- Validation logic sesuai requirement
- UI elements disesuaikan dengan data

Units adalah reference yang lengkap, tinggal duplicate dan customize!
