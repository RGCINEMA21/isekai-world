## MainVillage - Tata letak desa RPG yang hidup dan rapi
extends Node2D

var hud: CanvasLayer
var debug_panel: Node
var ts: int  # tile size shortcut


func _ready() -> void:
	ts = VillageData.TILE_SIZE
	if not PlayerManager.is_initialized:
		PlayerManager.initialize()
	
	_create_ground()
	_create_paths()
	_create_decorations()
	_create_buildings()
	_create_npcs()
	_create_portals()
	_setup_camera()
	_setup_hud()
	_setup_debug()
	
	print("[MainVillage] Loaded %dx%d tiles" % [VillageData.MAP_WIDTH, VillageData.MAP_HEIGHT])


## ==================== GROUND ====================

func _create_ground() -> void:
	var map_w: float = VillageData.MAP_WIDTH * ts
	var map_h: float = VillageData.MAP_HEIGHT * ts
	
	# Base grass
	var bg := ColorRect.new()
	bg.size = Vector2(map_w, map_h)
	bg.color = Color(0.32, 0.58, 0.27)
	bg.z_index = -10
	add_child(bg)
	
	# Grass variation (patchy lighter/darker)
	var variations: Array[Vector2] = [
		Vector2(3, 3), Vector2(8, 5), Vector2(22, 4),
		Vector2(5, 15), Vector2(25, 10), Vector2(15, 20),
		Vector2(7, 22), Vector2(20, 6), Vector2(2, 8),
	]
	for v: Vector2 in variations:
		var patch := ColorRect.new()
		patch.size = Vector2(3 * ts, 2 * ts)
		patch.position = Vector2(v.x * ts, v.y * ts)
		patch.color = Color(0.35, 0.60, 0.29)
		patch.z_index = -9
		add_child(patch)


## ==================== JALAN ====================

func _create_paths() -> void:
	var path_color := Color(0.62, 0.58, 0.50)
	var path_dark := Color(0.55, 0.51, 0.44)
	
	# Jalan utama horizontal (tengah desa, y=13)
	_fill_path(2, 13, 27, 13, path_color)
	_fill_path(2, 14, 27, 14, path_dark)
	
	# Jalan utama vertikal (tengah desa, x=14)
	_fill_path(14, 2, 14, 22, path_color)
	_fill_path(15, 2, 15, 22, path_dark)
	
	# Jalan ke Gudang (kiri)
	_fill_path(10, 14, 10, 9, path_color)
	
	# Jalan ke Dapur (kanan)
	_fill_path(18, 14, 18, 9, path_color)
	
	# Jalan ke Laboratorium (utara)
	_fill_path(14, 6, 14, 9, path_color)
	
	# Jalan ke Portal Monster (ujung utara)
	_fill_path(14, 2, 14, 5, path_color)
	
	# Jalan ke Portal Quest (timur)
	_fill_path(19, 13, 24, 13, path_color)
	
	# Jalan ke Pertanian (selatan-kanan)
	_fill_path(19, 15, 22, 15, path_color)
	_fill_path(22, 15, 22, 20, path_color)
	
	# Jalan ke Hutan & Batu (barat)
	_fill_path(4, 14, 8, 14, path_color)
	_fill_path(4, 14, 4, 20, path_color)
	
	# Alun-alun (area terbuka tengah)
	for x in range(11, 18):
		for y in range(10, 12):
			var plaza := ColorRect.new()
			plaza.size = Vector2(ts, ts)
			plaza.position = Vector2(x * ts, y * ts)
			plaza.color = Color(0.68, 0.65, 0.58)
			plaza.z_index = -8
			add_child(plaza)


func _fill_path(x1: int, y1: int, x2: int, y2: int, color: Color) -> void:
	if x1 == x2:
		# Vertikal
		var y_min: int = mini(y1, y2)
		var y_max: int = maxi(y1, y2)
		for y in range(y_min, y_max + 1):
			_add_path_tile(x1, y, color)
	elif y1 == y2:
		# Horizontal
		var x_min: int = mini(x1, x2)
		var x_max: int = maxi(x1, x2)
		for x in range(x_min, x_max + 1):
			_add_path_tile(x, y1, color)


