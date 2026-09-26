class_name StatAggregator
extends RefCounted

# Aggregates the 9 layers of the character build:
# Archetype + Skills + Runes + Equipment + Affixes + Soul Core + Guardian + Karma + Ascension -> FinalBuildStats

static func aggregate(
	archetype: Dictionary,
	skills_list: Array,
	runes_list: Array,
	equipment_totals: Dictionary,
	soul_core_bonuses: Dictionary,
	guardian_buffs: Dictionary,
	karma_points: int,
	ascension_multipliers: Dictionary
) -> Dictionary:

	var base_hp := 500
	var base_damage := 45
	var base_defense := 20
	var base_poise := 100

	# 1. Soul Core Layer
	var sc_dmg_mult: float = soul_core_bonuses.get("damage_multiplier", 1.0)
	var sc_poise_bonus: int = soul_core_bonuses.get("poise_bonus", 0)
	var sc_cdr: float = soul_core_bonuses.get("cooldown_reduction", 0.0)

	# 2. Equipment & Affixes Layer
	var eq_dmg: int = equipment_totals.get("damage", 0)
	var eq_crit: int = equipment_totals.get("critical_chance", 0)
	var eq_shatter: int = equipment_totals.get("shatter_damage", 0)
	var eq_cdr: float = float(equipment_totals.get("cooldown_reduction", 0)) * 0.01

	# 3. Guardian & Arc-Angel Layer
	var guardian_dmg_mult: float = guardian_buffs.get("damage_buff", 1.0)
	var aura_radius: float = guardian_buffs.get("aura_radius", 5.0)

	# 4. Karma Layer (defensive ward & resonance)
	var karma_defense_bonus := int(float(karma_points) * 0.02)

	# 5. Ascension Layer
	var asc_dmg_mult: float = ascension_multipliers.get("damage_multiplier", 1.0)
	var is_ascended: bool = ascension_multipliers.get("is_active", false)
	var poise_immune: bool = ascension_multipliers.get("poise_immune", false)

	# Compute Final Aggregated Stats
	var total_damage := int(float(base_damage + eq_dmg) * sc_dmg_mult * guardian_dmg_mult * asc_dmg_mult)
	var total_defense := base_defense + karma_defense_bonus
	var total_poise := base_poise + sc_poise_bonus
	var final_cdr := minf(0.60, sc_cdr + eq_cdr + ascension_multipliers.get("cooldown_accel", 0.0))

	return {
		"archetype_name": archetype.get("name", "Phoenix Warrior"),
		"max_health": base_hp + (karma_points * 2),
		"attack_power": total_damage,
		"defense": total_defense,
		"max_poise": total_poise,
		"critical_chance_percent": 5 + eq_crit,
		"shatter_damage_bonus": eq_shatter,
		"cooldown_reduction_percent": int(final_cdr * 100),
		"aura_radius": aura_radius,
		"is_ascended": is_ascended,
		"poise_immune": poise_immune,
		"active_skills_count": skills_list.size(),
		"active_runes_count": runes_list.size(),
		"guardian_arc_angel": guardian_buffs.get("arc_angel", false)
	}
