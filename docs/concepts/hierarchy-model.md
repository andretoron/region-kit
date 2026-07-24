# Hierarchy Model

Relasi hierarki menggunakan `parentId` sebagai satu-satunya sumber kebenaran.
Core membangun index child ketika dataset dimuat; dataset tidak perlu menyimpan
array child atau materialized path.

## Root dan level

Dataset valid memiliki tepat satu root dengan:

- `parentId: null`;
- `level: 0`;
- `type: "country"`.

Setiap region non-root menunjuk parent yang tersedia. Level child harus lebih
besar daripada level parent. Kontrak tidak mengharuskan selisih level tepat satu,
sehingga dataset dapat merepresentasikan variasi struktur administratif.

Validator menolak ID duplikat, parent yang hilang atau tidak dikenal,
self-parent, child level yang tidak valid, lebih dari satu root, dan cycle.

## Operasi traversal

- `parentOf(id)` mengembalikan parent langsung. Hanya target root yang
  menghasilkan `null`.
- `childrenOf(id)` mengembalikan child langsung sebagai `RegionPage`.
- `ancestorsOf(id)` mengembalikan parent langsung lebih dahulu, lalu bergerak
  menuju root.
- `descendantsOf(id)` mengumpulkan seluruh turunan. `maxDepth: 1` hanya
  menyertakan child langsung dan `maxDepth: 0` menghasilkan page kosong.

Target traversal yang tidak tersedia menghasilkan `RegionNotFoundError`, bukan
hasil kosong. Collection traversal tetap mengikuti sorting deterministik dan
offset pagination; `id` digunakan sebagai tie-breaker terakhir.

## Immutability

Built-in memory store membuat snapshot tervalidasi ketika instance dibuat.
Region yang dikembalikan merupakan salinan, sehingga perubahan pada hasil query
tidak mengubah index internal. Custom store harus memberi jaminan perilaku yang
setara melalui [kontrak adapter](../guides/creating-a-store-adapter.md).
