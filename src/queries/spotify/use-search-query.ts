import { useQuery } from '@tanstack/react-query';
import { LimitedQueryOptions } from '../../types';
import { queryKeys } from './query-keys';
import { useSoundify } from '../../providers';
import { ItemType, search, SearchResponse } from '@soundify/web-api';
import { AllItemTypes, ItemTypesToSearchResultKeys } from './types';
import { ALL_ITEM_TYPES } from './constants';

export type SearchRequest<T extends ItemType[] | ItemType = AllItemTypes> = {
  query: Parameters<typeof search<T>>[2];
  type?: T;
};

type CorrectedSearchResponse = {
  [K in keyof SearchResponse]?: Omit<SearchResponse[K], 'items'> & {
    items: (SearchResponse[K]['items'][number] | null)[];
  };
};

export type QuerySearchResponse<
  T extends ItemType[] | ItemType = AllItemTypes,
> = Pick<CorrectedSearchResponse, ItemTypesToSearchResultKeys<T>>;

export const useSearchQuery = <
  T extends ItemType[] | ItemType = AllItemTypes,
  E = undefined,
  D = QuerySearchResponse<T>,
>(
  { query, type }: SearchRequest<T>,
  options?: LimitedQueryOptions<QuerySearchResponse<T>, E, D>,
) => {
  const { spotifyClient } = useSoundify();

  return useQuery<QuerySearchResponse<T>, E, D>({
    queryKey: queryKeys.search<T>({
      query,
      type: type ?? (ALL_ITEM_TYPES as T),
    }),
    queryFn: async () => {
      const res = await search<T>(
        spotifyClient!,
        type ?? (ALL_ITEM_TYPES as T),
        query,
      );

      return res;
    },
    ...options,
    enabled: options?.enabled !== false && !!spotifyClient,
  });
};
