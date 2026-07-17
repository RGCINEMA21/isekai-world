## DropManager - Mengelola drop item dari monster
class_name DropManager

## Struktur drop: {id, name, drop_rate (0-100), min, max, type}
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

static func apply_drops(drops: Array[Dictionary]) -> void:
	for item: Dictionary in drops:
		if item["type"] == "currency":
			if item["id"] == "gold":
				PlayerManager.add_gold(item["amount"])
		else:
			## Auto storage ke warehouse
			var warehouse_item: Dictionary = {
				"id": item["id"],
				"name": item["name"],
				"amount": item["amount"],
				"type": item["type"],
				"max_stack": 999,
			}
			WarehouseSystem.add_item(warehouse_item)

static func get_drop_names(drops: Array[Dictionary]) -> Array[String]:
	var names: Array[String] = []
	for item: Dictionary in drops:
		var text: String = "%s ×%d" % [item["name"], item["amount"]]
		names.append(text)
	return names
