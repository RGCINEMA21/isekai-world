## BuildingManager - Membuat semua bangunan desa
extends Node2D

var ts: int

func _ready() -> void:
	ts = VillageData.TILE_SIZE
	for b: Dictionary in VillageData.BUILDINGS:
		_create_building(b)

func _create_building(b: Dictionary) -> void:
	var x: float = b["tile_x"] * ts + ts * 0.5
	var y: float = b["tile_y"] * ts + ts * 0.5
	var bid: String = b["id"]
	var bname: String = b["name"]
	var building := Node2D.new()
	building.position = Vector2(x, y)
	building.z_index = 5

	match bid:
		"home":
			_draw_house(building, bname)
		"warehouse":
			_draw_warehouse(building, bname)
		"well":
			_draw_well(building, bname)
		"blacksmith":
			_draw_blacksmith(building, bname)
		"kitchen":
			_draw_kitchen(building, bname)
		"portal_monster":
			_draw_portal(building, bname, Color(0.4, 0.2, 0.8))
		"portal_quest":
			_draw_portal(building, bname, Color(0.6, 0.2, 0.7))
		"permanent_forest":
			_draw_forest(building, bname)
		"permanent_stone":
			_draw_stone_area(building, bname)
		"market":
			_draw_market(building, bname)
		"lab":
			_draw_lab(building, bname)
		"farming":
			_draw_farming(building, bname)
		"fruit_trees":
			_draw_fruit_trees(building, bname)
		_:
			_draw_generic(building, bname)

	add_child(building)

	## Label nama bangunan
	var lbl := Label.new()
	lbl.text = bname
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.position = Vector2(x - 40, y - 44)
	lbl.size = Vector2(80, 16)
	lbl.add_theme_font_size_override("font_size", 10)
	lbl.add_theme_color_override("font_color", Color(0.9, 0.9, 0.9))
	lbl.add_theme_color_override("font_shadow_color", Color.BLACK)
	lbl.add_theme_constant_override("shadow_offset_x", 1)
	lbl.add_theme_constant_override("shadow_offset_y", 1)
	lbl.z_index = 6
	add_child(lbl)

## --- Rumah Player ---
func _draw_house(node: Node2D, _n: String) -> void:
	_add_rect(node, -20, -16, 40, 32, Color(0.55, 0.35, 0.2))  # badan
	_add_rect(node, -24, -22, 48, 10, Color(0.7, 0.2, 0.15))    # atap
	_add_rect(node, -4, 0, 8, 12, Color(0.4, 0.25, 0.12))       # pintu
	_add_rect(node, -16, -10, 8, 8, Color(0.6, 0.8, 0.9, 0.8))  # jendela kiri
	_add_rect(node, 8, -10, 8, 8, Color(0.6, 0.8, 0.9, 0.8))    # jendela kanan

## --- Gudang ---
func _draw_warehouse(node: Node2D, _n: String) -> void:
	_add_rect(node, -18, -14, 36, 28, Color(0.5, 0.4, 0.25))
	_add_rect(node, -20, -18, 40, 8, Color(0.45, 0.35, 0.2))
	_add_rect(node, -10, 2, 20, 10, Color(0.35, 0.25, 0.15))    # pintu besar
	_add_rect(node, -14, -8, 6, 6, Color(0.6, 0.5, 0.3))        # peti

## --- Sumur ---
func _draw_well(node: Node2D, _n: String) -> void:
	_add_rect(node, -10, -6, 20, 12, Color(0.5, 0.5, 0.55))     # batu dasar
	_add_rect(node, -6, -10, 12, 6, Color(0.6, 0.6, 0.65))      # batu atas
	_add_rect(node, -2, -16, 4, 8, Color(0.45, 0.3, 0.15))      # tiang
	_add_rect(node, -8, -16, 16, 3, Color(0.45, 0.3, 0.15))     # balok atas

## --- Blacksmith ---
func _draw_blacksmith(node: Node2D, _n: String) -> void:
	_add_rect(node, -18, -14, 36, 28, Color(0.45, 0.35, 0.3))
	_add_rect(node, -20, -18, 40, 8, Color(0.4, 0.3, 0.25))
	_add_rect(node, -8, 0, 8, 10, Color(0.35, 0.2, 0.1))
	_add_rect(node, 4, -4, 10, 12, Color(0.7, 0.3, 0.1))       # tungku api
	_add_rect(node, 6, -6, 6, 4, Color(0.9, 0.5, 0.1, 0.8))    # api glow

