class_name EquipmentRuntime
extends RefCounted

signal equipment_changed()

const SLOTS := ["weapon", "helmet", "chest", "gloves", "boots", "amulet", "ring1", "ring2"]

var equipped_items: Dictionary = {}

func equip(slot: String, item: Variant) -> bool:
	if not SLOTS.has(slot):
		return false
	equipped_items[slot] = item
	equipment_changed.emit()
	return true

func unequip(slot: String) -> Variant:
	if not equipped_items.has(slot):
		return null
	var item = equipped_items[slot]
	equipped_items.erase(slot)
	equipment_changed.emit()
	return item

func get_item(slot: String) -> Variant:
	return equipped_items.get(slot, null)

func calculate_affix_totals() -> Dictionary:
	var totals: Dictionary = {
		"damage": 0,
		"attack_speed": 0,
		"critical_chance": 0,
		"fire_power": 0,
		"soul_power": 0,
		"phoenix_power": 0,
		"skill_level": 0,
		"shatter_damage": 0,
		"dodge_power": 0,
		"cooldown_reduction": 0
	}

	for slot in equipped_items.keys():
		var item = equipped_items[slot]
		if item and item.has_method("get") or item is Object:
			var affixes = item.get("affixes") if "affixes" in item else []
			if affixes is Array:
				for aff in affixes:
					var stat = aff.get("stat", "")
					if totals.has(stat):
						totals[stat] += 10 # Base affix roll bonus

	return totals
