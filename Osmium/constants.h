#pragma once

namespace Patterns
{
	namespace cURL
	{
		constexpr const char* cURLEasySetOpt = "\x89\x54\x24\x10\x4C\x89\x44\x24\x18\x4C\x89\x4C\x24\x20\x48\x83\xEC\x28\x48\x85\xC9\x75\x08\x8D\x41\x2B\x48\x83\xC4\x28\xC3\x4C";
		constexpr const char* cURLSetOpt = "\x48\x89\x5C\x24\x08\x48\x89\x6C\x24\x10\x48\x89\x74\x24\x18\x57\x48\x83\xEC\x30\x33\xED\x49\x8B\xF0\x48\x8B\xD9";
	}

	namespace bGlobal
	{
		constexpr const char* AbilityPatch = "\xC0\x0F\x84\x00\x02\x00\x00\x0F\x2F\xF7\x0F\x86\x00\x00\x00\x00";
	}
}

namespace Masks
{
	namespace cURL
	{
		constexpr const char* cURLEasySetOpt = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
		constexpr const char* cURLSetOpt = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx";
	}

	namespace bGlobal
	{
		constexpr const char* AbilityPatch = "xxx?xxxxxxxx??xx";
	}
}

namespace Strings
{
	namespace Maps
	{
		constexpr const wchar_t* Frontend = L"Frontend?game=/Script/FortniteGame.FortGameModeFrontEnd";
		constexpr const wchar_t* AthenaTerrain = L"Athena_Terrain?game=/Game/Athena/Athena_GameMode.Athena_GameMode_C";
	}

	namespace cURL
	{
		//constexpr const char* HostURL = "http://localhost:5595";
		constexpr const char* HostURL = "https://aurora-staging-api-2.slushia.dev";
	}
}

namespace Offsets
{
	constexpr const auto UEngineOffset = 0x4FC15D8;
	constexpr const auto ProcessEventOffset = 0x158FB20;
	constexpr const auto StaticConstructObjectOffset = 0x15B5410;
}
