import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useSoundify } from '../../providers';
import { getSavedTracks } from '@soundify/web-api';
import { queryKeys } from './query-keys';

export const useLikedSongsLength = <E = unknown>(
  options?: Omit<UseQueryOptions<number, E>, 'queryKey' | 'queryFn'>,
) => {
  const { spotifyClient } = useSoundify();

  return useQuery({
    queryKey: queryKeys.likedSongsLength,
    queryFn: async () => {
      const res = await getSavedTracks(spotifyClient!, { limit: 1 });
      return res.total;
    },
    ...options,
    enabled: !!spotifyClient && (options?.enabled ?? true),
  });
};
