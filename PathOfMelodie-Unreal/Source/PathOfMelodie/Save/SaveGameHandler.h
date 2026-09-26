#pragma once
#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "SaveGameHandler.h.generated.h"

UCLASS()
class PATHOFMELODIE_API USaveGameHandler : public USaveGame {
    GENERATED_BODY()
public:
    UPROPERTY() FString PlayerName;
    UPROPERTY() int32 CurrentAct = 1;
    UPROPERTY() float TotalSoulCollected = 0.0f;
    UPROPERTY() TArray<FString> InventoryItems;
    UPROPERTY() int32 CurrentLevel = 1;
};
