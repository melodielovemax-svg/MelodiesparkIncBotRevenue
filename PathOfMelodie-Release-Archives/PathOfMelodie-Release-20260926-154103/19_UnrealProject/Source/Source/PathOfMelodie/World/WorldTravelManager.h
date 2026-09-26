#pragma once
#include "CoreMinimal.h"
#include "Blueprint/BlueprintFunctionLibrary.h"
#include "WorldTravelManager.h.generated.h"

UCLASS()
class PATHOFMELODIE_API UWorldTravelManager : public UBlueprintFunctionLibrary {
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintCallable, Category="WorldTravel")
    static void TransitionToAct(int32 ActNumber);
};
