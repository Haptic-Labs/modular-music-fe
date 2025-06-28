import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, LimitedMutationOptions } from '../../types';
import { useAuth } from '../../providers';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { ModuleActionsResponse } from './use-module-actions';
import { arrayUpsert } from '../../utils';
import { removeNullishFromObject } from '../../utils/remove-nullish-from-object';
import { UseLimitConfigQueryResponse } from './use-limit-config-query';

type UpsertLimitActionRequest =
  Database['public']['Functions']['UpsertModuleActionLimit']['Args'];
type UpsertLimitActionResponse =
  Database['public']['Functions']['UpsertModuleActionLimit']['Returns'];

export const useUpsertModuleLimitActionMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    UpsertLimitActionResponse,
    E,
    UpsertLimitActionRequest,
    C
  >,
) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuth();

  return useMutation({
    mutationKey: modulesMutationKeys.addModuleAction('LIMIT'),
    mutationFn: async (req) => {
      const query = supabaseClient
        .schema('public')
        .rpc('UpsertModuleActionLimit', req)
        .throwOnError();

      const { data: res } = await query;

      if (!res) throw new Error('Error upserting limit action');

      return res;
    },
    ...options,
    onSuccess: (res, ...rest) => {
      const { config, ...action } = res;
      const filteredAction = removeNullishFromObject(action);

      if (!filteredAction.module_id) return options?.onSuccess?.(res, ...rest);

      queryClient.setQueriesData<ModuleActionsResponse>(
        {
          queryKey: modulesQueryKeys.moduleActions({
            moduleId: filteredAction.module_id,
          }),
          exact: false,
        },
        (data) => {
          if (!data) return data;

          return arrayUpsert(
            data,
            (existingAction) => ({ ...existingAction, ...filteredAction }),
            (existingAction) => existingAction.id === action.id,
          );
        },
      );

      if (filteredAction.id && !!config) {
        queryClient.setQueriesData<UseLimitConfigQueryResponse>(
          {
            queryKey: modulesQueryKeys.limitConfig({
              actionId: filteredAction.id,
            }),
            exact: true,
          },
          (data) => {
            if (!data) return data;

            return {
              id: config?.id ?? data.id,
              created_at: config?.created_at ?? data.created_at,
              updated_at: config?.updated_at,
              limit: config?.limit ?? data.limit,
              type: config?.type ?? data.type,
              deleted_at: config?.deleted_at,
            };
          },
        );
      }
    },
  });
};
