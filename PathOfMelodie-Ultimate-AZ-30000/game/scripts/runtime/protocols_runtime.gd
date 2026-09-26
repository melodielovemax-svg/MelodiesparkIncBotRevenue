class_name ProtocolsRuntime
extends RefCounted

signal protocol_cleared(protocol_id: String, tier: int, reward_points: int)

# The 8 Endgame Maakaras Protocols:
const PROTOCOLS := [
	{"number": 1, "id": "protocol_world", "name": "Protocol I — World", "domain": "Infinite Veil", "desc": "Procedural labyrinth spanning shattered reality domains."},
	{"number": 2, "id": "protocol_soul", "name": "Protocol II — Soul", "domain": "Soul Realms", "desc": "Echo battles confronting memories of the First Soul."},
	{"number": 3, "id": "protocol_guardian", "name": "Protocol III — Guardian", "domain": "Arc-Angel Trials", "desc": "Consecutive trials testing Guardian poise and harmony."},
	{"number": 4, "id": "protocol_arc_angel", "name": "Protocol IV — Arc-Angel", "domain": "Celestial Spires", "desc": "Direct engagement with ascended Seraph champions."},
	{"number": 5, "id": "protocol_phoenix", "name": "Protocol V — Phoenix", "domain": "Phoenix Rifts", "desc": "Unstable thermal anomalies requiring elemental transmutation."},
	{"number": 6, "id": "protocol_void", "name": "Protocol VI — Void", "domain": "The Infinite Void", "desc": "Gravity-distorted abyssal rifts defying spatial geometry."},
	{"number": 7, "id": "protocol_eternal", "name": "Protocol VII — Eternal", "domain": "Legacy Sanctum", "desc": "Transcendence trials feeding into the permanent legacy nexus."},
	{"number": 8, "id": "protocol_maakaras", "name": "Protocol VIII — Maakaras", "domain": "Maakaras Core", "desc": "The ultimate protocol: stabilizing the Heart of the World."}
]

var active_protocol_tier: int = 1
var protocol_progress: Dictionary = {}

func _init() -> void:
	for p in PROTOCOLS:
		protocol_progress[p.id] = 0

func get_protocol(number: int) -> Dictionary:
	return PROTOCOLS[clampi(number - 1, 0, PROTOCOLS.size() - 1)]

func complete_protocol(protocol_id: String) -> Dictionary:
	if not protocol_progress.has(protocol_id):
		return {}

	protocol_progress[protocol_id] += 1
	var reward_points := active_protocol_tier * 250
	protocol_cleared.emit(protocol_id, active_protocol_tier, reward_points)
	return {
		"protocol_id": protocol_id,
		"tier": active_protocol_tier,
		"reward_points": reward_points,
		"new_clears": protocol_progress[protocol_id]
	}

func advance_difficulty_tier() -> void:
	active_protocol_tier += 1
