import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, LimitedMutationOptions } from "../../types";
import { useAuth } from "../../providers";
import { modulesMutationKeys, modulesQueryKeys } from "./keys";
import { ModuleActionsResponse } from "./use-module-actions";
import { arrayUpsert } from "../../utils";
import { removeNullishFromObject } from "../../utils/remove-nullish-from-object";

type AddLimitActionRequest =
  Database["public"]["Functions"]["UpsertModuleActionLimit"]["Args"];
type AddLimitActionResponse =
  Database["public"]["Functions"]["UpsertModuleActionLimit"]["Returns"];

export const useAddModuleLimitActionMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    AddLimitActionResponse,
    E,
    AddLimitActionRequest,
    C
  >,
) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuth();

  return useMutation({
    mutationKey: modulesMutationKeys.addModuleAction("LIMIT"),
    mutationFn: async (req) => {
      const query = supabaseClient
        .schema("public")
        .rpc("UpsertModuleActionLimit", req)
        .throwOnError();

      const { data: res } = await query;

      if (!res) throw new Error("Error adding new limit action");

      return res;
    },
    ...options,
    onSuccess: (res, ...rest) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { config: _, ...action } = res;
      const filteredAction = removeNullishFromObject(action);

      if (!filteredAction.id) return options?.onSuccess?.(res, ...rest);

      queryClient.setQueriesData<ModuleActionsResponse>(
        {
          queryKey: modulesQueryKeys.moduleActions({
            moduleId: filteredAction?.id,
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
    },
  });
};
