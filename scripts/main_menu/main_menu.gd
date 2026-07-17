## MainMenu - Menu utama game
extends Control

@onready var continue_btn: Button = %ContinueButton


func _ready() -> void:
	# Disable Continue jika tidak ada save
	continue_btn.disabled = not SaveManager.has_save()


## New Game - Mulai game baru
func _on_new_game_pressed() -> void:
	GameManager.start_new_game()
	SceneManager.change_scene("character_creation")


## Continue - Lanjutkan dari save
func _on_continue_pressed() -> void:
	if GameManager.continue_game():
		SceneManager.change_scene("main_village")
	else:
		UIManager.show_notification("Tidak ada save data!")


## Settings - Buka pengaturan
func _on_settings_pressed() -> void:
	SceneManager.change_scene("settings")


## Credits - Tampilkan credits
func _on_credits_pressed() -> void:
	UIManager.show_notification("Credits: ISEKAI WORLD Team")


## Exit - Keluar game (hanya desktop)
func _on_exit_pressed() -> void:
	GameManager.quit_game()
