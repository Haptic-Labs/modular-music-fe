import { Database } from "../../types";
import { ModuleSourcesRequest } from "./use-module-sources";
import { UserModulesRequest } from "./use-user-modules";

export const modulesQueryKeys = {
  userModules: (request: UserModulesRequest) => ["user-modules", request],
  moduleSources: (request: ModuleSourcesRequest) => ["module-sources", request],
};

export const modulesMutationKeys = {
  addModuleSource: (
    type?: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"],
  ) => (type ? ["module-sources", "add", type] : ["module-sources", "add"]),
  removeModuleSource: ["module-sources", "remove"],
};
