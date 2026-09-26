class_name CombatHurtbox3D
extends Area3D

const Packet = preload("res://scripts/combat/damage_packet.gd")

signal hit_received(packet)

@export var health := 100.0
@export var max_health := 100.0
@export var poise := 100.0
@export var max_poise := 100.0
@export var armor := 0.0
@export var faction: StringName = &"enemy"
var dead := false

func receive_hit(packet) -> Dictionary:
	if dead:
		return {"accepted": false, "damage": 0.0, "poise_broken": false, "dead": true}
	var mitigated: float = packet.amount * (100.0 / (100.0 + maxf(0.0, armor))) if packet.damage_type == &"physical" else packet.amount
	health = maxf(0.0, health - mitigated)
	poise = maxf(0.0, poise - packet.poise_damage)
	packet.amount = mitigated
	hit_received.emit(packet)
	var broken := poise <= 0.0
	if broken:
		poise = max_poise
	dead = health <= 0.0
	return {"accepted": true, "damage": mitigated, "poise_broken": broken, "dead": dead}
