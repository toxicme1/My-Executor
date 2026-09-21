import {
  lauxlib,
  lua,
  lualib,
  to_luastring,
  to_jsstring
} from "fengari";

export interface RunResult {
  ok: boolean;
  output: string;
  error?: string;
}

const MAX_SOURCE_LENGTH = 100_000;
const MAX_OUTPUT_LENGTH = 20_000;

export function runScript(source: string): RunResult {
  if (source.length > MAX_SOURCE_LENGTH) {
    return { ok: false, output: "", error: "Script is too large." };
  }

  const output: string[] = [];
  const state = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(state);

  // Remove libraries that would make the test runtime access the host.
  for (const library of ["io", "os", "debug", "package"]) {
    lua.lua_pushnil(state);
    lua.lua_setglobal(state, to_luastring(library));
  }

  const printFunction = (_state: unknown): number => {
    const count = lua.lua_gettop(state);
    const values: string[] = [];
    for (let index = 1; index <= count; index += 1) {
      const value = lua.lua_tostring(state, index);
      values.push(value === undefined ? "<value>" : to_jsstring(value));
    }
    output.push(values.join("\t").slice(0, MAX_OUTPUT_LENGTH));
    lua.lua_settop(state, 0);
    return 0;
  };

  lua.lua_pushjsfunction(state, printFunction);
  lua.lua_setglobal(state, to_luastring("print"));

  lua.lua_pushjsfunction(state, (currentState: any) => {
    lua.lua_createtable(currentState, 0, 2);
    lua.lua_pushstring(currentState, to_luastring("TestPlayer"));
    lua.lua_setfield(currentState, -2, to_luastring("name"));
    lua.lua_pushinteger(currentState, 1);
    lua.lua_setfield(currentState, -2, to_luastring("id"));
    return 1;
  });
  lua.lua_setglobal(state, to_luastring("get_local_player"));

  lua.lua_pushjsfunction(state, (currentState: any) => {
    const name = to_jsstring(lua.lua_tostring(currentState, 1));
    output.push(`[engine] spawned ${name}`);
    return 0;
  });
  lua.lua_setglobal(state, to_luastring("spawn_entity"));

  const status = lauxlib.luaL_loadstring(state, to_luastring(source));
  if (status !== lua.LUA_OK) {
    return { ok: false, output: output.join("\n"), error: readError(state) };
  }

  const callStatus = lua.lua_pcall(state, 0, lua.LUA_MULTRET, 0);
  if (callStatus !== lua.LUA_OK) {
    return { ok: false, output: output.join("\n"), error: readError(state) };
  }

  return { ok: true, output: output.join("\n") || "Script completed successfully." };
}

function readError(state: unknown): string {
  try {
    return to_jsstring(lua.lua_tostring(state, -1));
  } catch {
    return "Script failed.";
  }
}
