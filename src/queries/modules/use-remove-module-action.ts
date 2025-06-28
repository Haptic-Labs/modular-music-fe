import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../providers";
import { Database, LimitedMutationOptions } from "../../types";
import { modulesMutationKeys, modulesQueryKeys } from "./keys";
import { ModuleActionsResponse } from "./use-module-actions";

export type UseRemoveModuleActionRequest =
  Database["public"]["Functions"]["RemoveModuleAction"]["Args"];

export type UseRemoveModuleActionResponse =
  Database["public"]["Functions"]["RemoveModuleAction"]["Returns"];

export const useRemoveModuleActionMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    UseRemoveModuleActionResponse,
    E,
    UseRemoveModuleActionRequest,
    C
  >,
) => {
  const { supabaseClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: modulesMutationKeys.removeModuleAction,
    mutationFn: async (request) => {
      const query = supabaseClient
        .rpc("RemoveModuleAction", request)
        .throwOnError();

      const { data: res } = await query;

      if (!res?.updated_actions)
        throw new Error("Error removing module action");

      return res;
    },
    ...options,
    onSuccess: (res, req, ...rest) => {
      if (!res.module_id) return options?.onSuccess?.(res, req, ...rest);
      const moduleId = res.updated_actions?.[0]?.module_id ?? res.module_id;

      // TODO: filter deleted action out too
      queryClient.setQueriesData<ModuleActionsResponse>(
        {
          queryKey: modulesQueryKeys.moduleActions({ moduleId }),
          exact: false,
        },
        (data) => {
          if (!data) return data;
          return data
            .filter((action) => action.id !== req.actionId)
            .map(
              (action) =>
                res.updated_actions?.find(({ id }) => id === action.id) ??
                action,
            );
        },
      );

      return options?.onSuccess?.(res, req, ...rest);
    },
  });
};
