import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useSoundify } from '../../providers';
import { queryKeys } from './query-keys';
import {
  getCurrentUsersPlaylists,
  SimplifiedPlaylist,
} from '@soundify/web-api';
import { PageIterator } from '@soundify/web-api/pagination';
import { LimitedQueryOptions } from '../../types';

export type UseUserPlaylistsResponse = SimplifiedPlaylist[];

export const useUserPlaylists = <
  UseUserPlaylistsResponse,
  E = unknown,
  D = UseUserPlaylistsResponse,
>(
  options?: LimitedQueryOptions<SimplifiedPlaylist[], E, D>,
) => {
  const { spotifyClient } = useSoundify();

  return useQuery({
    queryKey: queryKeys.userPlaylists,
    queryFn: async () => {
      const currentUserPlaylistIterator = new PageIterator((offset) =>
        getCurrentUsersPlaylists(spotifyClient!, { offset, limit: 50 }),
      );
      const res = await currentUserPlaylistIterator.collect();

      return res;
    },
    ...options,
    enabled: (options?.enabled ?? true) && !!spotifyClient,
  });
};
