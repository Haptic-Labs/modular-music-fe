import { ModuleSourcesRequest } from "./use-module-sources";
import { UserModulesRequest } from "./use-user-modules";

export const modulesQueryKeys = {
  userModules: (request: UserModulesRequest) => ["user-modules", request],
  moduleSources: (request: ModuleSourcesRequest) => ["module-actions", request],
};