## --- Dapur ---
func _draw_kitchen(node: Node2D, _n: String) -> void:
	_add_rect(node, -16, -12, 32, 24, Color(0.5, 0.38, 0.25))
	_add_rect(node, -18, -16, 36, 8, Color(0.65, 0.25, 0.15))
	_add_rect(node, -4, -2, 8, 10, Color(0.4, 0.28, 0.15))
	_add_rect(node, -10, -8, 8, 6, Color(0.6, 0.8, 0.9, 0.7))  # jendela
	_add_rect(node, 8, -12, 6, 12, Color(0.4, 0.35, 0.3))       # cerobong

## --- Portal ---
func _draw_portal(node: Node2D, _n: String, glow_color: Color) -> void:
	_add_rect(node, -12, -16, 24, 32, Color(0.45, 0.42, 0.40))
	_add_rect(node, -8, -12, 16, 24, glow_color)
	_add_rect(node, -4, -8, 8, 16, glow_color.lightened(0.3))

## --- Hutan ---
func _draw_forest(node: Node2D, _n: String) -> void:
	_add_rect(node, -24, -20, 48, 40, Color(0.25, 0.50, 0.20, 0.3))
	for ox: float in [-12.0, 0.0, 12.0]:
		for oy: float in [-8.0, 4.0]:
			_add_rect(node, ox-3, oy+4, 6, 10, Color(0.4, 0.28, 0.12))
			_add_rect(node, ox-8, oy-6, 16, 14, Color(0.2, 0.48, 0.18))

## --- Area Batu ---
func _draw_stone_area(node: Node2D, _n: String) -> void:
	_add_rect(node, -20, -16, 40, 32, Color(0.45, 0.43, 0.40, 0.3))
	for ox: float in [-10.0, 4.0, 12.0]:
		for oy: float in [-6.0, 6.0]:
			_add_rect(node, ox, oy, 8, 6, Color(0.55, 0.53, 0.50))

## --- Marketplace ---
func _draw_market(node: Node2D, _n: String) -> void:
	_add_rect(node, -20, -4, 40, 16, Color(0.6, 0.5, 0.35))
	_add_rect(node, -22, -12, 44, 12, Color(0.7, 0.3, 0.2))
	_add_rect(node, -22, -12, 44, 4, Color(0.8, 0.35, 0.25))
	_add_rect(node, -16, -8, 10, 8, Color(0.5, 0.4, 0.3))
	_add_rect(node, 6, -8, 10, 8, Color(0.5, 0.4, 0.3))

## --- Lab ---
func _draw_lab(node: Node2D, _n: String) -> void:
	_add_rect(node, -16, -14, 32, 28, Color(0.4, 0.42, 0.5))
	_add_rect(node, -18, -18, 36, 8, Color(0.35, 0.38, 0.45))
	_add_rect(node, -4, -2, 8, 10, Color(0.3, 0.32, 0.4))
	_add_rect(node, -12, -8, 6, 8, Color(0.4, 0.7, 0.9, 0.6))  # botol
	_add_rect(node, 8, -8, 6, 8, Color(0.3, 0.8, 0.5, 0.6))    # botol

## --- Pertanian ---
func _draw_farming(node: Node2D, _n: String) -> void:
	_add_rect(node, -24, -20, 48, 40, Color(0.35, 0.45, 0.22, 0.3))
	for ox: float in [-16.0, -8.0, 0.0, 8.0, 16.0]:
		_add_rect(node, ox-2, -12, 4, 24, Color(0.30, 0.40, 0.18))

## --- Pohon Buah ---
func _draw_fruit_trees(node: Node2D, _n: String) -> void:
	_add_rect(node, -20, -16, 40, 32, Color(0.28, 0.52, 0.22, 0.3))
	for ox: float in [-10.0, 0.0, 10.0]:
		_add_rect(node, ox-2, 2, 4, 8, Color(0.4, 0.28, 0.12))
		_add_rect(node, ox-6, -8, 12, 12, Color(0.2, 0.48, 0.18))
		_add_rect(node, ox-2, -6, 4, 4, Color(0.9, 0.3, 0.2))   # buah

## --- Generic ---
func _draw_generic(node: Node2D, bname: String) -> void:
	_add_rect(node, -16, -12, 32, 24, Color(0.5, 0.5, 0.5))

func _add_rect(node: Node2D, x: float, y: float, w: float, h: float, color: Color) -> void:
	var r := ColorRect.new()
	r.size = Vector2(w, h)
	r.position = Vector2(x, y)
	r.color = color
	node.add_child(r)
