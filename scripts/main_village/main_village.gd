## MainVillage - Membangun seluruh Main Village secara programmatic
extends Node2D

var hud: CanvasLayer
var debug_panel: Node


func _ready() -> void:
	# Inisialisasi PlayerManager
	if not PlayerManager.is_initialized:
		PlayerManager.initialize()
	
	# Buat tilemap ground
	_create_ground()
	
	# Buat semua bangunan
	_create_buildings()
	
	# Buat semua NPC
	_create_npcs()
	
	# Pasang kamera
	_setup_camera()
	
	# Pasang HUD
	_setup_hud()
	
	# Debug panel
	_setup_debug()
	
	print("[MainVillage] Loaded - %dx%d tiles" % [VillageData.MAP_WIDTH, VillageData.MAP_HEIGHT])


## Membuat ground tilemap placeholder
func _create_ground() -> void:
	var tile_w: int = VillageData.MAP_WIDTH
	var tile_h: int = VillageData.MAP_HEIGHT
	var ts: int = VillageData.TILE_SIZE
	
	# Background hijau (rumput)
	var bg := ColorRect.new()
	bg.size = Vector2(tile_w * ts, tile_h * ts)
	bg.color = Color(0.30, 0.55, 0.25)
	bg.z_index = -10
	add_child(bg)
	
	# Jalan setapak (batu abu-abu)
	var paths: Array[Vector2i] = []
	# Jalan horizontal tengah
	for x in range(tile_w):
		paths.append(Vector2i(x, 12))
		paths.append(Vector2i(x, 13))
	# Jalan vertikal tengah
	for y in range(tile_h):
		paths.append(Vector2i(12, y))
		paths.append(Vector2i(13, y))
	# Alun-alun
	for x in range(8, 18):
		for y in range(8, 17):
			paths.append(Vector2i(x, y))
	
	for p: Vector2i in paths:
		var tile := ColorRect.new()
		tile.size = Vector2(ts, ts)
		tile.position = Vector2(p.x * ts, p.y * ts)
		tile.color = Color(0.6, 0.58, 0.52)
		tile.z_index = -9
		add_child(tile)
	
	# Taman kecil (bunga)
	_add_decorations()
	
	# Area kosong untuk masa depan (outline)
	_draw_area_outlines()


func _add_decorations() -> void:
	var ts: int = VillageData.TILE_SIZE
	
	# Pohon di pinggir map
	var tree_positions: Array[Vector2] = [
		Vector2(1, 1), Vector2(2, 1), Vector2(1, 2),
		Vector2(25, 1), Vector2(26, 1), Vector2(26, 2),
		Vector2(1, 24), Vector2(2, 25), Vector2(1, 25),
		Vector2(25, 24), Vector2(26, 25), Vector2(25, 25),
		Vector2(1, 12), Vector2(1, 13), Vector2(26, 12), Vector2(26, 13),
	]
	for pos: Vector2 in tree_positions:
		_add_tree(pos.x * ts + ts/2, pos.y * ts + ts/2)
	
	# Bunga acak
	var flower_positions: Array[Vector2] = [
		Vector2(5, 9), Vector2(7, 15), Vector2(15, 9),
		Vector2(20, 15), Vector2(8, 20), Vector2(22, 9),
		Vector2(10, 3), Vector2(22, 22), Vector2(5, 22),
	]
	for pos: Vector2 in flower_positions:
		var flower := ColorRect.new()
		flower.size = Vector2(6, 6)
		flower.position = Vector2(pos.x * ts + 13, pos.y * ts + 13)
		flower.color = [Color.RED, Color.PINK, Color.YELLOW, Color(1, 0.5, 0)].pick_random()
		flower.z_index = -8
		add_child(flower)
	
	# Batu kecil
	var rock_positions: Array[Vector2] = [
		Vector2(20, 4), Vector2(4, 20), Vector2(24, 8),
	]
	for pos: Vector2 in rock_positions:
		var rock := ColorRect.new()
		rock.size = Vector2(12, 10)
		rock.position = Vector2(pos.x * ts + 10, pos.y * ts + 11)
		rock.color = Color(0.55, 0.55, 0.55)
		rock.z_index = -8
		add_child(rock)


