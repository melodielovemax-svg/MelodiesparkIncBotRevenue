#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "GuardianManager.h.generated.h"

UENUM(BlueprintType)
enum class EGuardianType : uint8 { SoulSentry, VoidStalker, PhoenixHerald };

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class PATHOFMELODIE_API UGuardianManager : public UActorComponent {
    GENERATED_BODY()
public:
    UPROPERTY(BlueprintReadWrite) int32 ActiveGuardians = 0;
    UPROPERTY(BlueprintReadWrite) int32 MaxGuardians = 3;

    UFUNCTION(BlueprintCallable)
    bool SummonGuardian(EGuardianType Type, FVector Location);

    UFUNCTION(BlueprintCallable)
    void CommandGuardians(FVector TargetLocation);

    void OnGuardianDeath();
};
