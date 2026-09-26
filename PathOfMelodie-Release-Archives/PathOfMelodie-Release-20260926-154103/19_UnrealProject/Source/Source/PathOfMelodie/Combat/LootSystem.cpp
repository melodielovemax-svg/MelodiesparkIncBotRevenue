#include "LootSystem.h"

void ULootSystem::GenerateDrop(ELootRarity Rarity) {
    TArray<FItemAffix> Affixes = GenerateAffixes(Rarity);
    UE_LOG(LogTemp, Warning, TEXT("Loot Dropped! Rarity: %d, Affixes: %d"), (int32)Rarity, Affixes.Num());
}
TArray<FItemAffix> ULootSystem::GenerateAffixes(ELootRarity Rarity) {
    TArray<FItemAffix> Results;
    int32 Count = (int32)Rarity + 1;
    for(int32 i=0; i < Count; i++) {
        Results.Add(FItemAffix{"Power", FMath::RandRange(1, 10)});
    }
    return Results;
}