func _add_tree(x: float, y: float) -> void:
	# Batang
	var trunk := ColorRect.new()
	trunk.size = Vector2(8, 14)
	trunk.position = Vector2(x - 4, y)
	trunk.color = Color(0.45, 0.3, 0.15)
	trunk.z_index = -7
	add_child(trunk)
	
	# Daun
	var leaves := ColorRect.new()
	leaves.size = Vector2(22, 22)
	leaves.position = Vector2(x - 11, y - 20)
	leaves.color = Color(0.2, 0.5, 0.15)
	leaves.z_index = -6
	add_child(leaves)


func _draw_area_outlines() -> void:
	var ts: int = VillageData.TILE_SIZE
	
	# Area kosong untuk update masa depan
	var empty_areas: Array[Dictionary] = [
		{"name": "Guild Hall", "pos": Vector2(3, 4), "size": Vector2(3, 2)},
		{"name": "Arena PvP", "pos": Vector2(22, 4), "size": Vector2(3, 2)},
		{"name": "Peternakan", "pos": Vector2(22, 20), "size": Vector2(3, 2)},
		{"name": "Pelabuhan", "pos": Vector2(3, 20), "size": Vector2(3, 2)},
	]
	
	for area: Dictionary in empty_areas:
		var apos: Vector2 = area["pos"]
		var asize: Vector2 = area["size"]
		var outline := ColorRect.new()
		outline.size = Vector2(asize.x * ts, asize.y * ts)
		outline.position = Vector2(apos.x * ts, apos.y * ts)
		outline.color = Color(0.3, 0.5, 0.25, 0.3)
		outline.z_index = -5
		add_child(outline)
		
		var label := Label.new()
		label.text = area["name"]
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.position = Vector2(apos.x * ts + 4, apos.y * ts + asize.y * ts / 2 - 8)
		label.add_theme_font_size_override("font_size", 11)
		label.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8, 0.6))
		label.z_index = -4
		add_child(label)


## Membuat semua bangunan
func _create_buildings() -> void:
	var ts: int = VillageData.TILE_SIZE
	
	for b: Dictionary in VillageData.BUILDINGS:
		var building := Node2D.new()
		building.set_script(load("res://scripts/buildings/village_building.gd"))
		building.position = Vector2(b["tile_x"] * ts + ts / 2, b["tile_y"] * ts + ts / 2)
		building.set("building_name", b["name"])
		building.z_index = 5
		add_child(building)


## Membuat semua NPC di depan bangunan
func _create_npcs() -> void:
	var ts: int = VillageData.TILE_SIZE
	var building_lookup: Dictionary = {}
	for b: Dictionary in VillageData.BUILDINGS:
		building_lookup[b["id"]] = b
	
	for n: Dictionary in VillageData.Npcs:
		var bdata: Dictionary = building_lookup.get(n["building_id"], {})
		if bdata.is_empty():
			continue
		
		# Posisi NPC: tepat di bawah bangunan (depan pintu)
		var npc_x: float = bdata["tile_x"] * ts + ts / 2.0
		var npc_y: float = (bdata["tile_y"] + 2) * ts + ts / 2.0
		
		var npc := Area2D.new()
		npc.set_script(load("res://scripts/npc/village_npc.gd"))
		npc.position = Vector2(npc_x, npc_y)
		npc.set("npc_name", n["name"])
		npc.set("building_id", n["building_id"])
		npc.collision_layer = 2
		npc.collision_mask = 0
		add_child(npc)


## Setup kamera
func _setup_camera() -> void:
	var cam := Camera2D.new()
	cam.set_script(load("res://scripts/camera/camera_controller.gd"))
	cam.name = "VillageCamera"
	add_child(cam)
	cam.make_current()


## Setup HUD
func _setup_hud() -> void:
	hud = CanvasLayer.new()
	hud.set_script(load("res://scripts/ui/village_hud.gd"))
	hud.name = "VillageHUD"
	add_child(hud)
	
	# Hubungkan signal untuk update HUD
	PlayerManager.hp_changed.connect(func(_c, _m): _refresh_hud())
	PlayerManager.gold_changed.connect(func(_g): _refresh_hud())
	PlayerManager.level_changed.connect(func(_l): _refresh_hud())
	PlayerManager.energy_changed.connect(func(_e, _m): _refresh_hud())


func _refresh_hud() -> void:
	if hud and hud.has_method("refresh"):
		hud.refresh()


## Setup debug panel
func _setup_debug() -> void:
	debug_panel = load("res://scripts/ui/debug_panel.gd").new()
	debug_panel.name = "DebugPanel"
	add_child(debug_panel)
