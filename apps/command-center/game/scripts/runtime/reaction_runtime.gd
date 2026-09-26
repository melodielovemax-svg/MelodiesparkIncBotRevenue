class_name ReactionRuntime
extends RefCounted

signal reaction_triggered(reaction_type: String, target: Node, bonus_damage: int, description: String)

# Master Elemental Reactions from Specification:
# 1. Fire + Ice          -> thermal_break
# 2. Lightning + Water   -> electrified
# 3. Fire + Corruption   -> soulfire
# 4. Ice + Soul          -> frozen_soul
# 5. Phoenix + Fire      -> infernal_ascension

const REACTION_TABLE := {
	"fire+ice": {"id": "thermal_break", "name": "Thermal Break", "multiplier": 2.2, "shatter_bonus": 35, "desc": "Extreme thermal shock shatters target poise and armor."},
	"lightning+water": {"id": "electrified", "name": "Electrified", "multiplier": 1.8, "shatter_bonus": 20, "desc": "Chain lightning stun arcs to adjacent targets."},
	"fire+corruption": {"id": "soulfire", "name": "Soulfire", "multiplier": 2.0, "shatter_bonus": 25, "desc": "Dark inferno deals dense DoT and drains poise continuously."},
	"ice+soul": {"id": "frozen_soul", "name": "Frozen Soul", "multiplier": 1.9, "shatter_bonus": 30, "desc": "Target's soul is crystallized, fracturing on heavy impact."},
	"phoenix+fire": {"id": "infernal_ascension", "name": "Infernal Ascension", "multiplier": 2.8, "shatter_bonus": 50, "desc": "Cataclysmic blaze replenishes Phoenix meter and detonates AoE."}
}

static func check_reaction(elem_a: String, elem_b: String) -> Dictionary:
	var key_1 := "%s+%s" % [elem_a.to_lower(), elem_b.to_lower()]
	var key_2 := "%s+%s" % [elem_b.to_lower(), elem_a.to_lower()]
	if REACTION_TABLE.has(key_1):
		return REACTION_TABLE[key_1]
	if REACTION_TABLE.has(key_2):
		return REACTION_TABLE[key_2]
	return {}

func process_reaction(applied_elem: String, active_elements: Array, base_damage: int, target: Node) -> Dictionary:
	for active in active_elements:
		var react := check_reaction(applied_elem, active)
		if not react.is_empty():
			var bonus := int(float(base_damage) * float(react.get("multiplier", 1.5)))
			reaction_triggered.emit(react.id, target, bonus, react.desc)
			return {
				"triggered": true,
				"reaction": react,
				"bonus_damage": bonus,
				"shatter_bonus": react.get("shatter_bonus", 20),
				"consumed_element": active
			}
	return {"triggered": false, "bonus_damage": 0, "shatter_bonus": 0}
