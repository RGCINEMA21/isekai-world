## VillageData - Data tata letak Main Village versi final
## Seluruh posisi bangunan, NPC, jalan, dan dekorasi didefinisikan di sini.
class_name VillageData

## ==================== KONSTAN MAP ====================
const MAP_WIDTH: int = 40
const MAP_HEIGHT: int = 30
const TILE_SIZE: int = 32

## ==================== BANGUNAN ====================
## Posisi bangunan berdasarkan area desa
const BUILDINGS: Array[Dictionary] = [
	# --- Tengah Desa ---
	{"id": "home",       "name": "Rumah Player",  "tile_x": 20, "tile_y": 13, "area": "center"},
	{"id": "warehouse",  "name": "Gudang",        "tile_x": 24, "tile_y": 13, "area": "center"},
	{"id": "well",       "name": "Sumur",         "tile_x": 20, "tile_y": 17, "area": "center"},

	# --- Utara ---
	{"id": "blacksmith",      "name": "Blacksmith",      "tile_x": 14, "tile_y": 5,  "area": "north"},
	{"id": "kitchen",         "name": "Dapur",           "tile_x": 26, "tile_y": 5,  "area": "north"},
	{"id": "portal_monster",  "name": "Portal Monster",  "tile_x": 10, "tile_y": 2,  "area": "north"},
	{"id": "portal_quest",    "name": "Portal Quest",    "tile_x": 30, "tile_y": 2,  "area": "north"},

	# --- Barat ---
	{"id": "permanent_forest", "name": "Hutan Permanen",  "tile_x": 4,  "tile_y": 13, "area": "west"},
	{"id": "permanent_stone",  "name": "Area Batu",       "tile_x": 4,  "tile_y": 19, "area": "west"},

	# --- Timur ---
	{"id": "market", "name": "Marketplace",   "tile_x": 35, "tile_y": 13, "area": "east"},
	{"id": "lab",    "name": "Laboratorium",  "tile_x": 35, "tile_y": 19, "area": "east"},

	# --- Selatan ---
	{"id": "farming",     "name": "Pertanian",    "tile_x": 14, "tile_y": 25, "area": "south"},
	{"id": "fruit_trees", "name": "Pohon Buah",   "tile_x": 26, "tile_y": 25, "area": "south"},
]

## ==================== NPC ====================
## npc_id harus cocok dengan NPCDatabase
const NPCs: Array[Dictionary] = [
	# Tengah Desa
	{"npc_id": "guide",          "building_id": "home",          "npc_name": "Pemandu Desa",       "color": Color(0.4, 0.8, 0.4)},
	{"npc_id": "warehouse",      "building_id": "warehouse",     "npc_name": "Penjaga Gudang",     "color": Color(0.6, 0.5, 0.3)},

	# Utara
	{"npc_id": "blacksmith",     "building_id": "blacksmith",    "npc_name": "Pandai Besi",        "color": Color(0.7, 0.3, 0.2)},
	{"npc_id": "kitchen",        "building_id": "kitchen",       "npc_name": "Koki",               "color": Color(0.9, 0.6, 0.3)},
	{"npc_id": "portal_monster", "building_id": "portal_monster", "npc_name": "Ksatria Portal",     "color": Color(0.4, 0.2, 0.8)},
	{"npc_id": "portal_quest",   "building_id": "portal_quest",  "npc_name": "Penjaga Portal Quest","color": Color(0.6, 0.2, 0.7)},

	# Barat
	{"npc_id": "forest_keeper",  "building_id": "permanent_forest", "npc_name": "Penebang Kayu",   "color": Color(0.3, 0.5, 0.2)},
	{"npc_id": "stone_keeper",   "building_id": "permanent_stone",  "npc_name": "Penambang",       "color": Color(0.5, 0.5, 0.5)},

	# Timur
	{"npc_id": "marketplace",    "building_id": "market",        "npc_name": "Pedagang",          "color": Color(0.8, 0.6, 0.2)},
	{"npc_id": "laboratory",     "building_id": "lab",           "npc_name": "Alkemis",           "color": Color(0.3, 0.4, 0.8)},

	# Selatan
	{"npc_id": "farmer",         "building_id": "farming",       "npc_name": "Petani",            "color": Color(0.5, 0.7, 0.3)},
	{"npc_id": "fruit_keeper",   "building_id": "fruit_trees",   "npc_name": "Penjaga Kebun",     "color": Color(0.8, 0.5, 0.3)},
]

