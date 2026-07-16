## Boot - Splash screen
extends Control

var timer: float = 0.0
const DURATION := 1.5

func _ready() -> void:
	print("[Boot] Starting...")

func _process(delta: float) -> void:
	timer += delta
	if timer >= DURATION:
		set_process(false)
		SceneManager.change_scene("main_menu")
