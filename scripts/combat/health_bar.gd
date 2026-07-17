## HealthBar - HP bar mengikuti entity (anak dari entity)
extends Node2D

var bar_bg: ColorRect
var bar_fill: ColorRect
var bar_width: float = 40.0
var bar_height: float = 5.0
var current_hp: int = 100
var max_hp: int = 100
var _offset_y: float = -30.0

func _ready() -> void:
	z_index = 20
	_build_bar()

func _build_bar() -> void:
	bar_bg = ColorRect.new()
	bar_bg.size = Vector2(bar_width, bar_height)
	bar_bg.position = Vector2(-bar_width * 0.5, _offset_y)
	bar_bg.color = Color(0.2, 0.2, 0.2)
	add_child(bar_bg)

	bar_fill = ColorRect.new()
	bar_fill.size = Vector2(bar_width, bar_height)
	bar_fill.position = Vector2(-bar_width * 0.5, _offset_y)
	bar_fill.color = Color(0.2, 0.8, 0.2)
	add_child(bar_fill)

func update_bar(current: int, maximum: int) -> void:
	current_hp = maxi(current, 0)
	max_hp = maxi(maximum, 1)
	var ratio: float = float(current_hp) / float(max_hp)
	bar_fill.size.x = bar_width * ratio
	## Warna berdasarkan HP
	if ratio > 0.5:
		bar_fill.color = Color(0.2, 0.8, 0.2)
	elif ratio > 0.25:
		bar_fill.color = Color(0.9, 0.8, 0.2)
	else:
		bar_fill.color = Color(0.9, 0.2, 0.2)
	## Sembunyi jika HP penuh
	visible = ratio < 1.0

func set_offset_y(y: float) -> void:
	_offset_y = y
	if bar_bg:
		bar_bg.position.y = _offset_y
	if bar_fill:
		bar_fill.position.y = _offset_y
