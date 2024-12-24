import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../providers";
import { Database, LimitedQueryOptions } from "../../types";
import { modulesQueryKeys } from "./keys";

export type ModuleSourcesRequest = {
  moduleId: string;
};

export type ModuleSourcesResponse =
  Database["public"]["Tables"]["module_sources"]["Row"][];

export const useModuleSourcesQuery = <E = unknown, D = ModuleSourcesResponse>(
  request: ModuleSourcesRequest,
  options?: LimitedQueryOptions<ModuleSourcesResponse, E, D>,
) => {
  const { supabaseClient } = useAuth();
  return useQuery({
    queryKey: modulesQueryKeys.moduleSources(request),
    queryFn: async () => {
      const query = supabaseClient
        .schema("public")
        .from("module_sources")
        .select("*")
        .eq("module_id", request.moduleId)
        .throwOnError();

      const { data: res } = await query;

      return res ?? [];
    },
    ...options,
  });
};
