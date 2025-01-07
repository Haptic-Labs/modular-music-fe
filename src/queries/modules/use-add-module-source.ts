import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, LimitedMutationOptions } from "../../types";
import { useAuth } from "../../providers";
import { modulesMutationKeys, modulesQueryKeys } from "./keys";
import { ModuleSourcesResponse } from "./use-module-sources";
import { Compulsory } from "ts-toolbelt/out/Object/Compulsory";
import { Optional } from "ts-toolbelt/out/Object/Optional";
import { UseRecentlyListenedConfigResponse } from "./use-recently-listened-config";

type AddBasicSourceRequest =
  Database["public"]["Tables"]["module_sources"]["Insert"];

type AddBasicSourceResponse =
  Database["public"]["Tables"]["module_sources"]["Row"];

export const useAddBasicModuleSourceMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    AddBasicSourceResponse,
    E,
    AddBasicSourceRequest,
    C
  >,
) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuth();

  return useMutation({
    mutationKey: modulesMutationKeys.addModuleSource(),
    mutationFn: async (req) => {
      const query = supabaseClient
        .schema("public")
        .from("module_sources")
        .insert(req)
        .select("*")
        .throwOnError()
        .single();

      const { data: res } = await query;

      if (!res) throw new Error("Error adding new source");

      return res;
    },
    ...options,
    onSuccess: (res, ...rest) => {
      queryClient.setQueriesData<ModuleSourcesResponse>(
        {
          queryKey: modulesQueryKeys.moduleSources({ moduleId: res.module_id }),
          exact: false,
        },
        (data) => {
          if (!data) return [res];
          return [...data, res];
        },
      );
      return options?.onSuccess?.(res, ...rest);
    },
  });
};

const parseAddRecentlyListenedResponse = (
  response: AddRecentlyListenedResponse,
): {
  source: Database["public"]["Tables"]["module_sources"]["Row"];
  config: Database["public"]["Tables"]["recently_played_source_configs"]["Row"];
} => ({
  source: {
    id: response.source_id,
    module_id: response.module_id,
    type: response.type,
    spotify_id: response.spotify_id,
    created_at: response.created_at ?? null,
    updated_at: response.updated_at ?? null,
    deleted_at: response.deleted_at ?? null,
    limit: response.limit ?? null,
    image_url: response.image_url,
    title: response.title,
  },
  config: {
    id: response.config_id,
    created_at: response.config_created_at,
    interval: response.interval,
    quantity: response.quantity,
    updated_at: response.config_updated_at ?? null,
    deleted_at: response.deleted_at ?? null,
  },
});

type AddRecentlyListenedIO =
  Database["public"]["Functions"]["UpsertModuleSource:RecentlyListened"];
type AddRecentlyListenedRequest = AddRecentlyListenedIO["Args"];
type AddRecentlyListenedResponse = Optional<
  Compulsory<AddRecentlyListenedIO["Returns"]>,
  "deleted_at" | "updated_at" | "limit" | "config_updated_at"
>;

export const useAddRecentlyListenedSource = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    AddRecentlyListenedResponse,
    E,
    AddRecentlyListenedRequest,
    C
  >,
) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuth();

  return useMutation({
    mutationKey: modulesMutationKeys.addModuleSource("RECENTLY_PLAYED"),
    mutationFn: async (req) => {
      const query = supabaseClient
        .schema("public")
        .rpc("UpsertModuleSource:RecentlyListened", req)
        .throwOnError();

      const { data: res } = await query;

      if (!res) throw new Error("Error adding recently listened source");

      return res as AddRecentlyListenedResponse;
    },
    ...options,
    onSuccess: (res, ...rest) => {
      const { source, config } = parseAddRecentlyListenedResponse(res);
      queryClient.setQueriesData<ModuleSourcesResponse>(
        {
          queryKey: modulesQueryKeys.moduleSources({ moduleId: res.module_id }),
          exact: false,
        },
        (data) => {
          if (!data) return [source];

          const existingSource = data.find(
            (source) => source.id === res.source_id,
          );
          if (existingSource)
            return data.map((existingSource) =>
              existingSource.id === source.id ? source : existingSource,
            );
          return [...data, source];
        },
      );

      queryClient.setQueriesData<UseRecentlyListenedConfigResponse>(
        {
          queryKey: modulesQueryKeys.recentlyListenedConfig({
            sourceId: res.config_id,
          }),
          exact: false,
        },
        config,
      );

      return options?.onSuccess?.(res, ...rest);
    },
  });
};
