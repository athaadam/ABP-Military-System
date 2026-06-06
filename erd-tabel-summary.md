# Tabel ERD - Sistem Manajemen Gudang Militer

| Entitas | Atribut | Keterangan |
|---|---|---|
| Users | id, name, email, password, role, satuan_id | Menyimpan data seluruh pengguna sistem (superadmin, admin, user) |
| Satuan_Militer | id, name, logo, created_at, updated_at | Data satuan/unit militer (KODIM, MABESAD, dll) |
| Gudang | id, name, satuan_id, created_at, updated_at | Data gudang/warehouse per satuan |
| Barang | id, name, category, stock, condition, gudang_id, imageUrl, created_at, updated_at | Data inventaris barang (persenjataan, amunisi, kendaraan militer) |
| Permintaan | id, user_id, barang_id, quantity, reason, status, approved_by, created_at, updated_at | Data permintaan penggunaan barang |
| Pengembalian | id, permintaan_id, condition_after, created_at, updated_at | Data pengembalian barang setelah penggunaan |
| Perbaikan | id, barang_id, description, status, created_at, updated_at | Data perbaikan barang yang rusak |
| Stok_Kondisi | id, barang_id, condition, quantity, created_at, updated_at | Tracking stok barang per kondisi (Aktif, Digunakan, Rusak, Perbaikan, Cadangan, Habis) |
| Mutasi_Kondisi | id, barang_id, from_condition, to_condition, quantity, note, user_id, created_at | Log perpindahan stok barang antar kondisi |
| Audit_Log | id, user_id, action, description, old_value, new_value, created_at | Catatan seluruh aktivitas sistem untuk audit trail |
