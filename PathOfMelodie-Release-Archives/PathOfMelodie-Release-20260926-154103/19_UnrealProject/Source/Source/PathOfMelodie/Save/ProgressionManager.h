#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ProgressionManager.h.generated.h"

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class PATHOFMELODIE_API UProgressionManager : public UActorComponent {
    GENERATED_BODY()
public:
    UPROPERTY(BlueprintReadWrite) int32 KarmaPoints = 0;
    UPROPERTY(BlueprintReadWrite) int32 PowerPoints = 0;
    UPROPERTY(BlueprintReadWrite) int32 PlayerLevel = 1;

    UFUNCTION(BlueprintCallable)
    void AddExperience(float Amount);

    UFUNCTION(BlueprintCallable)
    void SpendPowerPoint(FString AbilityID);

    void OnLevelUp();
};
