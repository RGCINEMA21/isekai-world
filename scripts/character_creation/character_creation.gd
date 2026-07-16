## CharacterCreation - Pembuatan karakter
extends Control

var selected_gender: String = "male"


func _ready() -> void:
	print("[CharacterCreation] Opened")


## Pilih laki-laki
func _on_male_button_pressed() -> void:
	selected_gender = "male"
	%MaleButton.button_pressed = true
	%FemaleButton.button_pressed = false
	%PreviewLabel.text = "Karakter: Laki-laki"


## Pilih perempuan
func _on_female_button_pressed() -> void:
	selected_gender = "female"
	%FemaleButton.button_pressed = true
	%MaleButton.button_pressed = false
	%PreviewLabel.text = "Karakter: Perempuan"


## Filter input nama - hanya huruf dan spasi
func _on_name_input_text_changed(new_text: String) -> void:
	var clean := ""
	for c in new_text:
		if c.is_valid_identifier() or c == " ":
			clean += c
	%NameInput.text = clean


## Mulai petualangan - validasi dan simpan
func _on_start_button_pressed() -> void:
	var name_text: String = %NameInput.text.strip_edges()
	if name_text.length() < 3:
		UIManager.show_notification("Nama minimal 3 karakter!")
		return
	
	SaveManager.current_data["player"]["name"] = name_text
	SaveManager.current_data["player"]["gender"] = selected_gender
	SaveManager.save_game()
	SceneManager.change_scene("main_village")


## Kembali ke menu utama
func _on_back_button_pressed() -> void:
	SceneManager.change_scene("main_menu")
