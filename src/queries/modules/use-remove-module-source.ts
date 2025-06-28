import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../providers";
import { Database, LimitedMutationOptions } from "../../types";
import { modulesMutationKeys, modulesQueryKeys } from "./keys";
import { ModuleSourcesResponse } from "./use-module-sources";
import {
  UseMultipleRecentlyListenedConfigsRequest,
  UseMultipleRecentlyListenedConfigsResponse,
} from "./use-recently-listened-config";

export type UseRemoveModuleSourceRequest = {
  sourceId: string;
};

export type UseRemoveModuleSourceResponse =
  | Database["public"]["Tables"]["module_sources"]["Row"]
  | null;

export const useRemoveModuleSourceMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    UseRemoveModuleSourceResponse,
    E,
    UseRemoveModuleSourceRequest,
    C
  >,
) => {
  const { supabaseClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: modulesMutationKeys.removeModuleSource,
    mutationFn: async (request) => {
      const query = supabaseClient
        .schema("public")
        .from("module_sources")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", request.sourceId)
        .select("*")
        .maybeSingle()
        .throwOnError();

      const { data: res } = await query;

      return res;
    },
    ...options,
    onSuccess: (res, ...rest) => {
      if (res?.module_id) {
        queryClient.setQueriesData<ModuleSourcesResponse>(
          {
            queryKey: modulesQueryKeys.moduleSources({
              moduleId: res?.module_id,
            }),
            exact: false,
          },
          (data) => {
            if (!data) return data;

            return data.filter((row) => row.id !== res.id);
          },
        );
        queryClient.invalidateQueries({
          queryKey: modulesQueryKeys.recentlyListenedConfig({
            sourceId: res.id,
          }),
          exact: false,
        });
        queryClient.setQueriesData<UseMultipleRecentlyListenedConfigsResponse>(
          {
            queryKey: modulesQueryKeys.multipleRecentlyListenedConfigs(),
            exact: false,
            predicate: ({ queryKey }) => {
              const request =
                queryKey[1] as UseMultipleRecentlyListenedConfigsRequest;
              return request.sourceIds.includes(res.id);
            },
          },
          (data) => {
            if (!data) return data;
            return data.filter((row) => row.id !== res.id);
          },
        );
      }

      return options?.onSuccess?.(res, ...rest);
    },
  });
};
