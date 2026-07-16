## InventorySystem - Manajemen inventaris pemain
## Menyimpan item yang dibawa pemain saat eksplasi.
## Resource umum tidak masuk inventory, langsung ke Warehouse.
class_name InventorySystem


## Daftar item yang hanya boleh masuk inventory
const INVENTORY_TYPES: Array[String] = [
	"weapon", "armor", "helmet", "gloves", "boots",
	"ring", "necklace", "food", "potion", "tool", "quest",
]


## Cek apakah item boleh masuk inventory
static func can_add_to_inventory(item: Dictionary) -> bool:
	var item_type: String = item.get("type", "")
	return item_type in INVENTORY_TYPES


## Tambah item ke inventory
## Menggunakan stack: jika item dengan ID sama ada, tambah jumlahnya
static func add_item(item: Dictionary) -> bool:
	if not can_add_to_inventory(item):
		return false
	
	var items: Array = PlayerManager.get_inventory()
	var item_id: String = item.get("id", "")
	var max_stack: int = item.get("max_stack", 99)
	var amount: int = item.get("amount", 1)
	
	# Cari item yang bisa di-stack
	for i in range(items.size()):
		var existing: Dictionary = items[i]
		if existing.get("id", "") == item_id:
			var current_amount: int = existing.get("amount", 1)
			if current_amount < max_stack:
				var can_add: int = mini(amount, max_stack - current_amount)
				existing["amount"] = current_amount + can_add
				amount -= can_add
				if amount <= 0:
					PlayerManager.save()
					return true
	
	# Sisa item masuk slot baru
	while amount > 0:
		var new_item: Dictionary = item.duplicate()
		var stack: int = mini(amount, max_stack)
		new_item["amount"] = stack
		amount -= stack
		PlayerManager.add_to_inventory(new_item)
	
	return true


## Hapus item dari inventory berdasarkan index
static func remove_item(index: int) -> bool:
	return PlayerManager.remove_from_inventory(index)


## Hapus item berdasarkan item_id dan jumlah
static func remove_item_by_id(item_id: String, amount: int = 1) -> bool:
	var items: Array = PlayerManager.get_inventory()
	for i in range(items.size()):
		if items[i].get("id", "") == item_id:
			var current_amount: int = items[i].get("amount", 1)
			if current_amount > amount:
				items[i]["amount"] = current_amount - amount
				PlayerManager.save()
				return true
			elif current_amount == amount:
				return PlayerManager.remove_from_inventory(i)
	return false


## Cari item berdasarkan ID, return index atau -1
static func find_item(item_id: String) -> int:
	var items: Array = PlayerManager.get_inventory()
	for i in range(items.size()):
		if items[i].get("id", "") == item_id:
			return i
	return -1


## Ambil jumlah item berdasarkan ID
static func count_item(item_id: String) -> int:
	var items: Array = PlayerManager.get_inventory()
	for item: Dictionary in items:
		if item.get("id", "") == item_id:
			return item.get("amount", 0)
	return 0


## Urutkan inventory berdasarkan tipe
static func sort_by_type() -> void:
	var items: Array = PlayerManager.get_inventory()
	items.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		return a.get("type", "") < b.get("type", "")
	)
	PlayerManager.data["inventory"] = items
	PlayerManager.save()


## Ambil semua item berdasarkan tipe
static func get_items_by_type(type: String) -> Array:
	var result: Array = []
	for item: Dictionary in PlayerManager.get_inventory():
		if item.get("type", "") == type:
			result.append(item)
	return result
