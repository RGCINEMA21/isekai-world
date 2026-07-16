## Loading - Loading screen
extends Control

var timer: float = 0.0
var target_scene: String = ""
const LOAD_DURATION := 1.0

func _ready() -> void:
	print("[Loading] Started")

func _process(delta: float) -> void:
	timer += delta
	if timer >= LOAD_DURATION and target_scene != "":
		set_process(false)
		SceneManager.change_scene(target_scene)
