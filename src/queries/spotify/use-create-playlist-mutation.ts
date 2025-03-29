import {
  createPlaylist,
  CreatePlaylistBody,
  getPlaylist,
  Playlist,
  uploadPlaylistCoverImage,
} from '@soundify/web-api';
import { LimitedMutationOptions } from '../../types';
import { useAuth, useSoundify } from '../../providers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mutationKeys, queryKeys } from './query-keys';
import { UseUserPlaylistsResponse } from './use-user-playlists';

export type CreatePlaylistRequest = CreatePlaylistBody & {
  imageBase64?: string;
};

export const useCreatePlaylistMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<Playlist, E, CreatePlaylistRequest, C>,
) => {
  const { spotifyClient } = useSoundify();
  const { spotifyUserId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.createPlaylist,
    mutationFn: async ({ imageBase64, ...request }) => {
      if (!spotifyClient) throw new Error('Spotify client not initialized');
      if (!spotifyUserId) throw new Error('Spotify user ID not found');
      const res = await createPlaylist(spotifyClient, spotifyUserId, request);

      if (imageBase64) {
        await uploadPlaylistCoverImage(spotifyClient, res.id, imageBase64);
        return await getPlaylist(spotifyClient, res.id);
      }

      return res;
    },
    ...options,
    onSuccess: (response, ...rest) => {
      queryClient.setQueriesData<UseUserPlaylistsResponse>(
        {
          queryKey: queryKeys.userPlaylists,
          exact: true,
        },
        (oldData) => {
          if (!oldData) return oldData;

          return [response, ...oldData];
        },
      );

      return options?.onSuccess?.(response, ...rest);
    },
  });
};
