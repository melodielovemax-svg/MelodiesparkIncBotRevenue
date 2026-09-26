class_name Hurtbox3D
extends Area3D

signal hit_received(packet: DamagePacket)

@export var health: float = 100.0
@export var max_health: float = 100.0
@export var poise: float = 100.0
@export var max_poise: float = 100.0
@export var armor: float = 0.0
@export var invulnerable: bool = false
@export var faction: StringName = &"enemy"

var dead := false

func receive_hit(packet: DamagePacket) -> Dictionary:
    if dead or invulnerable:
        return {"accepted": false, "damage": 0.0, "critical": false}

    var mitigated := _mitigate(packet.amount, packet.damage_type)
    health = maxf(0.0, health - mitigated)
    poise = maxf(0.0, poise - packet.poise_damage)

    packet.amount = mitigated
    hit_received.emit(packet)

    var broken := poise <= 0.0
    if broken:
        poise = max_poise

    if health <= 0.0:
        dead = true

    return {
        "accepted": true,
        "damage": mitigated,
        "critical": packet.critical,
        "poise_broken": broken,
        "dead": dead
    }

func _mitigate(raw: float, type: StringName) -> float:
    if type == &"physical":
        return raw * (100.0 / (100.0 + maxf(0.0, armor)))
    return raw
