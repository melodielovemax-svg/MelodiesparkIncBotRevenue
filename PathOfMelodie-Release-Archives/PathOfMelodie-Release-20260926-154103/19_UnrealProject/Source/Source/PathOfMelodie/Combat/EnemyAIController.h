#pragma once
#include "CoreMinimal.h"
#include "AIController.h"
#include "EnemyAIController.h.generated.h"

UENUM(BlueprintType)
enum class EAIState : uint8 { Idle, Aggro, Chasing, Attacking, Dead };

UCLASS()
class PATHOFMELODIE_API AEnemyAIController : public AAIController {
    GENERATED_BODY()
public:
    EAIState CurrentState = EAIState::Idle;
    float DetectionRadius = 1000.0f;
    float AttackRange = 200.0f;
    float AttackCooldown = 2.0f;

    void UpdateState(AActor* Player);
    void ExecuteBehavior();
};
