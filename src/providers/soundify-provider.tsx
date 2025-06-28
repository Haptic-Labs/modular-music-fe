/* eslint-disable react-refresh/only-export-components */
import { SpotifyClient } from '@soundify/web-api';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './supabase-provider';
import { Database } from '../types';

type SoundifyContext = {
  spotifyClient?: SpotifyClient;
};

type SoundifyProviderProps = {
  children: ReactNode;
};

const SoundifyContext = createContext<SoundifyContext | null>(null);

export const SoundifyProvider = ({ children }: SoundifyProviderProps) => {
  const { supabaseClient, user } = useAuth();
  const [spotifyClient, setSpotifyClient] = useState<SpotifyClient>();

  const createSpotifyClient = async () => {
    if (!user?.id) {
      setSpotifyClient(undefined);
      return;
    }

    const initialToken = await supabaseClient.functions.invoke<
      Database['spotify_auth']['Tables']['provider_session_data']['Row']
    >(`spotify/auth/refresh-token/${user.id}`, { method: 'POST' });

    const newClient = new SpotifyClient(initialToken.data?.access ?? null, {
      refresher: async () => {
        const { data: newTokensResponse, error } =
          await supabaseClient.functions.invoke<
            Database['spotify_auth']['Tables']['provider_session_data']['Row']
          >(`spotify/auth/refresh-token/${user.id}`, {
            method: 'POST',
          });
        if (error || !newTokensResponse) {
          console.error('Error fetching spotify tokens for soundify', error);
          throw new Error('Error fetching spotify tokens for soundify');
        }

        return newTokensResponse.access;
      },
      middlewares: [
        // (next) => (url, options) => {
        //   if (url.href.includes('images') && options.method === 'PUT') {
        //     options.headers.set('Access-Control-Allow-Origin', '*');
        //   }
        //   return next(url, options);
        // },
      ],
    });
    setSpotifyClient(newClient);
  };

  useEffect(() => {
    createSpotifyClient();
  }, [user?.id]);

  return (
    <SoundifyContext.Provider value={{ spotifyClient }}>
      {children}
    </SoundifyContext.Provider>
  );
};

export const useSoundify = () => {
  const value = useContext(SoundifyContext);

  if (!value) {
    throw new Error('useSoundify must be used inside of SoundifyProvider');
  }

  return value;
};
