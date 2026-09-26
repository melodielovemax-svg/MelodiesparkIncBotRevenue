class_name AscensionRuntime
extends RefCounted

signal ascension_rank_changed(new_rank: String, legacy_points: int)
signal phoenix_form_activated(branch: String, duration: float)
signal phoenix_form_expired()

# The 7 Ascendant Ranks:
const RANKS := [
	"Soulborn",
	"Awakened",
	"Guardian",
	"Seraph",
	"Arc-Angel",
	"Phoenix",
	"Phoenix Eternal"
]

# The 5 Phoenix Branches:
const BRANCHES := {
	"Fire": {"name": "Phoenix of Fire", "bonus_damage": 0.50, "burn_infusion": true, "desc": "All attacks ignite targets and detonate in blazing shockwaves."},
	"Souls": {"name": "Phoenix of Souls", "bonus_damage": 0.35, "soul_drain": true, "desc": "Reaps soul echoes, regenerating health and ability cooldowns."},
	"Time": {"name": "Phoenix of Time", "bonus_damage": 0.30, "cooldown_accel": 0.50, "desc": "Bends temporal flow, doubling attack and movement speed."},
	"Void": {"name": "Phoenix of Void", "bonus_damage": 0.45, "rift_shatter": true, "desc": "Attacks open gravitational voids that pull enemies together."},
	"Harmony": {"name": "Phoenix of Harmony", "bonus_damage": 0.35, "poise_immune": true, "desc": "Total poise immunity, aura pulse cleansing and karma surge."}
}

var current_rank_index: int = 0
var active_branch: String = "Fire"
var is_ascended: bool = false
var form_duration: float = 12.0
var form_timer: float = 0.0
var legacy_points: int = 0
var total_ascensions_count: int = 0

func get_current_rank() -> String:
	return RANKS[current_rank_index]

func can_ascend_rank() -> bool:
	return current_rank_index < RANKS.size() - 1

func ascend_next_rank() -> bool:
	if not can_ascend_rank():
		return false
	current_rank_index += 1
	legacy_points += (current_rank_index * 100)
	ascension_rank_changed.emit(get_current_rank(), legacy_points)
	return true

func select_branch(branch_name: String) -> void:
	if BRANCHES.has(branch_name):
		active_branch = branch_name

func trigger_phoenix_ascension(base_duration_bonus: float = 0.0) -> bool:
	if is_ascended:
		return false
	is_ascended = true
	form_timer = form_duration + base_duration_bonus
	total_ascensions_count += 1
	phoenix_form_activated.emit(active_branch, form_timer)
	return true

func tick(delta: float) -> void:
	if is_ascended:
		form_timer -= delta
		if form_timer <= 0.0:
			is_ascended = false
			phoenix_form_expired.emit()

func get_ascension_multipliers() -> Dictionary:
	var rank_multiplier: float = 1.0 + (float(current_rank_index) * 0.10)
	var branch_info: Dictionary = BRANCHES.get(active_branch, BRANCHES["Fire"])
	var form_damage_bonus: float = branch_info.bonus_damage if is_ascended else 0.0

	return {
		"is_active": is_ascended,
		"rank": get_current_rank(),
		"rank_index": current_rank_index,
		"branch": branch_info.name,
		"damage_multiplier": rank_multiplier * (1.0 + form_damage_bonus),
		"poise_immune": is_ascended and branch_info.get("poise_immune", false),
		"cooldown_accel": branch_info.get("cooldown_accel", 0.0) if is_ascended else 0.0
	}
