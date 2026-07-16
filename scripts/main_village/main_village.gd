extends Control
var debug_panel: Node

func _ready() -> void:
	if not PlayerManager.is_initialized:
		PlayerManager.initialize()
	_update_info_label()
	_setup_debug_panel()

func _update_info_label() -> void:
	%InfoLabel.text = "Nama: %s | Lv.%d | HP: %d/%d | Gold: %d" % [
		PlayerManager.get_player_name(), PlayerManager.get_level(),
		PlayerManager.get_hp(), PlayerManager.get_max_hp(), PlayerManager.get_gold()]

func _setup_debug_panel() -> void:
	debug_panel = load("res://scripts/ui/debug_panel.gd").new()
	debug_panel.name = "DebugPanel"
	add_child(debug_panel)
	PlayerManager.hp_changed.connect(func(_c, _m): _refresh_debug())
	PlayerManager.gold_changed.connect(func(_g): _refresh_debug())
	PlayerManager.level_changed.connect(func(_l): _refresh_debug())
	PlayerManager.energy_changed.connect(func(_e, _m): _refresh_debug())

func _refresh_debug() -> void:
	if debug_panel and debug_panel.has_method("update_all"):
		debug_panel.update_all()

func _on_portal_monster_pressed() -> void:
	SceneManager.change_scene("monster_area")
func _on_portal_quest_pressed() -> void:
	SceneManager.change_scene("npc_quest_area")
func _on_menu_pressed() -> void:
	SceneManager.change_scene("main_menu")
