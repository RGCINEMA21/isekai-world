## NPCDatabase - Database seluruh NPC dalam game
## Setiap NPC memiliki ID, nama, profesi, fungsi, dan warna.
class_name NPCDatabase

## Data semua NPC
const NPCs: Dictionary = {
	"blacksmith": {
		"id": "blacksmith",
		"name": "Pandai Besi",
		"profession": "Blacksmith",
		"building_id": "blacksmith",
		"color": Color(0.7, 0.3, 0.2),
		"head_color": Color(0.85, 0.7, 0.55),
		"action": "blacksmith",
	},
	"warehouse": {
		"id": "warehouse",
		"name": "Penjaga Gudang",
		"profession": "Warehouse Keeper",
		"building_id": "warehouse",
		"color": Color(0.4, 0.5, 0.6),
		"head_color": Color(0.85, 0.7, 0.55),
		"action": "warehouse",
	},
	"kitchen": {
		"id": "kitchen",
		"name": "Koki",
		"profession": "Chef",
		"building_id": "kitchen",
		"color": Color(0.9, 0.8, 0.5),
		"head_color": Color(0.85, 0.7, 0.55),
		"action": "kitchen",
	},
	"laboratory": {
		"id": "laboratory",
		"name": "Alkemis",
		"profession": "Alchemist",
		"building_id": "lab",
		"color": Color(0.35, 0.3, 0.7),
		"head_color": Color(0.85, 0.7, 0.55),
		"action": "laboratory",
	},
	"marketplace": {
		"id": "marketplace",
		"name": "Pedagang",
		"profession": "Merchant",
		"building_id": "market",
		"color": Color(0.8, 0.6, 0.2),
		"head_color": Color(0.85, 0.7, 0.55),
		"action": "marketplace",
	},
	"portal_monster": {
		"id": "portal_monster",
		"name": "Ksatria Portal",
		"profession": "Portal Guardian",
		"building_id": "portal_monster_npc",
		"color": Color(0.3, 0.4, 0.8),
		"head_color": Color(0.85, 0.7, 0.55),
		"action": "portal_monster",
	},
	"portal_quest": {
		"id": "portal_quest",
		"name": "Penjaga Quest",
		"profession": "Quest Master",
		"building_id": "portal_quest_npc",
		"color": Color(0.7, 0.3, 0.7),
		"head_color": Color(0.85, 0.7, 0.55),
		"action": "portal_quest",
	},
	"guide": {
		"id": "guide",
		"name": "Pemandu Desa",
		"profession": "Guide",
		"building_id": "home",
		"color": Color(0.3, 0.7, 0.5),
		"head_color": Color(0.85, 0.7, 0.55),
		"action": "guide",
	},
}

## Ambil data NPC berdasarkan ID
static func get_npc(npc_id: String) -> Dictionary:
	return NPCs.get(npc_id, {})

## Daftar semua NPC ID
static func get_all_ids() -> Array[String]:
	var ids: Array[String] = []
	for key: String in NPCs.keys():
		ids.append(key)
	return ids

## Deskripsi aksi NPC
const ACTION_DESCRIPTIONS: Dictionary = {
	"blacksmith": "Membuat dan memperbaiki senjata serta armor.",
	"warehouse": "Menyimpan seluruh resource hasil permainan.",
	"kitchen": "Memasak makanan dan ramuan.",
	"laboratory": "Mengolah ramuan dan material khusus.",
	"marketplace": "Membeli dan menjual item.",
	"portal_monster": "Memasuki area pertarungan monster.",
	"portal_quest": "Menerima dan menyelesaikan quest.",
	"guide": "Memberikan panduan kepada pemain baru.",
}
