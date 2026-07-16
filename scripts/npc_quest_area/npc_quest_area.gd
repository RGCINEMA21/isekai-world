## NPCQuestArea - Area NPC Quest (placeholder)
extends Control


func _ready() -> void:
	print("[NPCQuestArea] Opened")


## Kembali ke desa
func _on_back_pressed() -> void:
	SceneManager.change_scene("main_village")
