## SpawnManager - Placeholder spawn points untuk monster
extends Node2D

var ts: int
var spawn_indicators: Array[Dictionary] = []

func _ready() -> void:
	ts = MonsterAreaData.TILE_SIZE
	_create_spawn_points()

func _create_spawn_points() -> void:
	for sp: Dictionary in MonsterAreaData.SPAWN_POINTS:
		var x: float = sp["x"] * ts + ts * 0.5
		var y: float = sp["y"] * ts + ts * 0.5

		## Spawn indicator (lingkaran transparan)
		var indicator := ColorRect.new()
		indicator.size = Vector2(24, 24)
		indicator.position = Vector2(x-12, y-12)
		indicator.z_index = 2
		match sp["area"]:
			"slime":  indicator.color = Color(0.3, 0.8, 0.3, 0.3)
			"wolf":   indicator.color = Color(0.6, 0.4, 0.3, 0.3)
			"goblin": indicator.color = Color(0.6, 0.3, 0.6, 0.3)
		add_child(indicator)

		## Monster placeholder icon
		var icon := ColorRect.new()
		icon.size = Vector2(10, 10)
		icon.position = Vector2(x-5, y-5)
		icon.z_index = 3
		match sp["area"]:
			"slime":  icon.color = Color(0.3, 0.7, 0.3)
			"wolf":   icon.color = Color(0.5, 0.35, 0.25)
			"goblin": icon.color = Color(0.5, 0.3, 0.5)
		add_child(icon)

		## Label
		var lbl := Label.new()
		lbl.text = sp["area"].capitalize()
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.position = Vector2(x - 20, y + 14)
		lbl.size = Vector2(40, 12)
		lbl.add_theme_font_size_override("font_size", 8)
		lbl.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8, 0.6))
		lbl.z_index = 3
		add_child(lbl)

		spawn_indicators.append({"data": sp, "indicator": indicator, "icon": icon})
