## WarehouseSystem - Manajemen gudang pemain
## Menyimpan seluruh resource hasil permainan.
## Resource umum (kayu, batu, bibit, dll) langsung masuk gudang.
class_name WarehouseSystem


## Tambah item ke gudang dengan stack otomatis
static func add_item(item: Dictionary) -> bool:
	var items: Array = PlayerManager.get_warehouse()
	var item_id: String = item.get("id", "")
	var max_stack: int = item.get("max_stack", 999)
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
		PlayerManager.add_to_warehouse(new_item)
	
	return true


## Hapus item dari gudang berdasarkan index
static func remove_item(index: int) -> bool:
	return PlayerManager.remove_from_warehouse(index)


## Hapus item berdasarkan ID dan jumlah
static func remove_item_by_id(item_id: String, amount: int = 1) -> bool:
	var items: Array = PlayerManager.get_warehouse()
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


## Cari item di gudang berdasarkan ID, return index atau -1
static func find_item(item_id: String) -> int:
	var items: Array = PlayerManager.get_warehouse()
	for i in range(items.size()):
		if items[i].get("id", "") == item_id:
			return i
	return -1


## Ambil jumlah item di gudang berdasarkan ID
static func count_item(item_id: String) -> int:
	var items: Array = PlayerManager.get_warehouse()
	for item: Dictionary in items:
		if item.get("id", "") == item_id:
			return item.get("amount", 0)
	return 0


## Pindahkan item dari gudang ke inventory
static func transfer_to_inventory(warehouse_index: int, amount: int = 1) -> bool:
	var items: Array = PlayerManager.get_warehouse()
	if warehouse_index < 0 or warehouse_index >= items.size():
		return false
	
	var item: Dictionary = items[warehouse_index]
	if not InventorySystem.can_add_to_inventory(item):
		return false
	
	# Tambah ke inventory
	InventorySystem.add_item(item)
	
	# Hapus dari gudang
	var current_amount: int = item.get("amount", 1)
	if current_amount > amount:
		item["amount"] = current_amount - amount
		PlayerManager.save()
	else:
		PlayerManager.remove_from_warehouse(warehouse_index)
	
	return true


## Pindahkan item dari inventory ke gudang
static func transfer_to_warehouse(inventory_index: int, amount: int = 1) -> bool:
	var items: Array = PlayerManager.get_inventory()
	if inventory_index < 0 or inventory_index >= items.size():
		return false
	
	var item: Dictionary = items[inventory_index]
	
	# Tambah ke gudang
	add_item(item)
	
	# Hapus dari inventory
	var current_amount: int = item.get("amount", 1)
	if current_amount > amount:
		item["amount"] = current_amount - amount
		PlayerManager.save()
	else:
		PlayerManager.remove_from_inventory(inventory_index)
	
	return true


## Urutkan gudang berdasarkan tipe
static func sort_by_type() -> void:
	var items: Array = PlayerManager.get_warehouse()
	items.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		return a.get("type", "") < b.get("type", "")
	)
	PlayerManager.data["warehouse"] = items
	PlayerManager.save()


## Ambil semua item berdasarkan tipe
static func get_items_by_type(type: String) -> Array:
	var result: Array = []
	for item: Dictionary in PlayerManager.get_warehouse():
		if item.get("type", "") == type:
			result.append(item)
	return result
