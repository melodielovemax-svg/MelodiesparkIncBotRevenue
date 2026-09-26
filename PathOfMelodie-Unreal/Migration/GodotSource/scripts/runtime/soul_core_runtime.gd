class_name SoulCoreRuntime
extends RefCounted

signal node_upgraded(pillar: String, new_level: int, stats: Dictionary)

# The 5 Core Pillars:
# POWER: Attack multiplier, poise impact
# SOUL: Maximum essence, cooldown reduction
# MELODIE: Elemental reaction bonus, aura radius
# KARMA: Community rank sync, defensive ward
# ASCENSION: Phoenix gauge gain, Ascension duration bonus

var pillars: Dictionary = {
	"POWER": 1,
	"SOUL": 1,
	"MELODIE": 1,
	"KARMA": 1,
	"ASCENSION": 1
}

const MAX_PILLAR_LEVEL := 50

func upgrade_pillar(pillar: String, cost_callback: Callable = Callable()) -> bool:
	var key := pillar.to_upper()
	if not pillars.has(key):
		return false
	if pillars[key] >= MAX_PILLAR_LEVEL:
		return false

	if cost_callback.is_valid() and not cost_callback.call(get_upgrade_cost(key)):
		return false

	pillars[key] += 1
	node_upgraded.emit(key, pillars[key], get_bonuses())
	return true

func get_upgrade_cost(pillar: String) -> int:
	var lvl: int = pillars.get(pillar.to_upper(), 1)
	return lvl * 150 # Soul Essence required

func get_bonuses() -> Dictionary:
	var power_lvl: int = pillars["POWER"]
	var soul_lvl: int = pillars["SOUL"]
	var melodie_lvl: int = pillars["MELODIE"]
	var karma_lvl: int = pillars["KARMA"]
	var ascension_lvl: int = pillars["ASCENSION"]

	return {
		"damage_multiplier": 1.0 + (float(power_lvl - 1) * 0.04),
		"poise_bonus": (power_lvl - 1) * 3,
		"cooldown_reduction": minf(0.40, float(soul_lvl - 1) * 0.015),
		"max_mana_bonus": (soul_lvl - 1) * 20,
		"reaction_damage_multiplier": 1.0 + (float(melodie_lvl - 1) * 0.05),
		"aura_radius_bonus": float(melodie_lvl - 1) * 0.25,
		"defense_multiplier": 1.0 + (float(karma_lvl - 1) * 0.02),
		"karma_bonus_rate": 1.0 + (float(karma_lvl - 1) * 0.05),
		"phoenix_gain_multiplier": 1.0 + (float(ascension_lvl - 1) * 0.06),
		"ascension_duration_bonus": float(ascension_lvl - 1) * 0.4
	}

func serialize() -> Dictionary:
	return pillars.duplicate()

func deserialize(data: Dictionary) -> void:
	for k in pillars.keys():
		if data.has(k):
			pillars[k] = clampi(int(data[k]), 1, MAX_PILLAR_LEVEL)
