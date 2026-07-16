## Boot - Splash screen pertama kali game dimulai
extends Control

var timer: float = 0.0
const DURATION: float = 1.5


func _ready() -> void:
	print("[Boot] Starting...")


func _process(delta: float) -> void:
	timer += delta
	if timer >= DURATION:
		set_process(false)
		SceneManager.change_scene("main_menu")
