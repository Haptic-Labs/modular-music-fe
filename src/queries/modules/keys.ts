import { Database } from '../../types';
import { CombineActionSourcesRequest } from './use-combine-action-sources';
import { FilterActionSourcesRequest } from './use-filter-action-sources';
import { UseLimitConfigQueryRequest } from './use-limit-config-query';
import { ModuleActionsRequest } from './use-module-actions';
import { UseModuleOutputsQueryRequest } from './use-module-outputs';
import { ModuleSourcesRequest } from './use-module-sources';
import {
  UseMultipleRecentlyListenedConfigsRequest,
  UseRecentlyListenedConfigRequest,
} from './use-recently-listened-config';
import { UserModulesRequest } from './use-user-modules';

export const modulesQueryKeys = {
  userModules: (request?: UserModulesRequest) => {
    const key: (string | UserModulesRequest)[] = ['user-modules'];
    if (request) {
      key.push(request);
    }
    return key;
  },
  moduleSources: (request?: ModuleSourcesRequest) => {
    const key: (string | ModuleSourcesRequest)[] = ['module-sources'];
    if (request) {
      key.push(request);
    }
    return key;
  },
  moduleActions: (request?: ModuleActionsRequest) => {
    const key: (string | ModuleActionsRequest)[] = ['module-actions'];
    if (request) {
      key.push(request);
    }
    return key;
  },
  recentlyListenedConfig: (request?: UseRecentlyListenedConfigRequest) => {
    const key: (string | UseRecentlyListenedConfigRequest)[] = [
      'recently-listened-config',
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
      'multiple-recently-listened-config',
    ];
    if (request) {
      key.push(request);
    }
    return key;
  },
  filterActionSources: (request?: FilterActionSourcesRequest) => {
    const baseKey = ['filter-action-sources'] as const;
    if (request) return [...baseKey, request] as const;
    return baseKey;
  },
  moduleOutputs: (request?: UseModuleOutputsQueryRequest) => {
    const baseKey = ['module-outputs'] as const;
    if (request) return [...baseKey, request] as const;
    return baseKey;
  },
  limitConfig: (request?: UseLimitConfigQueryRequest) => {
    const baseKey = ['limit-config'] as const;
    if (request) return [...baseKey, request] as const;
    return baseKey;
  },
  combineActionSources: (request?: CombineActionSourcesRequest) => {
    const baseKey = ['combine-action-sources'] as const;
    if (request) return [...baseKey, request] as const;
    return baseKey;
  },
};

export const modulesMutationKeys = {
  addModuleSource: (
    type?: Database['public']['Enums']['SPOTIFY_SOURCE_TYPE'],
  ) => (type ? ['module-sources', 'add', type] : ['module-sources', 'add']),
  removeModuleSource: ['module-sources', 'remove'],
  addModuleAction: (
    type?: Database['public']['Enums']['MODULE_ACTION_TYPE'],
  ) => (type ? ['module-actions', 'add', type] : ['module-actions', 'add']),
  removeModuleAction: ['module-actions', 'remove'],
  addFilterSources: ['filter-sources', 'add'],
  addRecentlyListenedConfigs: ['recently-listened-configs', 'add'],
  addModule: ['module', 'add'],
  reorderModuleActions: ['module-actions', 'reorder'],
  addModuleOutput: ['module-outputs', 'add'],
  removeModuleOutput: ['module-outputs', 'remove'],
  replaceModuleSources: ['module-sources', 'replace'],
};
