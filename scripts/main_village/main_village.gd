## MainVillage - Desa utama (placeholder)
## Menampilkan info pemain dan DebugPanel untuk testing.
extends Control

var debug_panel: Control


func _ready() -> void:
	print("[MainVillage] Opened")
	
	# Inisialisasi PlayerManager jika belum
	if not PlayerManager.is_initialized:
		PlayerManager.initialize()
	
	_update_info_label()
	_setup_debug_panel()


## Update info label
func _update_info_label() -> void:
	%InfoLabel.text = "Nama: %s | Lv.%d | HP: %d/%d | Gold: %d" % [
		PlayerManager.get_name(),
		PlayerManager.get_level(),
		PlayerManager.get_hp(),
		PlayerManager.get_max_hp(),
		PlayerManager.get_gold(),
	]


## Setup debug panel
func _setup_debug_panel() -> void:
	debug_panel = preload("res://scripts/ui/debug_panel.gd").new()
	debug_panel.name = "DebugPanel"
	add_child(debug_panel)
	
	# Hubungkan signal agar debug panel update otomatis
	PlayerManager.hp_changed.connect(func(_c, _m): debug_panel._update_all())
	PlayerManager.gold_changed.connect(func(_g): debug_panel._update_all())
	PlayerManager.level_changed.connect(func(_l): debug_panel._update_all())
	PlayerManager.energy_changed.connect(func(_e, _m): debug_panel._update_all())


func _on_portal_monster_pressed() -> void:
	SceneManager.change_scene("monster_area")


func _on_portal_quest_pressed() -> void:
	SceneManager.change_scene("npc_quest_area")


func _on_menu_pressed() -> void:
	SceneManager.change_scene("main_menu")
