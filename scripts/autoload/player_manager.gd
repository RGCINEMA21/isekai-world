## PlayerManager - Manajer data pemain
## Sumber utama seluruh data karakter. Digunakan oleh seluruh sistem game.
extends Node

## ==================== SIGNAL ====================
## Dipancarkan saat data berubah agar UI bisa update
signal hp_changed(current: int, maximum: int)
signal energy_changed(current: int, maximum: int)
signal gold_changed(current: int)
signal diamond_changed(current: int)
signal exp_changed(current: int, to_next: int)
signal level_changed(new_level: int)
signal equipment_changed(slot: String, item: Dictionary)


## ==================== DATA ====================
## Data pemain aktif
var data: Dictionary = {}

## Apakah PlayerManager sudah diinisialisasi
var is_initialized: bool = false


## ==================== INISIALISASI ====================


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	print("[PlayerManager] Initialized")


## Inisialisasi data dari SaveManager
func initialize() -> void:
	data = SaveManager.current_data
	if data.is_empty():
		data = PlayerData.DEFAULT_DATA.duplicate(true)
	# Pastikan semua key ada (backward compatibility)
	_ensure_keys()
	is_initialized = true
	print("[PlayerManager] Data loaded - Lv.%d %s" % [
		get_level(), get_name()
	])


## Pastikan semua key ada (jika save lama belum punya field baru)
func _ensure_keys() -> void:
	var defaults: Dictionary = PlayerData.DEFAULT_DATA
	for section: String in defaults.keys():
		if not data.has(section):
			data[section] = defaults[section].duplicate(true)
		else:
			for key: String in defaults[section].keys():
				if not data[section].has(key):
					data[section][key] = defaults[section][key]


## Simpan perubahan ke file
func save() -> void:
	SaveManager.current_data = data
	SaveManager.save_game()


## ==================== IDENTITY ====================


func get_name() -> String:
	return data.get("identity", {}).get("name", "???")


func get_gender() -> String:
	return data.get("identity", {}).get("gender", "male")


func get_id() -> String:
	return data.get("identity", {}).get("id", "")


## ==================== PROGRESS ====================


func get_level() -> int:
	return int(data.get("progress", {}).get("level", 1))


func get_exp() -> int:
	return int(data.get("progress", {}).get("exp", 0))


func get_exp_to_next() -> int:
	return int(data.get("progress", {}).get("exp_to_next", 100))


func get_location() -> String:
	return data.get("progress", {}).get("location", "Main Village")


func set_location(loc: String) -> void:
	data["progress"]["location"] = loc
	save()


## ==================== HP SYSTEM ====================


func get_hp() -> int:
	return int(data.get("stats", {}).get("hp", 100))


func get_max_hp() -> int:
	return int(data.get("stats", {}).get("max_hp", 100))


## Pulihkan HP. Tidak melebihi Max HP.
func heal(amount: int) -> int:
	var old_hp: int = get_hp()
	var new_hp: int = mini(old_hp + amount, get_max_hp())
	data["stats"]["hp"] = new_hp
	hp_changed.emit(new_hp, get_max_hp())
	save()
	return new_hp - old_hp


## Kurangi HP. Tidak boleh kurang dari 0.
func damage(amount: int) -> int:
	var old_hp: int = get_hp()
	var new_hp: int = maxi(old_hp - amount, 0)
	data["stats"]["hp"] = new_hp
	hp_changed.emit(new_hp, get_max_hp())
	save()
	return old_hp - new_hp


## Set HP langsung
func set_hp(value: int) -> void:
	data["stats"]["hp"] = clampi(value, 0, get_max_hp())
	hp_changed.emit(get_hp(), get_max_hp())
	save()


## Set Max HP (misal saat level up)
func set_max_hp(value: int) -> void:
	data["stats"]["max_hp"] = maxi(value, 1)
	# Jika HP melebihi max baru, batasi
	if get_hp() > get_max_hp():
		data["stats"]["hp"] = get_max_hp()
	hp_changed.emit(get_hp(), get_max_hp())
	save()


## Pulihkan HP penuh
func heal_full() -> void:
	data["stats"]["hp"] = get_max_hp()
	hp_changed.emit(get_hp(), get_max_hp())
	save()


## ==================== ENERGY SYSTEM ====================


func get_energy() -> int:
	return int(data.get("stats", {}).get("energy", 100))


func get_max_energy() -> int:
	return int(data.get("stats", {}).get("max_energy", 100))


## Tambah Energy. Tidak melebihi Max Energy.
func add_energy(amount: int) -> int:
	var old_energy: int = get_energy()
	var new_energy: int = mini(old_energy + amount, get_max_energy())
	data["stats"]["energy"] = new_energy
	energy_changed.emit(new_energy, get_max_energy())
	save()
	return new_energy - old_energy


## Kurangi Energy. Tidak boleh kurang dari 0.
func reduce_energy(amount: int) -> int:
	var old_energy: int = get_energy()
	var new_energy: int = maxi(old_energy - amount, 0)
	data["stats"]["energy"] = new_energy
	energy_changed.emit(new_energy, get_max_energy())
	save()
	return old_energy - new_energy


## Set Energy penuh
func energy_full() -> void:
	data["stats"]["energy"] = get_max_energy()
	energy_changed.emit(get_energy(), get_max_energy())
	save()


## ==================== CURRENCY ====================


func get_gold() -> int:
	return int(data.get("currency", {}).get("gold", 0))


func get_diamond() -> int:
	return int(data.get("currency", {}).get("diamond", 0))


## Tambah Gold
func add_gold(amount: int) -> int:
	var old_gold: int = get_gold()
	data["currency"]["gold"] = old_gold + amount
	gold_changed.emit(get_gold())
	save()
	return get_gold() - old_gold


