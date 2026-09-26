#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "CombatComponent.h.generated.h"

UENUM(BlueprintType)
enum class ECombatEvent : uint8 { AttackRequest, HitValidated, DamageApplied, DeathState };

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class PATHOFMELODIE_API UCombatComponent : public UActorComponent {
    GENERATED_BODY()
public:
    UPROPERTY(BlueprintReadWrite) float Health = 100.0f;
    UPROPERTY(BlueprintReadWrite) float MaxHealth = 100.0f;
    UPROPERTY(BlueprintReadWrite) float Resistance = 0.1f;

    UFUNCTION(BlueprintCallable)
    void RequestAttack(AActor* Target, float BaseDamage);

    UFUNCTION(BlueprintCallable)
    void ApplyDamage(float RawDamage);

    bool IsDead() const { return Health <= 0.0f; }
};
