## MonsterArea - Area monster (placeholder)
extends Control


func _ready() -> void:
	print("[MonsterArea] Opened")


## Kembali ke desa
func _on_back_pressed() -> void:
	SceneManager.change_scene("main_village")
