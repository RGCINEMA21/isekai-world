## ItemDatabase - Seluruh data item dalam game
class_name ItemDatabase

## Kategori item
enum Category { RESOURCE, EQUIPMENT, CONSUMABLE, SEED, QUEST, MATERIAL, MISC }

const CATEGORY_NAMES: Dictionary = {
	0: "Resource", 1: "Equipment", 2: "Consumable",
	3: "Seed", 4: "Quest", 5: "Material", 6: "Misc",
}

const CATEGORY_COLORS: Dictionary = {
	0: Color(0.5, 0.8, 0.5),    ## Resource - hijau
	1: Color(0.5, 0.6, 0.9),    ## Equipment - biru
	2: Color(0.9, 0.5, 0.5),    ## Consumable - merah
	3: Color(0.9, 0.8, 0.3),    ## Seed - kuning
	4: Color(0.8, 0.5, 0.9),    ## Quest - ungu
	5: Color(0.7, 0.6, 0.5),    ## Material - cokelat
	6: Color(0.6, 0.6, 0.6),    ## Misc - abu
}

const RARITY_COLORS: Dictionary = {
	"common":    Color(0.7, 0.7, 0.7),
	"uncommon":  Color(0.3, 0.8, 0.3),
	"rare":      Color(0.3, 0.5, 0.9),
	"epic":      Color(0.7, 0.3, 0.9),
	"legendary": Color(0.9, 0.7, 0.2),
	"mythic":    Color(0.9, 0.2, 0.2),
}

## ==================== SEMUA ITEM ====================
const ITEMS: Dictionary = {
	## --- RESOURCE ---
	"wood": {
		"id": "wood", "name": "Kayu", "category": 0,
		"description": "Kayu dasar untuk crafting.",
		"max_stack": 999, "rarity": "common",
		"sell_price": 2, "buy_price": 5,
		"icon_color": Color(0.6, 0.4, 0.2),
	},
	"stone": {
		"id": "stone", "name": "Batu", "category": 0,
		"description": "Batu untuk bangunan dan crafting.",
		"max_stack": 999, "rarity": "common",
		"sell_price": 2, "buy_price": 5,
		"icon_color": Color(0.6, 0.6, 0.6),
	},
	## --- MATERIAL ---
	"green_slime_gel": {
		"id": "green_slime_gel", "name": "Green Slime Gel", "category": 5,
		"description": "Gel lengket dari Green Slime.",
		"max_stack": 999, "rarity": "common",
		"sell_price": 5, "buy_price": 12,
		"icon_color": Color(0.3, 0.8, 0.3),
	},
	## --- SEED ---
	"carrot_seed": {
		"id": "carrot_seed", "name": "Bibit Wortel", "category": 3,
		"description": "Bibit untuk menanam wortel.",
		"max_stack": 999, "rarity": "common",
		"sell_price": 3, "buy_price": 8,
		"icon_color": Color(0.9, 0.5, 0.2),
	},
	"wheat_seed": {
		"id": "wheat_seed", "name": "Bibit Gandum", "category": 3,
		"description": "Bibit untuk menanam gandum.",
		"max_stack": 999, "rarity": "common",
		"sell_price": 3, "buy_price": 8,
		"icon_color": Color(0.85, 0.75, 0.3),
	},
	## --- EQUIPMENT ---
	"wooden_sword": {
		"id": "wooden_sword", "name": "Pedang Kayu", "category": 1,
		"description": "Pedang kayu sederhana. ATK +5.",
		"max_stack": 1, "rarity": "common",
		"sell_price": 10, "buy_price": 25,
		"icon_color": Color(0.55, 0.35, 0.2),
		"attack": 5,
	},
	"beginner_armor": {
		"id": "beginner_armor", "name": "Armor Pemula", "category": 1,
		"description": "Armor ringan untuk pemula. DEF +3.",
		"max_stack": 1, "rarity": "common",
		"sell_price": 10, "buy_price": 25,
		"icon_color": Color(0.4, 0.5, 0.6),
		"defense": 3,
	},
	## --- CONSUMABLE ---
	"small_potion": {
		"id": "small_potion", "name": "Small Potion", "category": 2,
		"description": "Memulihkan HP sebanyak 30.",
		"max_stack": 99, "rarity": "common",
		"sell_price": 5, "buy_price": 15,
		"icon_color": Color(0.9, 0.3, 0.3),
		"heal_amount": 30,
	},
}


## ==================== FUNGSI ====================

static func get_item(item_id: String) -> Dictionary:
	return ITEMS.get(item_id, {})

static func get_item_name(item_id: String) -> String:
	var item: Dictionary = get_item(item_id)
	return item.get("name", "???")

static func get_category_name(category: int) -> String:
	return CATEGORY_NAMES.get(category, "Unknown")

static func get_category_color(category: int) -> Color:
	return CATEGORY_COLORS.get(category, Color.WHITE)

static func get_rarity_color(rarity: String) -> Color:
	return RARITY_COLORS.get(rarity, Color.WHITE)

static func get_all_category_names() -> Array[String]:
	var names: Array[String] = ["All"]
	for key: int in CATEGORY_NAMES.keys():
		names.append(CATEGORY_NAMES[key])
	return names

static func filter_by_category(items: Array, category: int) -> Array:
	if category < 0:
		return items
	var result: Array = []
	for item: Dictionary in items:
		if item.get("category", -1) == category:
			result.append(item)
	return result

static func search_items(items: Array, query: String) -> Array:
	if query.is_empty():
		return items
	var result: Array = []
	var q: String = query.to_lower()
	for item: Dictionary in items:
		var name: String = str(item.get("name", "")).to_lower()
		var id: String = str(item.get("id", "")).to_lower()
		if q in name or q in id:
			result.append(item)
	return result

static func sort_items(items: Array, sort_by: String) -> Array:
	var sorted_items: Array = items.duplicate()
	match sort_by:
		"name":
			sorted_items.sort_custom(func(a, b): return str(a.get("name","")) < str(b.get("name","")))
		"category":
			sorted_items.sort_custom(func(a, b): return int(a.get("category",0)) < int(b.get("category",0)))
		"quantity":
			sorted_items.sort_custom(func(a, b): return int(a.get("amount",0)) > int(b.get("amount",0)))
		_:
			pass
	return sorted_items
