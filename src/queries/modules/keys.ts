import { Database } from "../../types";
import { ModuleActionsRequest } from "./use-module-actions";
import { ModuleSourcesRequest } from "./use-module-sources";
import {
  UseMultipleRecentlyListenedConfigsRequest,
  UseRecentlyListenedConfigRequest,
} from "./use-recently-listened-config";
import { UserModulesRequest } from "./use-user-modules";

export const modulesQueryKeys = {
  userModules: (request?: UserModulesRequest) => {
    const key: (string | UserModulesRequest)[] = ["user-modules"];
    if (request) {
      key.push(request);
    }
    return key;
  },
  moduleSources: (request?: ModuleSourcesRequest) => {
    const key: (string | ModuleSourcesRequest)[] = ["module-sources"];
    if (request) {
      key.push(request);
    }
    return key;
  },
  moduleActions: (request?: ModuleActionsRequest) => {
    const key: (string | ModuleActionsRequest)[] = ["module-actions"];
    if (request) {
      key.push(request);
    }
    return key;
  },
  recentlyListenedConfig: (request?: UseRecentlyListenedConfigRequest) => {
    const key: (string | UseRecentlyListenedConfigRequest)[] = [
      "recently-listened-config",
    ];
    if (request) {
      key.push(request);
    }
    return key;
  },
  multipleRecentlyListenedConfigs: (
    request?: UseMultipleRecentlyListenedConfigsRequest,
  ) => {
    const key: (string | UseMultipleRecentlyListenedConfigsRequest)[] = [
      "recently-listened-config",
    ];
    if (request) {
      key.push(request);
    }
    return key;
  },
};

export const modulesMutationKeys = {
  addModuleSource: (
    type?: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"],
  ) => (type ? ["module-sources", "add", type] : ["module-sources", "add"]),
  removeModuleSource: ["module-sources", "remove"],
};
