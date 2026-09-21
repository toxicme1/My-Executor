# My Executor

This is a desktop script runner for a private game engine or test environment. It does not inject into other processes or interact with third-party games. The included runtime is Fengari (Lua-compatible); replace `src/runtime.ts` with a Luau runtime adapter when your engine is ready.

## Setup

1. Install Node.js 20 or newer.
2. Open PowerShell in this folder.
3. Run:

```powershell
npm install
npm start
```

## Build a Windows installer

Run:

```powershell
npm run dist
```

The installer will be created in the `release` folder. For an unpacked test build, use:

```powershell
npm run dist:dir
```

The editor currently exposes only a small test API:

```lua
local player = get_local_player()
print(player.name)
spawn_entity("TestCube")
```

`runtime.ts` is the integration point for replacing the test API with your own engine's allowlisted functions. Keep host access disabled and expose only APIs that are safe for scripts.
