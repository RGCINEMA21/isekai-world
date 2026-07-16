## MainVillage - Desa utama (placeholder)
extends Control


func _ready() -> void:
	print("[MainVillage] Opened")
	var save: Dictionary = SaveManager.current_data
	var player_name: String = save.get("player", {}).get("name", "???")
	var level: int = int(save.get("stats", {}).get("level", 1))
	%InfoLabel.text = "Nama: %s | Level: %d" % [player_name, level]


## Buka Portal Monster
func _on_portal_monster_pressed() -> void:
	SceneManager.change_scene("monster_area")


## Buka Portal Quest
func _on_portal_quest_pressed() -> void:
	SceneManager.change_scene("npc_quest_area")


## Kembali ke menu utama
func _on_menu_pressed() -> void:
	SceneManager.change_scene("main_menu")