## Kurangi Gold. Jika kurang, return false.
func reduce_gold(amount: int) -> bool:
	if get_gold() < amount:
		return false
	data["currency"]["gold"] = get_gold() - amount
	gold_changed.emit(get_gold())
	save()
	return true


## Tambah Diamond
func add_diamond(amount: int) -> int:
	var old_diamond: int = get_diamond()
	data["currency"]["diamond"] = old_diamond + amount
	diamond_changed.emit(get_diamond())
	save()
	return get_diamond() - old_diamond


## Kurangi Diamond. Jika kurang, return false.
func reduce_diamond(amount: int) -> bool:
	if get_diamond() < amount:
		return false
	data["currency"]["diamond"] = get_diamond() - amount
	diamond_changed.emit(get_diamond())
	save()
	return true


## ==================== EXPERIENCE & LEVEL ====================


## Tambah EXP. Otomatis level up jika mencukupi.
func add_experience(amount: int) -> void:
	data["progress"]["exp"] = get_exp() + amount
	exp_changed.emit(get_exp(), get_exp_to_next())
	
	# Cek level up berulang (jika EXP sangat besar)
	while get_exp() >= get_exp_to_next():
		_level_up()
	
	save()


## Internal: proses level up
func _level_up() -> void:
	data["progress"]["exp"] = get_exp() - get_exp_to_next()
	data["progress"]["level"] = get_level() + 1
	
	# Hitung EXP untuk level berikutnya
	data["progress"]["exp_to_next"] = PlayerData.exp_for_level(get_level())
	
	# Bonus stat saat level up
	data["stats"]["max_hp"] = get_max_hp() + 10
	data["stats"]["hp"] = get_max_hp()  # Full HP saat level up
	data["stats"]["max_energy"] = get_max_energy() + 5
	data["stats"]["energy"] = get_max_energy()
	data["stats"]["attack"] = get_attack() + 2
	data["stats"]["defense"] = get_defense() + 1
	
	print("[PlayerManager] LEVEL UP! Level %d" % get_level())
	level_changed.emit(get_level())
	exp_changed.emit(get_exp(), get_exp_to_next())
	hp_changed.emit(get_hp(), get_max_hp())
	energy_changed.emit(get_energy(), get_max_energy())


## ==================== STATS ====================


func get_attack() -> int:
	return int(data.get("stats", {}).get("attack", 10))


func get_defense() -> int:
	return int(data.get("stats", {}).get("defense", 5))


func get_critical_rate() -> float:
	return float(data.get("stats", {}).get("critical_rate", 5.0))


func get_critical_damage() -> float:
	return float(data.get("stats", {}).get("critical_damage", 150.0))


func get_attack_speed() -> float:
	return float(data.get("stats", {}).get("attack_speed", 1.0))


func get_movement_speed() -> float:
	return float(data.get("stats", {}).get("movement_speed", 200.0))


func set_attack(value: int) -> void:
	data["stats"]["attack"] = value
	save()


func set_defense(value: int) -> void:
	data["stats"]["defense"] = value
	save()


## ==================== EQUIPMENT ====================


## Ambil item equipment di slot tertentu
func get_equipment(slot: String) -> Dictionary:
	return data.get("equipment", {}).get(slot, {})


## Pakai equipment di slot tertentu
func equip(slot: String, item: Dictionary) -> void:
	data["equipment"][slot] = item
	equipment_changed.emit(slot, item)
	save()


## Lepas equipment dari slot
func unequip(slot: String) -> void:
	data["equipment"][slot] = ""
	equipment_changed.emit(slot, {})
	save()


## Ambil total bonus attack dari equipment
func get_equipment_attack() -> int:
	var bonus: int = 0
	for slot: String in ["weapon", "armor", "helmet", "gloves", "boots", "ring", "necklace"]:
		var item: Dictionary = get_equipment(slot)
		if item is Dictionary and item.has("attack"):
			bonus += int(item["attack"])
	return bonus


## Ambil total bonus defense dari equipment
func get_equipment_defense() -> int:
	var bonus: int = 0
	for slot: String in ["weapon", "armor", "helmet", "gloves", "boots", "ring", "necklace"]:
		var item: Dictionary = get_equipment(slot)
		if item is Dictionary and item.has("defense"):
			bonus += int(item["defense"])
	return bonus


## Total attack (base + equipment)
func get_total_attack() -> int:
	return get_attack() + get_equipment_attack()


## Total defense (base + equipment)
func get_total_defense() -> int:
	return get_defense() + get_equipment_defense()


## ==================== INVENTORY ====================


func get_inventory() -> Array:
	return data.get("inventory", [])


func add_to_inventory(item: Dictionary) -> bool:
	data["inventory"].append(item)
	save()
	return true


func remove_from_inventory(index: int) -> bool:
	if index < 0 or index >= data["inventory"].size():
		return false
	data["inventory"].remove_at(index)
	save()
	return true


func get_inventory_size() -> int:
	return data["inventory"].size()


## ==================== WAREHOUSE ====================


func get_warehouse() -> Array:
	return data.get("warehouse", [])


func add_to_warehouse(item: Dictionary) -> bool:
	data["warehouse"].append(item)
	save()
	return true


func remove_from_warehouse(index: int) -> bool:
	if index < 0 or index >= data["warehouse"].size():
		return false
	data["warehouse"].remove_at(index)
	save()
	return true


func get_warehouse_size() -> int:
	return data["warehouse"].size()


## ==================== RESET ====================


## Reset semua data ke default
func reset_all() -> void:
	data = PlayerData.DEFAULT_DATA.duplicate(true)
	save()
	print("[PlayerManager] All data reset")
