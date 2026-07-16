## VillageData - Data tata letak Main Village
## Posisi bangunan, NPC, dan ukuran map.
class_name VillageData

## ==================== BANGUNAN ====================
## Format: {id, name, tile_x, tile_y, desc}
## tile_x/y = posisi tile di grid map
const BUILDINGS: Array[Dictionary] = [
	# === AREA TENGAH (Inti Desa) ===
	{"id": "home", "name": "Rumah", "tile_x": 14, "tile_y": 13, "desc": "Rumah Player - Titik awal"},
	{"id": "warehouse", "name": "Gudang", "tile_x": 10, "tile_y": 13, "desc": "Dekat Rumah Player"},
	{"id": "kitchen", "name": "Dapur", "tile_x": 18, "tile_y": 13, "desc": "Dekat Rumah Player"},
	{"id": "blacksmith", "name": "Blacksmith", "tile_x": 10, "tile_y": 9, "desc": "Dekat Gudang"},
	{"id": "market", "name": "Marketplace", "tile_x": 18, "tile_y": 9, "desc": "Area terbuka dekat jalan utama"},
	
	# === AREA SELATAN (Resource) ===
	{"id": "farming", "name": "Pertanian", "tile_x": 20, "tile_y": 20, "desc": "Sisi kanan bawah"},
	{"id": "fruit_trees", "name": "Pohon Buah", "tile_x": 23, "tile_y": 20, "desc": "Sebelah Pertanian"},
	
	# === AREA BARAT (Hutan & Batu) ===
	{"id": "permanent_forest", "name": "Hutan Permanen", "tile_x": 4, "tile_y": 16, "desc": "Sisi kiri desa"},
	{"id": "permanent_stone", "name": "Area Batu", "tile_x": 4, "tile_y": 20, "desc": "Dekat Hutan Permanen"},
	
	# === AREA UTARA (Portal) ===
	{"id": "lab", "name": "Laboratorium", "tile_x": 14, "tile_y": 6, "desc": "Sedikit terpisah - bangunan khusus"},
	{"id": "portal_monster_npc", "name": "Portal Monster", "tile_x": 14, "tile_y": 2, "desc": "Ujung utara desa"},
	{"id": "portal_quest_npc", "name": "Portal Quest", "tile_x": 24, "tile_y": 13, "desc": "Sisi timur desa"},
]

## ==================== NPC ====================
## Format: {id, name, building_id}
## Posisi NPC dihitung otomatis: tile_y + 2 (depan pintu)
const NPCs: Array[Dictionary] = [
	{"id": "npc_home", "name": "Penjaga Rumah", "building_id": "home"},
	{"id": "npc_warehouse", "name": "Penjaga Gudang", "building_id": "warehouse"},
	{"id": "npc_kitchen", "name": "Koki", "building_id": "kitchen"},
	{"id": "npc_blacksmith", "name": "Pandai Besi", "building_id": "blacksmith"},
	{"id": "npc_market", "name": "Pedagang", "building_id": "market"},
	{"id": "npc_farming", "name": "Petani", "building_id": "farming"},
	{"id": "npc_fruit", "name": "Pekebun", "building_id": "fruit_trees"},
	{"id": "npc_forest", "name": "Penebang Kayu", "building_id": "permanent_forest"},
	{"id": "npc_stone", "name": "Penambang Batu", "building_id": "permanent_stone"},
	{"id": "npc_lab", "name": "Alkemis", "building_id": "lab"},
	{"id": "npc_portal_monster", "name": "Ksatria Portal", "building_id": "portal_monster_npc"},
	{"id": "npc_portal_quest", "name": "Penjaga Quest", "building_id": "portal_quest_npc"},
]

## ==================== MAP ====================
const MAP_WIDTH: int = 30
const MAP_HEIGHT: int = 24
const TILE_SIZE: int = 32

## ==================== DEKORASI ====================
## Posisi pagar (x1, y1, x2, y2) dalam tile - garis pagar
const FENCES: Array[Dictionary] = [
	# Pagar area pertanian
	{"x1": 19, "y1": 19, "x2": 25, "y2": 19},
	{"x1": 19, "y1": 22, "x2": 25, "y2": 22},
	{"x1": 19, "y1": 19, "x2": 19, "y2": 22},
	{"x1": 25, "y1": 19, "x2": 25, "y2": 22},
]

## Posisi lampu desa (x, y tile)
const LAMP_POSITIONS: Array[Vector2i] = [
	Vector2i(12, 13), Vector2i(16, 13),
	Vector2i(12, 9), Vector2i(16, 9),
	Vector2i(14, 5), Vector2i(14, 17),
	Vector2i(8, 13), Vector2i(20, 13),
]

## Posisi semak (x, y tile)
const BUSH_POSITIONS: Array[Vector2i] = [
	Vector2i(7, 7), Vector2i(21, 7), Vector2i(7, 17),
	Vector2i(25, 7), Vector2i(3, 10), Vector2i(27, 16),
	Vector2i(6, 4), Vector2i(22, 4),
]
