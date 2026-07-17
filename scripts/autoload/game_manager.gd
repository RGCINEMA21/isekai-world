## GameManager - Manajer utama game
## Mengatur state global, flow game, dan koordinasi antar sistem.
extends Node

## State game saat ini
enum GameState { BOOT, MENU, PLAYING, PAUSED, LOADING }

## State aktif
var current_state: GameState = GameState.BOOT

## Apakah game baru dimulai (New Game)
var is_new_game: bool = false

## Data sesi game saat ini
var session_data: Dictionary = {}

## Signal saat state berubah
signal state_changed(old_state: GameState, new_state: GameState)


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS


func change_state(new_state: GameState) -> void:
	var old_state := current_state
	current_state = new_state
	state_changed.emit(old_state, new_state)


func start_new_game() -> void:
	is_new_game = true
	session_data = {}
	SaveManager.reset_save()
	change_state(GameState.PLAYING)


## Melanjutkan game dari save
func continue_game() -> bool:
	if not SaveManager.has_save():
		return false
	is_new_game = false
	session_data = SaveManager.load_save()
	# Inisialisasi PlayerManager dengan data save
	PlayerManager.initialize()
	change_state(GameState.PLAYING)
	return true


func return_to_menu() -> void:
	change_state(GameState.MENU)
	SceneManager.change_scene("main_menu")


func quit_game() -> void:
	SaveManager.save_game()
	get_tree().quit()
