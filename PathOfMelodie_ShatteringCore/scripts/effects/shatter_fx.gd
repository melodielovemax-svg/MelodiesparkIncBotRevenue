class_name ShatterFX
extends Node3D

@export var lifetime := 0.55
@export var burst_scale := 1.0

func play_shatter(position: Vector3, normal: Vector3, strength: float = 1.0) -> void:
    global_position = position
    look_at(position + normal, Vector3.UP)
    scale = Vector3.ONE * maxf(0.1, strength) * burst_scale

    var particles := get_node_or_null("GPUParticles3D") as GPUParticles3D
    if particles:
        particles.restart()
        particles.emitting = true

    var timer := get_tree().create_timer(lifetime)
    timer.timeout.connect(queue_free)
