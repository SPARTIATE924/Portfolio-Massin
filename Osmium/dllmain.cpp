#include "curl.h"
#include "World.h"
#include "native.h"
#include "globals.h"
#include "framework.h"

void WINAPI dllMain()
{
	Util::InitConsole();

	printf("LogOsmium: Init!\n");

	cURL* cURLHook = new cURL;

	while (true)
	{
		if (osWorldStatus == EWorldStatus::InLobby)
		{
			Native::Init();
			printf("LogOsmium: Player in lobby, ready to start\n");
			break;
		}
		
		// Run the thread at 30 frames a second.
		Sleep(1000 / 30);
	}
}

BOOL APIENTRY DllMain(HMODULE hModule, DWORD dwReason, LPVOID lpReserved)
{
	switch (dwReason)
	{
		case DLL_PROCESS_ATTACH:
			CreateThread(nullptr, 0, reinterpret_cast<LPTHREAD_START_ROUTINE>(&dllMain), nullptr, 0, nullptr);
			osWorldStatus = EWorldStatus::None;
			break;

		case DLL_PROCESS_DETACH:
			FreeLibraryAndExitThread(hModule, EXIT_SUCCESS);
			break;

		default:
			break;
	}

	return TRUE;
}