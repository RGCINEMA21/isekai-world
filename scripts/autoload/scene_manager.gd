## SceneManager - Manajer transisi scene
## Mengelola perpindahan antar scene dengan transisi.
extends Node

## Daftar path scene
var scene_paths: Dictionary = {
	"boot": "res://scenes/boot/boot.tscn",
	"main_menu": "res://scenes/main_menu/main_menu.tscn",
	"settings": "res://scenes/settings/settings.tscn",
	"character_creation": "res://scenes/character_creation/character_creation.tscn",
	"main_village": "res://scenes/main_village/main_village.tscn",
	"monster_area": "res://scenes/monster_area/monster_area.tscn",
	"npc_quest_area": "res://scenes/npc_quest_area/npc_quest_area.tscn",
	"loading": "res://scenes/loading/loading.tscn",
}

## Scene saat ini
var current_scene: String = ""

## Layer transisi
var transition_layer: CanvasLayer
var color_rect: ColorRect

## Apakah sedang transisi
var is_transitioning: bool = false


## Dipanggil saat node masuk tree
func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_setup_transition_layer()
	print("[SceneManager] Initialized")


## Setup layer transisi
func _setup_transition_layer() -> void:
	transition_layer = CanvasLayer.new()
	transition_layer.layer = 100
	add_child(transition_layer)
	
	color_rect = ColorRect.new()
	color_rect.color = Color.BLACK
	color_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	color_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	color_rect.modulate.a = 0.0
	transition_layer.add_child(color_rect)


## Berubah ke scene baru dengan transisi
func change_scene(scene_name: String, data: Dictionary = {}) -> void:
	if is_transitioning:
		return
	if not scene_paths.has(scene_name):
		push_error("[SceneManager] Scene not found: %s" % scene_name)
		return
	
	is_transitioning = true
	current_scene = scene_name
	
	# Fade out
	var tween := create_tween()
	tween.tween_property(color_rect, "modulate:a", 1.0, 0.3)
	await tween.finished
	
	# Ganti scene
	get_tree().change_scene_to_file(scene_paths[scene_name])
	
	# Fade in
	tween = create_tween()
	tween.tween_property(color_rect, "modulate:a", 0.0, 0.3)
	await tween.finished
	
	is_transitioning = false
	print("[SceneManager] Changed to: %s" % scene_name)


## Kembali ke scene sebelumnya
func go_back() -> void:
	if current_scene == "main_menu":
		return
	change_scene("main_menu")
