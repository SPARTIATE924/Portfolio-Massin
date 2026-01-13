#pragma once
#include "World.h"

inline osmium::World* osWorld;
inline EWorldStatus osWorldStatus;

inline UEngine* GEngine;
inline UObject* (*StaticConstructObject)(
	UClass* Class,
	UObject* InOuter,
	void* Name,
	int SetFlags,
	unsigned int InternalSetFlags,
	UObject* Template,
	bool bCopyTransientsFromClassDefaults,
	void* InstanceGraph,
	bool bAssumeTemplateIsArchetype
	);


#define UE4_CONSOLE_LOG(s) reinterpret_cast<AGameMode*>(GEngine->GameViewport->World->AuthorityGameMode)->Say(FString(s));