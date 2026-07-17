## Settings - Pengaturan game
extends Control

@onready var music_slider: HSlider = %MusicSlider
@onready var sfx_slider: HSlider = %SfxSlider
@onready var language_option: OptionButton = %LanguageOption


func _ready() -> void:
	_load_current_settings()


## Load settingan saat ini ke UI
func _load_current_settings() -> void:
	music_slider.value = AudioManager.volume_music
	sfx_slider.value = AudioManager.volume_sfx
	
	# Set bahasa
	var lang: String = SaveManager.get_data("settings", {}).get("language", "id")
	match lang:
		"id":
			language_option.selected = 0
		"en":
			language_option.selected = 1


## Volume musik berubah
func _on_music_slider_value_changed(value: float) -> void:
	AudioManager.set_volume_music(value)


## Volume SFX berubah
func _on_sfx_slider_value_changed(value: float) -> void:
	AudioManager.set_volume_sfx(value)


## Bahasa berubah
func _on_language_option_item_selected(index: int) -> void:
	var langs := ["id", "en"]
	var lang: String = langs[index]
	var settings: Dictionary = SaveManager.get_data("settings", {})
	settings["language"] = lang
	SaveManager.save_data("settings", settings)


## Reset save
func _on_reset_save_pressed() -> void:
	UIManager.show_confirm(
		"Yakin ingin menghapus semua save data?",
		func():
			SaveManager.reset_save()
			UIManager.show_notification("Save data berhasil dihapus!")
	)


## Kembali ke menu
func _on_back_pressed() -> void:
	SceneManager.change_scene("main_menu")
