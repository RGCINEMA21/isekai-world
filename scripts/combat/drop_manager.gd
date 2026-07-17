## DropManager - Mengelola drop item dari monster ke Inventory
class_name DropManager

const SLIME_DROPS: Array[Dictionary] = [
	{"id": "gold",           "name": "Gold",           "drop_rate": 100, "min": 10, "max": 20, "type": "currency"},
	{"id": "green_slime_gel","name": "Green Slime Gel", "drop_rate": 60,  "min": 1,  "max": 3,  "type": "material"},
	{"id": "carrot_seed",    "name": "Bibit Wortel",    "drop_rate": 30,  "min": 1,  "max": 2,  "type": "seed"},
	{"id": "wheat_seed",     "name": "Bibit Gandum",    "drop_rate": 20,  "min": 1,  "max": 2,  "type": "seed"},
	{"id": "wood",           "name": "Kayu",            "drop_rate": 25,  "min": 1,  "max": 3,  "type": "resource"},
	{"id": "stone",          "name": "Batu",            "drop_rate": 25,  "min": 1,  "max": 3,  "type": "resource"},
]

static func roll_drops(drops: Array[Dictionary]) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for drop: Dictionary in drops:
		var roll: float = randf() * 100.0
		if roll <= drop["drop_rate"]:
			var amount: int = randi_range(drop["min"], drop["max"])
			var item: Dictionary = {
				"id": drop["id"],
				"name": drop["name"],
				"amount": amount,
				"type": drop["type"],
			}
			result.append(item)
	return result


static func apply_drops(drops: Array[Dictionary]) -> Dictionary:
	## Return: {items_added: Array[Dictionary], gold: int, full: bool}
	var gold_amount: int = 0
	var items_added: Array[Dictionary] = []
	var any_full: bool = false

	for item: Dictionary in drops:
		if item["type"] == "currency" and item["id"] == "gold":
			gold_amount = item["amount"]
			PlayerManager.add_gold(item["amount"])
		else:
			## Ambil data dari database
			var db_item: Dictionary = ItemDatabase.get_item(item["id"])
			var inv_item: Dictionary = {
				"id": item["id"],
				"name": item["name"],
				"amount": item["amount"],
				"type": item["type"],
				"category": db_item.get("category", 0),
				"max_stack": db_item.get("max_stack", 99),
				"rarity": db_item.get("rarity", "common"),
				"description": db_item.get("description", ""),
			}
			var added: bool = _add_to_inventory(inv_item)
			if added:
				items_added.append(item)
			else:
				any_full = true

	return {"items_added": items_added, "gold": gold_amount, "full": any_full}


static func _add_to_inventory(item: Dictionary) -> bool:
	## Cek kapasitas inventory (30 slot)
	var items: Array = PlayerManager.get_inventory() if PlayerManager.is_initialized else []
	var item_id: String = item.get("id", "")
	var amount: int = item.get("amount", 1)
	var max_stack: int = item.get("max_stack", 99)

	## Coba stack dulu
	for i in range(items.size()):
		if items[i].get("id", "") == item_id:
			var cur: int = items[i].get("amount", 1)
			if cur < max_stack:
				var can_add: int = mini(amount, max_stack - cur)
				items[i]["amount"] = cur + can_add
				amount -= can_add
				if amount <= 0:
					PlayerManager.data["inventory"] = items
					PlayerManager.save()
					return true

	## Sisa masuk slot baru (cek kapasitas)
	while amount > 0:
		if items.size() >= 30:
			return false
		var stack: int = mini(amount, max_stack)
		var new_item: Dictionary = item.duplicate()
		new_item["amount"] = stack
		items.append(new_item)
		amount -= stack

	PlayerManager.data["inventory"] = items
	PlayerManager.save()
	return true


static func get_drop_names(drops: Array[Dictionary]) -> Array[String]:
	var names: Array[String] = []
	for item: Dictionary in drops:
		var text: String = "%s ×%d" % [item["name"], item["amount"]]
		names.append(text)
	return names