func _add_path_tile(x: int, y: int, color: Color) -> void:
	var tile := ColorRect.new()
	tile.size = Vector2(ts, ts)
	tile.position = Vector2(x * ts, y * ts)
	tile.color = color
	tile.z_index = -8
	add_child(tile)


## ==================== DEKORASI ====================

func _create_decorations() -> void:
	_add_trees()
	_add_fences()
	_add_lamps()
	_add_bushes()
	_add_flowers()
	_add_rocks()
	_add_area_labels()


func _add_trees() -> void:
	# Pohon di tepi map
	var positions: Array[Vector2i] = [
		Vector2i(1, 1), Vector2i(2, 1), Vector2i(1, 2),
		Vector2i(27, 1), Vector2i(28, 1), Vector2i(28, 2),
		Vector2i(1, 22), Vector2i(2, 22), Vector2i(1, 21),
		Vector2i(27, 22), Vector2i(28, 22), Vector2i(28, 21),
		Vector2i(1, 10), Vector2i(1, 11), Vector2i(1, 12),
		Vector2i(28, 10), Vector2i(28, 11), Vector2i(28, 12),
		Vector2i(6, 1), Vector2i(22, 1), Vector2i(10, 1),
		Vector2i(6, 22), Vector2i(22, 22),
		# Pohon hias di dekat bangunan
		Vector2i(8, 8), Vector2i(20, 8),
		Vector2i(8, 16), Vector2i(20, 16),
	]
	for p: Vector2i in positions:
		_draw_tree(p.x * ts + ts / 2, p.y * ts + ts / 2)


func _draw_tree(x: float, y: float) -> void:
	# Batang
	var trunk := ColorRect.new()
	trunk.size = Vector2(8, 16)
	trunk.position = Vector2(x - 4, y - 2)
	trunk.color = Color(0.45, 0.3, 0.15)
	trunk.z_index = -6
	add_child(trunk)
	
	# Daun
	var leaves := ColorRect.new()
	leaves.size = Vector2(24, 24)
	leaves.position = Vector2(x - 12, y - 22)
	leaves.color = Color(0.22, 0.52, 0.18)
	leaves.z_index = -5
	add_child(leaves)
	
	# Highlight daun
	var highlight := ColorRect.new()
	highlight.size = Vector2(14, 10)
	highlight.position = Vector2(x - 7, y - 20)
	highlight.color = Color(0.30, 0.60, 0.22)
	highlight.z_index = -5
	add_child(highlight)


func _add_fences() -> void:
	var fence_color := Color(0.6, 0.45, 0.25)
	for f: Dictionary in VillageData.FENCES:
		var x1: int = f["x1"]
		var y1: int = f["y1"]
		var x2: int = f["x2"]
		var y2: int = f["y2"]
		if x1 == x2:
			for y in range(mini(y1, y2), maxi(y1, y2) + 1):
				_draw_fence_post(x1, y, fence_color)
		elif y1 == y2:
			for x in range(mini(x1, x2), maxi(x1, x2) + 1):
				_draw_fence_post(x, y1, fence_color)


func _draw_fence_post(x: int, y: int, color: Color) -> void:
	# Tiang
	var post := ColorRect.new()
	post.size = Vector2(4, 14)
	post.position = Vector2(x * ts + ts / 2 - 2, y * ts + 8)
	post.color = color
	post.z_index = -4
	add_child(post)
	
	# Palang
	var rail := ColorRect.new()
	rail.size = Vector2(ts, 3)
	rail.position = Vector2(x * ts + 2, y * ts + 12)
	rail.color = color.lightened(0.1)
	rail.z_index = -4
	add_child(rail)


