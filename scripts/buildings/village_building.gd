## VillageBuilding - Bangunan placeholder di Main Village
extends Node2D

## Nama bangunan
@export var building_name: String = "Building"

## Warna bangunan berdasarkan tipe
var building_colors: Dictionary = {
	"Rumah": Color(0.55, 0.35, 0.2),
	"Gudang": Color(0.5, 0.45, 0.35),
	"Blacksmith": Color(0.4, 0.3, 0.3),
	"Dapur": Color(0.6, 0.5, 0.3),
	"Laboratorium": Color(0.35, 0.3, 0.5),
	"Marketplace": Color(0.7, 0.6, 0.3),
	"Pertanian": Color(0.4, 0.6, 0.3),
	"Pohon Buah": Color(0.3, 0.55, 0.25),
	"Hutan Permanen": Color(0.2, 0.45, 0.15),
	"Area Batu": Color(0.5, 0.5, 0.5),
	"Portal Monster": Color(0.3, 0.25, 0.6),
	"Portal Quest": Color(0.5, 0.3, 0.6),
}


func _ready() -> void:
	_draw_building()


func _draw_building() -> void:
	var color: Color = building_colors.get(building_name, Color.GRAY)
	
	# Base bangunan
	var base := ColorRect.new()
	base.size = Vector2(64, 48)
	base.position = Vector2(-32, -24)
	base.color = color
	add_child(base)
	
	# Atap
	var roof := ColorRect.new()
	roof.size = Vector2(72, 12)
	roof.position = Vector2(-36, -36)
	roof.color = color.lightened(0.2)
	add_child(roof)
	
	# Pintu
	var door := ColorRect.new()
	door.size = Vector2(12, 20)
	door.position = Vector2(-6, 0)
	door.color = Color(0.35, 0.25, 0.15)
	add_child(door)
	
	# Jendela kiri
	var win_l := ColorRect.new()
	win_l.size = Vector2(10, 10)
	win_l.position = Vector2(-26, -14)
	win_l.color = Color(0.6, 0.8, 0.95)
	add_child(win_l)
	
	# Jendela kanan
	var win_r := ColorRect.new()
	win_r.size = Vector2(10, 10)
	win_r.position = Vector2(16, -14)
	win_r.color = Color(0.6, 0.8, 0.95)
	add_child(win_r)
	
	# Label nama di atas
	var label := Label.new()
	label.text = building_name
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.position = Vector2(-40, -50)
	label.add_theme_font_size_override("font_size", 11)
	label.add_theme_color_override("font_color", Color.WHITE)
	label.add_theme_color_override("font_shadow_color", Color.BLACK)
	label.add_theme_constant_override("shadow_offset_x", 1)
	label.add_theme_constant_override("shadow_offset_y", 1)
	add_child(label)
