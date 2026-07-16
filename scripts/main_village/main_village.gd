## MainVillage - Desa utama (placeholder)
extends Control


func _ready() -> void:
	print("[MainVillage] Opened")
	_update_info_label()


## Update info label dengan data karakter dari save
func _update_info_label() -> void:
	var save: Dictionary = SaveManager.current_data
	var player_name: String = save.get("character", {}).get("name", "???")
	var level: int = int(save.get("stats", {}).get("level", 1))
	var gold: int = int(save.get("currency", {}).get("gold", 0))
	%InfoLabel.text = "Nama: %s | Lv.%d | Gold: %d" % [player_name, level, gold]


func _on_portal_monster_pressed() -> void:
	SceneManager.change_scene("monster_area")


func _on_portal_quest_pressed() -> void:
	SceneManager.change_scene("npc_quest_area")


func _on_menu_pressed() -> void:
	SceneManager.change_scene("main_menu")
