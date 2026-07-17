## InventoryUI - Panel UI Inventory
extends CanvasLayer

var max_slots: int = 30
var columns: int = 6
var slot_scene_script = preload("res://scripts/inventory/inventory_slot.gd")
var slots: Array = []
var selected_index: int = -1
var current_filter: int = -1
var current_search: String = ""
var current_sort: String = "name"
var is_open: bool = false

var panel: PanelContainer
var grid: GridContainer
var info_name: Label
var info_category: Label
var info_desc: Label
var info_amount: Label
var info_panel: VBoxContainer
var search_input: LineEdit
var slot_count_label: Label

func _ready() -> void:
	layer = 85

func open() -> void:
	if is_open:
		return
	is_open = true
	_build_ui()
	_refresh_grid()

func close() -> void:
	if not is_open:
		return
	is_open = false
	selected_index = -1
	if panel and is_instance_valid(panel):
		panel.queue_free()
	panel = null

func toggle() -> void:
	if is_open:
		close()
	else:
		open()

func _build_ui() -> void:
	panel = PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(panel)

	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.7)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.gui_input.connect(func(event: InputEvent):
		if (event is InputEventMouseButton or event is InputEventScreenTouch) and event.pressed:
			close()
	)
	panel.add_child(dim)

	var main_vbox := VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_CENTER)
	main_vbox.offset_left = -300
	main_vbox.offset_right = 300
	main_vbox.offset_top = -240
	main_vbox.offset_bottom = 240
	main_vbox.add_theme_constant_override("separation", 8)
	panel.add_child(main_vbox)

	var title_hbox := HBoxContainer.new()
	title_hbox.add_theme_constant_override("separation", 10)
	main_vbox.add_child(title_hbox)

	var title := Label.new()
	title.text = "📦 INVENTORY"
	title.add_theme_font_size_override("font_size", 22)
	title_hbox.add_child(title)

	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_hbox.add_child(spacer)

	slot_count_label = Label.new()
	slot_count_label.add_theme_font_size_override("font_size", 13)
	slot_count_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	title_hbox.add_child(slot_count_label)

	var close_btn := Button.new()
	close_btn.text = "✕"
	close_btn.custom_minimum_size = Vector2(36, 36)
	close_btn.pressed.connect(func(): close())
	title_hbox.add_child(close_btn)

	var filter_hbox := HBoxContainer.new()
	filter_hbox.add_theme_constant_override("separation", 4)
	main_vbox.add_child(filter_hbox)

	var categories: Array[String] = ItemDatabase.get_all_category_names()
	for i in range(categories.size()):
		var btn := Button.new()
		btn.text = categories[i]
		btn.add_theme_font_size_override("font_size", 11)
		btn.custom_minimum_size = Vector2(0, 28)
		var cat_index: int = i - 1
		btn.pressed.connect(func():
			current_filter = cat_index
			_refresh_grid()
		)
		filter_hbox.add_child(btn)

	var search_hbox := HBoxContainer.new()
	search_hbox.add_theme_constant_override("separation", 8)
	main_vbox.add_child(search_hbox)

	search_input = LineEdit.new()
	search_input.placeholder_text = "Search..."
	search_input.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	search_input.custom_minimum_size = Vector2(0, 30)
	search_input.text_changed.connect(func(text): current_search = text; _refresh_grid())
	search_hbox.add_child(search_input)

	for sort_name: String in ["Name", "Qty", "Cat"]:
		var sbtn := Button.new()
		sbtn.text = sort_name
		sbtn.add_theme_font_size_override("font_size", 10)
		sbtn.custom_minimum_size = Vector2(0, 30)
		var skey: String = sort_name.to_lower()
		if skey == "qty": skey = "quantity"
		elif skey == "cat": skey = "category"
		sbtn.pressed.connect(func(): current_sort = skey; _refresh_grid())
		search_hbox.add_child(sbtn)

	var content_hbox := HBoxContainer.new()
	content_hbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content_hbox.add_theme_constant_override("separation", 10)
	main_vbox.add_child(content_hbox)

	var scroll := ScrollContainer.new()
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content_hbox.add_child(scroll)

	grid = GridContainer.new()
	grid.columns = columns
	grid.add_theme_constant_override("h_separation", 4)
	grid.add_theme_constant_override("v_separation", 4)
	scroll.add_child(grid)

	info_panel = VBoxContainer.new()
	info_panel.custom_minimum_size = Vector2(160, 0)
	info_panel.add_theme_constant_override("separation", 6)
	content_hbox.add_child(info_panel)

	var info_title := Label.new()
	info_title.text = "Item Info"
	info_title.add_theme_font_size_override("font_size", 15)
	info_panel.add_child(info_title)

	info_name = Label.new()
	info_name.add_theme_font_size_override("font_size", 14)
	info_panel.add_child(info_name)

	info_category = Label.new()
	info_category.add_theme_font_size_override("font_size", 12)
	info_category.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
	info_panel.add_child(info_category)

	info_amount = Label.new()
	info_amount.add_theme_font_size_override("font_size", 12)
	info_panel.add_child(info_amount)

	info_panel.add_child(HSeparator.new())

	info_desc = Label.new()
	info_desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	info_desc.add_theme_font_size_override("font_size", 12)
	info_desc.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	info_panel.add_child(info_desc)


func _refresh_grid() -> void:
	if not grid:
		return

	for child in grid.get_children():
		child.queue_free()
	slots.clear()

	var items: Array = PlayerManager.get_inventory() if PlayerManager.is_initialized else []

	if current_filter >= 0:
		items = ItemDatabase.filter_by_category(items, current_filter)
	if not current_search.is_empty():
		items = ItemDatabase.search_items(items, current_search)
	items = ItemDatabase.sort_items(items, current_sort)

	for i in range(max_slots):
		var slot = slot_scene_script.new()
		slot.slot_index = i
		slot.slot_clicked.connect(_on_slot_clicked)
		grid.add_child(slot)
		slots.append(slot)
		if i < items.size():
			slot.set_item(items[i])

	var used: int = PlayerManager.get_inventory_size() if PlayerManager.is_initialized else 0
	slot_count_label.text = "%d / %d" % [used, max_slots]


func _on_slot_clicked(index: int, item: Dictionary) -> void:
	selected_index = index
	for s in slots:
		if s.has_method("set_highlight"):
			s.set_highlight(false)
	if index >= 0 and index < slots.size():
		slots[index].set_highlight(true)

	if item.is_empty():
		info_name.text = "Empty Slot"
		info_category.text = ""
		info_amount.text = ""
		info_desc.text = ""
		return

	var item_id: String = item.get("id", "")
	var db_item: Dictionary = ItemDatabase.get_item(item_id)
	info_name.text = item.get("name", db_item.get("name", "???"))
	info_category.text = ItemDatabase.get_category_name(item.get("category", db_item.get("category", 0)))
	info_amount.text = "Qty: %d / %d" % [item.get("amount", 1), item.get("max_stack", db_item.get("max_stack", 99))]
	info_desc.text = item.get("description", db_item.get("description", ""))
