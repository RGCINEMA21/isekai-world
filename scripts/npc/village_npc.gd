## VillageNPC - NPC di depan bangunan di Main Village
## Dapat diklik/sentuh untuk menampilkan nama.
extends Area2D

## Nama NPC
@export var npc_name: String = "NPC"

## ID bangunan terkait
@export var building_id: String = ""

## Sprite placeholder
var sprite: ColorRect
var name_label: Label
var name_timer: Timer

## Warna berdasarkan tipe NPC
var npc_colors: Dictionary = {
	"Penjaga Rumah": Color(0.6, 0.4, 0.3),
	"Penjaga Gudang": Color(0.4, 0.5, 0.6),
	"Pandai Besi": Color(0.7, 0.3, 0.2),
	"Koki": Color(0.9, 0.8, 0.5),
	"Alkemis": Color(0.4, 0.3, 0.7),
	"Pedagang": Color(0.8, 0.6, 0.2),
	"Petani": Color(0.4, 0.7, 0.3),
	"Pekebun": Color(0.5, 0.7, 0.4),
	"Penebang Kayu": Color(0.5, 0.35, 0.2),
	"Penambang Batu": Color(0.6, 0.6, 0.6),
	"Ksatria Portal": Color(0.3, 0.4, 0.8),
	"Penjaga Quest": Color(0.7, 0.3, 0.7),
}


func _ready() -> void:
	# Collision shape
	var col := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = Vector2(24, 28)
	col.shape = shape
	add_child(col)
	
	# Sprite (kotak warna sebagai placeholder)
	sprite = ColorRect.new()
	sprite.size = Vector2(20, 28)
	sprite.position = Vector2(-10, -14)
	sprite.color = npc_colors.get(npc_name, Color.MAGENTA)
	add_child(sprite)
	
	# Kepala (lingkaran kecil)
	var head := ColorRect.new()
	head.size = Vector2(14, 14)
	head.position = Vector2(-7, -22)
	head.color = Color(0.85, 0.7, 0.55)
	add_child(head)
	
	# Mata
	var eye_l := ColorRect.new()
	eye_l.size = Vector2(3, 3)
	eye_l.position = Vector2(-5, -19)
	eye_l.color = Color.BLACK
	add_child(eye_l)
	
	var eye_r := ColorRect.new()
	eye_r.size = Vector2(3, 3)
	eye_r.position = Vector2(2, -19)
	eye_r.color = Color.BLACK
	add_child(eye_r)
	
	# Nama label (tersembunyi)
	name_label = Label.new()
	name_label.text = npc_name
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_label.position = Vector2(-40, -42)
	name_label.add_theme_font_size_override("font_size", 11)
	name_label.add_theme_color_override("font_color", Color.WHITE)
	name_label.add_theme_color_override("font_shadow_color", Color.BLACK)
	name_label.add_theme_constant_override("shadow_offset_x", 1)
	name_label.add_theme_constant_override("shadow_offset_y", 1)
	name_label.visible = false
	add_child(name_label)
	
	# Timer untuk sembunyikan nama
	name_timer = Timer.new()
	name_timer.wait_time = 2.0
	name_timer.one_shot = true
	name_timer.timeout.connect(_on_name_timer_timeout)
	add_child(name_timer)
	
	# Input
	input_event.connect(_on_input_event)
	
	# Z-index agar NPC di atas tilemap
	z_index = 10


## Ketika NPC diklik/sentuh
func _on_input_event(_viewport: Node, event: InputEvent, _shape_idx: int) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_show_name()
	elif event is InputEventScreenTouch and event.pressed:
		_show_name()


func _show_name() -> void:
	name_label.visible = true
	name_timer.start()


func _on_name_timer_timeout() -> void:
	name_label.visible = false
