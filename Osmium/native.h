#pragma once
#include "constants.h"
#include "framework.h"
#include "processevent.h"

using namespace osmium;

namespace Native
{
	/// <summary>
	/// Initializes CheatManager for the player.
	/// </summary>
	inline void InitCheatManager()
	{
		// Get the PlayerController from the GameInstances' LocalPlayers array.
		auto PlayerController = GEngine->GameViewport->GameInstance->LocalPlayers[0]->PlayerController;

		// Construct a CheatManager.
		UObject* CheatManager = StaticConstructObject(
			UCheatManager::StaticClass(),
			PlayerController,
			nullptr, 0, 0, nullptr,
			false, nullptr, false
		);

		// Assign the CheatManager to the PlayerController.
		PlayerController->CheatManager = static_cast<UCheatManager*>(CheatManager);

		printf("LogOsmium: Assigned constructed cheat manager to player controller\n");
	}

	/// <summary>
	/// Unlocks the console and initializes CheatManager for the player.
	/// </summary>
	inline void UnlockConsole()
	{
		// Construct a Console.
		UObject* Console = StaticConstructObject(
			GEngine->ConsoleClass,
			GEngine->GameViewport,
			nullptr, 0, 0, nullptr,
			false, nullptr, false
		);

		// Assign the constructed console to the GameViewports' ViewportConsole.
		GEngine->GameViewport->ViewportConsole = static_cast<UConsole*>(Console);

		printf("LogOsmium: Assigned constructed console to viewport console\n");

		// Initialize CheatManager for the player.
		InitCheatManager();
	}

	/// <summary>
	/// Initializes Osmium.
	/// </summary>
	inline void Init()
	{
		const auto ModuleBase = Util::BaseAddress();

		GEngine = *reinterpret_cast<UEngine**>(ModuleBase + Offsets::UEngineOffset);

		StaticConstructObject = decltype(StaticConstructObject)(ModuleBase + Offsets::StaticConstructObjectOffset);

		//Crash fix
		*reinterpret_cast<char*>(ModuleBase + 0xAEC475 + 0) = 0xE9;
		*reinterpret_cast<char*>(ModuleBase + 0xAEC475 + 1) = 0x39;
		*reinterpret_cast<char*>(ModuleBase + 0xAEC475 + 2) = 0x02;
		*reinterpret_cast<char*>(ModuleBase + 0xAEC475 + 3) = 0x00;
		*reinterpret_cast<char*>(ModuleBase + 0xAEC475 + 4) = 0x00;

		//Weapons patch
		const auto AbilityPatchAdd = Util::FindPattern(Patterns::bGlobal::AbilityPatch, Masks::bGlobal::AbilityPatch);
		VALIDATE_ADDRESS(AbilityPatchAdd, "Failed to find AbilityPatch Address.");

		reinterpret_cast<uint8_t*>(AbilityPatchAdd)[2] = 0x85;
		reinterpret_cast<uint8_t*>(AbilityPatchAdd)[11] = 0x8D;

		if (InitPEH()) UnlockConsole();
	}
}
