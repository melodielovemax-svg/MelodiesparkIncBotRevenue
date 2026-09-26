class_name StatusEffects

enum Effect { BURN, FREEZE, SHOCK, STUN, CORRUPTION }

static func label(effect: Effect) -> String:
	return ["Burn", "Freeze", "Shock", "Stun", "Corruption"][effect]
