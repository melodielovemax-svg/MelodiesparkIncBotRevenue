class_name DamageSystem

enum Type { PHYSICAL, FIRE, ICE, LIGHTNING, SOUL, PHOENIX }

static func resolve(base: int, damage_type: Type, resistances: Dictionary, critical := false) -> int:
	var resistance := clampf(float(resistances.get(damage_type, 0.0)), -1.0, 0.9)
	var result := float(base) * (1.0 - resistance)
	if critical:
		result *= 1.5
	return maxi(1, roundi(result))
