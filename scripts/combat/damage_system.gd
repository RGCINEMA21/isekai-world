## DamageSystem - Perhitungan damage sederhana
class_name DamageSystem

static func calculate_damage(attacker_attack: int, defender_defense: int) -> int:
	var base_damage: int = attacker_attack - defender_defense
	return maxi(base_damage, 1)

static func is_critical(base_damage: int, crit_rate: float) -> bool:
	return randf() * 100.0 < crit_rate

static func apply_critical(base_damage: int, crit_damage: float) -> int:
	return int(base_damage * crit_damage / 100.0)
