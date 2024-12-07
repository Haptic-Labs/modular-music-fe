import { QueryKey, UseQueryOptions } from "@tanstack/react-query";

export type LimitedQueryOptions<
  ResponseData = unknown,
  Error = unknown,
  TransformedData = ResponseData,
  Key extends QueryKey = QueryKey,
> = Omit<
  UseQueryOptions<ResponseData, Error, TransformedData, Key>,
  "queryKey" | "queryFn"
>;
