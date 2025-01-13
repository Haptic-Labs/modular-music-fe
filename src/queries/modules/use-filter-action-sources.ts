import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../providers";
import { Database, LimitedQueryOptions } from "../../types";
import { modulesQueryKeys } from "./keys";

export type FilterActionSourcesRequest = {
  actionId: string;
};

export type FilterActionSourcesResponse =
  Database["public"]["Tables"]["filter_action_sources"]["Row"][];

export const useFilterActionSourcesQuery = <
  E = unknown,
  D = FilterActionSourcesResponse,
>(
  request: FilterActionSourcesRequest,
  options?: LimitedQueryOptions<FilterActionSourcesResponse, E, D>,
) => {
  const { supabaseClient } = useAuth();

  return useQuery({
    queryKey: modulesQueryKeys.filterActionSources(request),
    queryFn: async () => {
      const query = supabaseClient
        .schema("public")
        .from("filter_action_sources")
        .select("*")
        .eq("action_id", request.actionId)
        .throwOnError();

      const { data } = await query;

      if (!data) throw new Error("Error fetching filter action sources");

      return data;
    },
    ...options,
  });
};
