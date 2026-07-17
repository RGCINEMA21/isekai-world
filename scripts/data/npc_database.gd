## NPCDatabase - Database seluruh NPC dalam game
class_name NPCDatabase

const NPCs: Dictionary = {
	"blacksmith": {"id":"blacksmith","name":"Pandai Besi","profession":"Blacksmith","building_id":"blacksmith","color":Color(0.7,0.3,0.2),"action":"blacksmith"},
	"warehouse": {"id":"warehouse","name":"Penjaga Gudang","profession":"Warehouse Keeper","building_id":"warehouse","color":Color(0.6,0.5,0.3),"action":"warehouse"},
	"kitchen": {"id":"kitchen","name":"Koki","profession":"Chef","building_id":"kitchen","color":Color(0.9,0.6,0.3),"action":"kitchen"},
	"laboratory": {"id":"laboratory","name":"Alkemis","profession":"Alchemist","building_id":"lab","color":Color(0.3,0.4,0.8),"action":"laboratory"},
	"marketplace": {"id":"marketplace","name":"Pedagang","profession":"Merchant","building_id":"market","color":Color(0.8,0.6,0.2),"action":"marketplace"},
	"portal_monster": {"id":"portal_monster","name":"Ksatria Portal","profession":"Portal Guardian","building_id":"portal_monster","color":Color(0.4,0.2,0.8),"action":"portal_monster"},
	"portal_quest": {"id":"portal_quest","name":"Penjaga Quest","profession":"Quest Master","building_id":"portal_quest","color":Color(0.6,0.2,0.7),"action":"portal_quest"},
	"guide": {"id":"guide","name":"Pemandu Desa","profession":"Guide","building_id":"home","color":Color(0.4,0.8,0.4),"action":"guide"},
	"forest_keeper": {"id":"forest_keeper","name":"Penebang Kayu","profession":"Lumberjack","building_id":"permanent_forest","color":Color(0.3,0.5,0.2),"action":"forest"},
	"stone_keeper": {"id":"stone_keeper","name":"Penambang","profession":"Miner","building_id":"permanent_stone","color":Color(0.5,0.5,0.5),"action":"stone"},
	"farmer": {"id":"farmer","name":"Petani","profession":"Farmer","building_id":"farming","color":Color(0.5,0.7,0.3),"action":"farming"},
	"fruit_keeper": {"id":"fruit_keeper","name":"Penjaga Kebun","profession":"Gardener","building_id":"fruit_trees","color":Color(0.8,0.5,0.3),"action":"fruit"},
}

static func get_npc(npc_id: String) -> Dictionary:
	return NPCs.get(npc_id, {})

static func get_all_ids() -> Array[String]:
	var ids: Array[String] = []
	for key: String in NPCs.keys():
		ids.append(key)
	return ids

const ACTION_DESCRIPTIONS: Dictionary = {
	"blacksmith": "Membuat dan memperbaiki senjata serta armor.",
	"warehouse": "Menyimpan seluruh resource hasil permainan.",
	"kitchen": "Memasak makanan dan ramuan.",
	"laboratory": "Mengolah ramuan dan material khusus.",
	"marketplace": "Membeli dan menjual item.",
	"portal_monster": "Memasuki area pertarungan monster.",
	"portal_quest": "Menerima dan menyelesaikan quest.",
	"guide": "Memberikan panduan kepada pemain baru.",
	"forest": "Menebang kayu untuk resource.",
	"stone": "Menambang batu dan mineral.",
	"farming": "Menanam dan memanen tanaman.",
	"fruit": "Memetik buah dari pohon.",
}
