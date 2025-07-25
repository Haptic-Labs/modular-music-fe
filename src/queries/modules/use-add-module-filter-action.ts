import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, LimitedMutationOptions } from '../../types';
import { useAuth } from '../../providers';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { ModuleActionsResponse } from './use-module-actions';
import { arrayUpsert } from '../../utils';
import { removeNullishFromObject } from '../../utils/remove-nullish-from-object';

type AddFilterActionRequest =
  Database['public']['Functions']['UpsertModuleActionFilter']['Args'];
type AddFilterActionResponse =
  Database['public']['Functions']['UpsertModuleActionFilter']['Returns'];

export const useAddModuleFilterActionMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    AddFilterActionResponse,
    E,
    AddFilterActionRequest,
    C
  >,
) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuth();

  return useMutation({
    mutationKey: modulesMutationKeys.addModuleAction('FILTER'),
    mutationFn: async (req) => {
      const query = supabaseClient
        .schema('public')
        .rpc('UpsertModuleActionFilter', req)
        .throwOnError();

      const { data: res } = await query;

      if (!res) throw new Error('Error adding new filter action');

      return res;
    },
    ...options,
    onSuccess: (res, ...rest) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sources: _, ...action } = res;
      const filteredAction = removeNullishFromObject(action);

      if (!filteredAction.module_id) return options?.onSuccess?.(res, ...rest);

      const key = modulesQueryKeys.moduleActions({
        moduleId: filteredAction.module_id,
      });

      queryClient.setQueriesData<ModuleActionsResponse>(
        {
          queryKey: key,
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
    },
  });
};
