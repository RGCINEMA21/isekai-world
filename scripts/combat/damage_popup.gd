## DamagePopup - Angka damage melayang
extends Node2D

var label: Label
var timer: float = 0.0
var duration: float = 1.0
var velocity_y: float = -60.0

func _ready() -> void:
	z_index = 100

func setup(text: String, color: Color = Color.WHITE) -> void:
	label = Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 16)
	label.add_theme_color_override("font_color", color)
	label.add_theme_color_override("font_shadow_color", Color.BLACK)
	label.add_theme_constant_override("shadow_offset_x", 1)
	label.add_theme_constant_override("shadow_offset_y", 1)
	label.position = Vector2(-30, -10)
	label.size = Vector2(60, 20)
	add_child(label)

func _process(delta: float) -> void:
	timer += delta
	position.y += velocity_y * delta
	velocity_y *= 0.95
	modulate.a = 1.0 - (timer / duration)
	if timer >= duration:
		queue_free()
