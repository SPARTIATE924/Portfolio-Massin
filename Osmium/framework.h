#pragma once

#define WIN32_LEAN_AND_MEAN
#define _CRT_SECURE_NO_WARNINGS
#define CPPHTTPLIB_OPENSSL_SUPPORT

#pragma warning (disable : 4309)

#include <vector>
#include <fstream>
#include <iostream>
#include <regex>
#include <locale>
#include <winscard.h>

#include <dxgi.h>
#include <d3d11.h>
#include <Psapi.h>
#include <stdlib.h>
#include <Windows.h>
#include <detours.h>

#include "SDK.hpp"
#include "json.hpp"

#include "util.h"
#include "enums.h"
#include "httplib.h"
#include "constants.h"

using namespace SDK;