func _add_lamps() -> void:
	for p: Vector2i in VillageData.LAMP_POSITIONS:
		# Tiang lampu
		var pole := ColorRect.new()
		pole.size = Vector2(4, 20)
		pole.position = Vector2(p.x * ts + ts / 2 - 2, p.y * ts + 4)
		pole.color = Color(0.35, 0.35, 0.35)
		pole.z_index = -3
		add_child(pole)
		
		# Lampu (kotak kuning)
		var light := ColorRect.new()
		light.size = Vector2(10, 8)
		light.position = Vector2(p.x * ts + ts / 2 - 5, p.y * ts)
		light.color = Color(1.0, 0.9, 0.5)
		light.z_index = -3
		add_child(light)


func _add_bushes() -> void:
	for p: Vector2i in VillageData.BUSH_POSITIONS:
		var bush := ColorRect.new()
		bush.size = Vector2(16, 12)
		bush.position = Vector2(p.x * ts + 8, p.y * ts + 10)
		bush.color = Color(0.20, 0.48, 0.18)
		bush.z_index = -4
		add_child(bush)
		# Highlight
		var bh := ColorRect.new()
		bh.size = Vector2(10, 6)
		bh.position = Vector2(p.x * ts + 11, p.y * ts + 10)
		bh.color = Color(0.28, 0.55, 0.22)
		bh.z_index = -4
		add_child(bh)


func _add_flowers() -> void:
	var flower_data: Array[Dictionary] = [
		{"pos": Vector2i(6, 10), "color": Color(1, 0.3, 0.3)},
		{"pos": Vector2i(22, 10), "color": Color(1, 0.8, 0.2)},
		{"pos": Vector2i(7, 16), "color": Color(0.9, 0.3, 0.6)},
		{"pos": Vector2i(21, 16), "color": Color(1, 0.5, 0.2)},
		{"pos": Vector2i(11, 8), "color": Color(0.8, 0.2, 0.8)},
		{"pos": Vector2i(17, 8), "color": Color(1, 0.3, 0.3)},
		{"pos": Vector2i(11, 17), "color": Color(1, 0.9, 0.3)},
		{"pos": Vector2i(17, 17), "color": Color(0.9, 0.3, 0.6)},
		{"pos": Vector2i(5, 14), "color": Color(1, 0.5, 0.2)},
		{"pos": Vector2i(23, 14), "color": Color(1, 0.3, 0.3)},
	]
	for f: Dictionary in flower_data:
		var flower := ColorRect.new()
		flower.size = Vector2(6, 6)
		flower.position = Vector2(f["pos"].x * ts + 13, f["pos"].y * ts + 13)
		flower.color = f["color"]
		flower.z_index = -7
		add_child(flower)


func _add_rocks() -> void:
	var rock_positions: Array[Vector2i] = [
		Vector2i(6, 5), Vector2i(22, 18), Vector2i(2, 18),
	]
	for p: Vector2i in rock_positions:
		var rock := ColorRect.new()
		rock.size = Vector2(14, 10)
		rock.position = Vector2(p.x * ts + 9, p.y * ts + 11)
		rock.color = Color(0.55, 0.53, 0.50)
		rock.z_index = -4
		add_child(rock)
		# Highlight
		var rh := ColorRect.new()
		rh.size = Vector2(8, 4)
		rh.position = Vector2(p.x * ts + 12, p.y * ts + 11)
		rh.color = Color(0.65, 0.63, 0.60)
		rh.z_index = -4
		add_child(rh)


func _add_area_labels() -> void:
	var labels_data: Array[Dictionary] = [
		{"name": "Guild Hall", "pos": Vector2i(2, 4), "color": Color(0.6, 0.7, 0.9, 0.5)},
		{"name": "Arena PvP", "pos": Vector2i(25, 4), "color": Color(0.9, 0.5, 0.5, 0.5)},
		{"name": "Peternakan", "pos": Vector2i(25, 20), "color": Color(0.9, 0.8, 0.5, 0.5)},
		{"name": "Pelabuhan", "pos": Vector2i(2, 20), "color": Color(0.5, 0.7, 0.9, 0.5)},
	]
	for ld: Dictionary in labels_data:
		var outline := ColorRect.new()
		outline.size = Vector2(4 * ts, 2 * ts)
		outline.position = Vector2(ld["pos"].x * ts, ld["pos"].y * ts)
		outline.color = ld["color"]
		outline.z_index = -5
		add_child(outline)
		
		var label := Label.new()
		label.text = ld["name"]
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		label.position = Vector2(ld["pos"].x * ts, ld["pos"].y * ts + ts - 8)
		label.size = Vector2(4 * ts, 20)
		label.add_theme_font_size_override("font_size", 12)
		label.add_theme_color_override("font_color", Color(0.85, 0.85, 0.85, 0.7))
		label.z_index = -4
		add_child(label)


