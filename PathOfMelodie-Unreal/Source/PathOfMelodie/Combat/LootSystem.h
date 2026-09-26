#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "LootSystem.h.generated.h"

UENUM(BlueprintType)
enum class ELootRarity : uint8 { Common, Rare, Epic, Unique };

USTRUCT(BlueprintType)
struct FItemAffix {
    GENERATED_BODY()
    UPROPERTY(BlueprintReadWrite) FString StatName;
    UPROPERTY(BlueprintReadWrite) float Value;
};

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class PATHOFMELODIE_API ULootSystem : public UActorComponent {
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintCallable)
    void GenerateDrop(ELootRarity Rarity);

    TArray<FItemAffix> GenerateAffixes(ELootRarity Rarity);
};
