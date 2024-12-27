import { useQuery } from "@tanstack/react-query";
import { Database, LimitedQueryOptions } from "../../types";
import { useAuth } from "../../providers";
import { modulesQueryKeys } from "./keys";

export type UseRecentlyListenedConfigRequest = {
  sourceId: string;
};

export type UseRecentlyListenedConfigResponse =
  | Database["public"]["Tables"]["recently_played_source_configs"]["Row"]
  | null;

export const useRecentlyListenedConfigQuery = <
  E = unknown,
  D = UseRecentlyListenedConfigResponse,
>(
  request: UseRecentlyListenedConfigRequest,
  options?: LimitedQueryOptions<UseRecentlyListenedConfigResponse, E, D>,
) => {
  const { supabaseClient } = useAuth();

  return useQuery({
    queryKey: modulesQueryKeys.recentlyListenedConfig(request),
    queryFn: async () => {
      const query = supabaseClient
        .schema("public")
        .from("recently_played_source_configs")
        .select("*")
        .eq("id", request.sourceId)
        .throwOnError()
        .maybeSingle();

      const { data: res } = await query;

      return res;
    },
    ...options,
  });
};

export type UseMultipleRecentlyListenedConfigsRequest = {
  sourceIds: string[];
};

export type UseMultipleRecentlyListenedConfigsResponse =
  Database["public"]["Tables"]["recently_played_source_configs"]["Row"][];

export const useMultipleRecentlyListenedConfigsQuery = <
  E = unknown,
  D = UseMultipleRecentlyListenedConfigsResponse,
>(
  request: UseMultipleRecentlyListenedConfigsRequest,
  options?: LimitedQueryOptions<
    UseMultipleRecentlyListenedConfigsResponse,
    E,
    D
  >,
) => {
  const { supabaseClient } = useAuth();

  return useQuery({
    queryKey: modulesQueryKeys.multipleRecentlyListenedConfigs(request),
    queryFn: async () => {
      const query = supabaseClient
        .schema("public")
        .from("recently_played_source_configs")
        .select("*")
        .in("id", request.sourceIds)
        .throwOnError();

      const { data: res } = await query;

      return res ?? [];
    },
    ...options,
  });
};