## ==================== BANGUNAN ====================

func _create_buildings() -> void:
	for b: Dictionary in VillageData.BUILDINGS:
		var building := Node2D.new()
		building.set_script(load("res://scripts/buildings/village_building.gd"))
		building.position = Vector2(b["tile_x"] * ts + ts / 2, b["tile_y"] * ts + ts / 2)
		building.set("building_name", b["name"])
		building.z_index = 5
		add_child(building)


## ==================== NPC ====================

func _create_npcs() -> void:
	var lookup: Dictionary = {}
	for b: Dictionary in VillageData.BUILDINGS:
		lookup[b["id"]] = b
	
	for n: Dictionary in VillageData.NPCs:
		var bdata: Dictionary = lookup.get(n["building_id"], {})
		if bdata.is_empty():
			continue
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


## ==================== PORTAL ====================

func _create_portals() -> void:
	# Portal Monster (utara)
	_draw_portal(14, 2, Color(0.4, 0.2, 0.8), "Portal Monster")
	# Portal Quest (timur)
	_draw_portal(24, 13, Color(0.6, 0.2, 0.7), "Portal Quest")


func _draw_portal(tile_x: int, tile_y: int, color: Color, label_text: String) -> void:
	var px: float = tile_x * ts + ts / 2.0
	var py: float = tile_y * ts + ts / 2.0
	
	# Base portal (arc)
	var base := ColorRect.new()
	base.size = Vector2(40, 48)
	base.position = Vector2(px - 20, py - 24)
	base.color = Color(0.45, 0.42, 0.40)
	base.z_index = 3
	add_child(base)
	
	# Glow
	var glow := ColorRect.new()
	glow.size = Vector2(28, 36)
	glow.position = Vector2(px - 14, py - 18)
	glow.color = color
	glow.z_index = 4
	add_child(glow)
	
	# Label
	var lbl := Label.new()
	lbl.text = label_text
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.position = Vector2(px - 40, py - 40)
	lbl.size = Vector2(80, 20)
	lbl.add_theme_font_size_override("font_size", 11)
	lbl.add_theme_color_override("font_color", Color.WHITE)
	lbl.add_theme_color_override("font_shadow_color", Color.BLACK)
	lbl.add_theme_constant_override("shadow_offset_x", 1)
	lbl.add_theme_constant_override("shadow_offset_y", 1)
	lbl.z_index = 6
	add_child(lbl)


## ==================== KAMERA ====================

func _setup_camera() -> void:
	var cam := Camera2D.new()
	cam.set_script(load("res://scripts/camera/camera_controller.gd"))
	cam.name = "VillageCamera"
	add_child(cam)
	cam.make_current()


## ==================== HUD ====================

func _setup_hud() -> void:
	hud = CanvasLayer.new()
	hud.set_script(load("res://scripts/ui/village_hud.gd"))
	hud.name = "VillageHUD"
	add_child(hud)
	
	PlayerManager.hp_changed.connect(func(_c, _m): _refresh_hud())
	PlayerManager.gold_changed.connect(func(_g): _refresh_hud())
	PlayerManager.level_changed.connect(func(_l): _refresh_hud())
	PlayerManager.energy_changed.connect(func(_e, _m): _refresh_hud())


func _refresh_hud() -> void:
	if hud and hud.has_method("refresh"):
		hud.refresh()


## ==================== DEBUG ====================

func _setup_debug() -> void:
	debug_panel = load("res://scripts/ui/debug_panel.gd").new()
	debug_panel.name = "DebugPanel"
	add_child(debug_panel)