## ==================== JALAN ====================
## Format: {from: Vector2i, to: Vector2i}
## Jalan dibuat sebagai garis lurus antara dua titik
const PATHS: Array[Dictionary] = [
	# Jalan utama horizontal (tengah desa, y=15)
	{"from": Vector2i(2, 15), "to": Vector2i(38, 15)},

	# Jalan utama vertikal (tengah desa, x=20)
	{"from": Vector2i(20, 2), "to": Vector2i(20, 28)},

	# Jalan ke Blacksmith (utara-kiri)
	{"from": Vector2i(14, 15), "to": Vector2i(14, 5)},

	# Jalan ke Dapur (utara-kanan)
	{"from": Vector2i(26, 15), "to": Vector2i(26, 5)},

	# Jalan ke Portal Monster (ujung utara-kiri)
	{"from": Vector2i(10, 5), "to": Vector2i(10, 2)},

	# Jalan ke Portal Quest (ujung utara-kanan)
	{"from": Vector2i(30, 5), "to": Vector2i(30, 2)},

	# Jalan ke Hutan Permanen (barat)
	{"from": Vector2i(20, 15), "to": Vector2i(4, 15)},

	# Jalan ke Area Batu (barat-bawah)
	{"from": Vector2i(4, 15), "to": Vector2i(4, 19)},

	# Jalan ke Marketplace (timur)
	{"from": Vector2i(20, 15), "to": Vector2i(35, 15)},

	# Jalan ke Laboratorium (timur-bawah)
	{"from": Vector2i(35, 15), "to": Vector2i(35, 19)},

	# Jalan ke Pertanian (selatan-kiri)
	{"from": Vector2i(14, 15), "to": Vector2i(14, 25)},

	# Jalan ke Pohon Buah (selatan-kanan)
	{"from": Vector2i(26, 15), "to": Vector2i(26, 25)},

	# Jalan ke Sumur (tengah)
	{"from": Vector2i(20, 15), "to": Vector2i(20, 17)},
]

## ==================== DEKORASI ====================

## Pohon besar (di tepi map dan area hutan)
const TREE_POSITIONS: Array[Vector2i] = [
	# Tepi utara
	Vector2i(1, 1), Vector2i(2, 1), Vector2i(6, 1), Vector2i(8, 1),
	Vector2i(33, 1), Vector2i(36, 1), Vector2i(38, 1),
	# Tepi selatan
	Vector2i(1, 28), Vector2i(2, 28), Vector2i(6, 28), Vector2i(8, 28),
	Vector2i(33, 28), Vector2i(36, 28), Vector2i(38, 28),
	# Tepi barat
	Vector2i(1, 8), Vector2i(1, 12), Vector2i(1, 22),
	# Tepi timur
	Vector2i(38, 8), Vector2i(38, 12), Vector2i(38, 22),
	# Area hutan (barat)
	Vector2i(2, 11), Vector2i(3, 11), Vector2i(5, 11), Vector2i(6, 11),
	Vector2i(2, 12), Vector2i(3, 12), Vector2i(6, 12),
	Vector2i(2, 14), Vector2i(3, 14), Vector2i(5, 14), Vector2i(6, 14),
	Vector2i(2, 15), Vector2i(6, 15),
	# Pohon hias dekat bangunan
	Vector2i(17, 11), Vector2i(23, 11),
	Vector2i(17, 19), Vector2i(23, 19),
]

