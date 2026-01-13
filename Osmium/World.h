#pragma once
#include "framework.h"

namespace osmium
{
	class World
	{
	public:
		bool bHasJumped = false;

		AFortPlayerPawn* osFortPlayerPawn;
		AFortPlayerPawnAthena* osAthenaPlayerPawn;

		UFortAnimInstance* osFortAnimInstance;

		UFortWeaponMeleeItemDefinition* osPickaxe;

		APlayerController* osPlayerController;
		AFortPlayerController* osFortPlayerController;
		AFortPlayerControllerAthena* osFortPlayerControllerAthena;

		World();
		~World();

		static TArray<AActor*> FindActors(UClass* pClass);

		void Spawn();
		void Respawn();
		void Tick();
		void EquipPickaxe();
	};
}