#pragma once
#include "framework.h"

#define VALIDATE_ADDRESS(address, error) \
    if (!address) { \
        MessageBoxA(0, error, "Osmium", MB_OK); \
        FreeLibraryAndExitThread(GetModuleHandle(NULL), 0); \
        return; \
    }

namespace osmium
{
	class Util 
	{
	private:
		static __forceinline BOOL MaskCompare(PVOID pBuffer, LPCSTR lpPattern, LPCSTR lpMask)
		{
			for (auto val = static_cast<PBYTE>(pBuffer); *lpMask; ++lpPattern, ++lpMask, ++val) 
				if (*lpMask == 'x' && *reinterpret_cast<LPCBYTE>(lpPattern) != *val) 
					return false;

			return true;
		}

		static __forceinline PBYTE FindPattern(PVOID pBase, DWORD dwSize, LPCSTR lpPattern, LPCSTR lpMask)
		{
			dwSize -= static_cast<DWORD>(strlen(lpMask));

			for (auto i = 0UL; i < dwSize; ++i) 
			{
				auto pAddr = static_cast<PBYTE>(pBase) + i;
				if (MaskCompare(pAddr, lpPattern, lpMask))
					return pAddr;
			}

			return NULL;
		}

	public:
		static __forceinline VOID InitConsole()
		{
			FILE* fDummy;
			AllocConsole();
			freopen_s(&fDummy, "CONIN$", "r", stdin);
			freopen_s(&fDummy, "CONOUT$", "w", stderr);
			freopen_s(&fDummy, "CONOUT$", "w", stdout);
		}

		static __forceinline uintptr_t BaseAddress()
		{
			return reinterpret_cast<uintptr_t>(GetModuleHandle(0));
		}

		static __forceinline PBYTE FindPattern(LPCSTR lpPattern, LPCSTR lpMask)
		{
			// Grab module info, used for obtaining info like lpBaseOfDll and SizeOfImage.
			MODULEINFO info{};
			GetModuleInformation(GetCurrentProcess(), GetModuleHandle(0), &info, sizeof(info));

			// Spin-out until the address has been found.
			PBYTE pAddr = NULL;
			do
			{
				pAddr = FindPattern(info.lpBaseOfDll, info.SizeOfImage, lpPattern, lpMask);

				Sleep(200); // This could cause Fortnite to hang at startup.
			} 
			while (!pAddr);

			// After the spin-out has been completed, return the address!
			return pAddr;
		}
		
		static __forceinline std::wstring sString(std::wstring s, std::wstring delimiter)
		{
			size_t pos;
			std::wstring token;
			while ((pos = s.find(delimiter)) != std::string::npos)
			{
				token = s.substr(0, pos);
				return token;
			}
			return token;
		}
	};
}