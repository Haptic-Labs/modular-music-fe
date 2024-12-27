import {
  MutationKey,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

export type LimitedQueryOptions<
  ResponseData = unknown,
  Error = unknown,
  TransformedData = ResponseData,
  Key extends QueryKey = QueryKey,
> = Omit<
  UseQueryOptions<ResponseData, Error, TransformedData, Key>,
  "queryKey" | "queryFn"
>;

export type LimitedMutationOptions<
  ResponseData = unknown,
  Error = unknown,
  Request = unknown,
  Context = unknown,
> = Omit<
  UseMutationOptions<ResponseData, Error, Request, Context>,
  "mutationFn" | "mutationKey"
>;
