## UIManager - Manajer UI global
## Mengelola popup, notifikasi, dan elemen UI yang selalu tampil.
extends Node


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	print("[UIManager] Initialized")


## Tampilkan notifikasi sederhana
func show_notification(message: String, duration: float = 2.0) -> void:
	var layer := CanvasLayer.new()
	layer.layer = 90
	add_child(layer)
	
	var label := Label.new()
	label.text = message
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.set_anchors_preset(Control.PRESET_FULL_RECT)
	label.add_theme_font_size_override("font_size", 24)
	label.add_theme_color_override("font_color", Color.WHITE)
	label.add_theme_color_override("font_shadow_color", Color.BLACK)
	label.add_theme_constant_override("shadow_offset_x", 2)
	label.add_theme_constant_override("shadow_offset_y", 2)
	layer.add_child(label)
	
	# Auto hide setelah durasi
	await get_tree().create_timer(duration).timeout
	if is_instance_valid(layer):
		layer.queue_free()


## Tampilkan popup konfirmasi
func show_confirm(message: String, on_confirm: Callable, on_cancel: Callable = Callable()) -> void:
	var layer := CanvasLayer.new()
	layer.layer = 95
	add_child(layer)
	
	# Dim background
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.6)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	layer.add_child(dim)
	
	# Panel
	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left = -200
	panel.offset_right = 200
	panel.offset_top = -100
	panel.offset_bottom = 100
	layer.add_child(panel)
	
	# Layout
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 20)
	panel.add_child(vbox)
	
	# Label
	var label := Label.new()
	label.text = message
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	vbox.add_child(label)
	
	# Buttons
	var hbox := HBoxContainer.new()
	hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	hbox.add_theme_constant_override("separation", 20)
	vbox.add_child(hbox)
	
	var confirm_btn := Button.new()
	confirm_btn.text = "Ya"
	confirm_btn.custom_minimum_size = Vector2(100, 40)
	confirm_btn.pressed.connect(func():
		layer.queue_free()
		on_confirm.call()
	)
	hbox.add_child(confirm_btn)
	
	var cancel_btn := Button.new()
	cancel_btn.text = "Batal"
	cancel_btn.custom_minimum_size = Vector2(100, 40)
	cancel_btn.pressed.connect(func():
		layer.queue_free()
		if on_cancel.is_valid():
			on_cancel.call()
	)
	hbox.add_child(cancel_btn)