## Semak kecil
const BUSH_POSITIONS: Array[Vector2i] = [
	Vector2i(8, 10), Vector2i(32, 10),
	Vector2i(8, 20), Vector2i(32, 20),
	Vector2i(12, 8), Vector2i(28, 8),
	Vector2i(12, 22), Vector2i(22, 22),
	Vector2i(16, 11), Vector2i(24, 11),
	Vector2i(16, 19), Vector2i(24, 19),
	Vector2i(10, 17), Vector2i(30, 17),
]

## Bunga
const FLOWER_POSITIONS: Array[Vector2i] = [
	Vector2i(16, 14), Vector2i(24, 14),
	Vector2i(18, 16), Vector2i(22, 16),
	Vector2i(15, 18), Vector2i(25, 18),
	Vector2i(11, 14), Vector2i(29, 14),
	Vector2i(13, 16), Vector2i(27, 16),
	Vector2i(18, 20), Vector2i(22, 20),
]

## Lampu desa
const LAMP_POSITIONS: Array[Vector2i] = [
	Vector2i(10, 15), Vector2i(30, 15),
	Vector2i(14, 15), Vector2i(26, 15),
	Vector2i(20, 10), Vector2i(20, 20),
	Vector2i(20, 5), Vector2i(20, 25),
]

## Batu kecil
const ROCK_POSITIONS: Array[Vector2i] = [
	Vector2i(7, 9), Vector2i(33, 9),
	Vector2i(7, 21), Vector2i(33, 21),
	Vector2i(1, 16), Vector2i(38, 16),
	Vector2i(15, 27), Vector2i(25, 27),
]

## Bangku taman
const BENCH_POSITIONS: Array[Vector2i] = [
	Vector2i(18, 16), Vector2i(22, 16),
	Vector2i(16, 17), Vector2i(24, 17),
]

## Pagar kayu (area pertanian)
const FENCE_POSITIONS: Array[Dictionary] = [
	{"x1": 12, "y1": 24, "x2": 17, "y2": 24},
	{"x1": 12, "y1": 27, "x2": 17, "y2": 27},
	{"x1": 12, "y1": 24, "x2": 12, "y2": 27},
	{"x1": 17, "y1": 24, "x2": 17, "y2": 27},
	{"x1": 24, "y1": 24, "x2": 29, "y2": 24},
	{"x1": 24, "y1": 27, "x2": 29, "y2": 27},
	{"x1": 24, "y1": 24, "x2": 24, "y2": 27},
	{"x1": 29, "y1": 24, "x2": 29, "y2": 27},
]

## Tong
const BARREL_POSITIONS: Array[Vector2i] = [
	Vector2i(11, 13), Vector2i(12, 13),
	Vector2i(25, 13), Vector2i(26, 13),
	Vector2i(13, 5), Vector2i(15, 5),
	Vector2i(25, 5), Vector2i(27, 5),
]

## Peti
const CHEST_POSITIONS: Array[Vector2i] = [
	Vector2i(23, 13), Vector2i(27, 13),
]

## Rambu arah
const SIGN_POSITIONS: Array[Dictionary] = [
	{"pos": Vector2i(8, 15),  "text": "← Hutan & Batu"},
	{"pos": Vector2i(32, 15), "text": "Market & Lab →"},
	{"pos": Vector2i(20, 8),  "text": "↑ Blacksmith & Dapur"},
	{"pos": Vector2i(20, 22), "text": "↓ Pertanian & Kebun"},
]

## Area label (ruang kosong untuk masa depan)
const FUTURE_AREAS: Array[Dictionary] = [
	{"name": "Guild Hall",    "pos": Vector2i(2, 3),  "color": Color(0.5, 0.6, 0.9, 0.3)},
	{"name": "Arena PvP",     "pos": Vector2i(35, 3), "color": Color(0.9, 0.4, 0.4, 0.3)},
	{"name": "Peternakan",    "pos": Vector2i(35, 25),"color": Color(0.9, 0.7, 0.3, 0.3)},
	{"name": "Pelabuhan",     "pos": Vector2i(2, 25), "color": Color(0.4, 0.6, 0.9, 0.3)},
]

## Alun-alun (area terbuka tengah desa)
const PLAZA: Dictionary = {"x": 18, "y": 16, "w": 5, "h": 3}
