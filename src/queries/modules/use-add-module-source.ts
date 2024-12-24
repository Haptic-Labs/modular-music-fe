import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { Database } from "../../types";
import { useAuth } from "../../providers";
import { modulesMutationKeys, modulesQueryKeys } from "./keys";
import { ModuleSourcesResponse } from "./use-module-sources";
import { Compulsory } from "ts-toolbelt/out/Object/Compulsory";
import { Optional } from "ts-toolbelt/out/Object/Optional";

type AddBasicSourceRequest =
  Database["public"]["Tables"]["module_sources"]["Insert"];

type AddBasicSourceResponse =
  Database["public"]["Tables"]["module_sources"]["Row"];

export const useAddBasicModuleSourceMutation = <E = unknown, C = unknown>(
  options?: UseMutationOptions<
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

const convertRecentlyListenedResponseToSource = (
  response: AddRecentlyListenedResponse,
): ModuleSourcesResponse[number] => ({
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
});

// TODO: convertRecentlyListenedResponseToConfig

type AddRecentlyListenedIO =
  Database["public"]["Functions"]["UpsertModuleSource:RecentlyListened"];
type AddRecentlyListenedRequest = AddRecentlyListenedIO["Args"];
type AddRecentlyListenedResponse = Optional<
  Compulsory<AddRecentlyListenedIO["Returns"]>,
  "deleted_at" | "updated_at" | "limit" | "config_updated_at"
>;

export const useAddRecentlyListenedSource = <E = unknown, C = unknown>(
  options?: UseMutationOptions<
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
        .rpc("UpsertModuleSource:RecentlyListened", req);

      const { data: res } = await query;

      if (!res) throw new Error("Error adding recently listened source");

      return res as AddRecentlyListenedResponse;
    },
    ...options,
    onSuccess: (res, ...rest) => {
      queryClient.setQueriesData<ModuleSourcesResponse>(
        {
          queryKey: modulesQueryKeys.moduleSources({ moduleId: res.module_id }),
          exact: false,
        },
        (data) => {
          if (!data) return [convertRecentlyListenedResponseToSource(res)];
          return [...data, convertRecentlyListenedResponseToSource(res)];
        },
      );

      return options?.onSuccess?.(res, ...rest);
    },
  });
};
