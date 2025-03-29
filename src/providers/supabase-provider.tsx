/* eslint-disable react-refresh/only-export-components */
import {
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Database } from '../types';

type SupabaseProviderProps = {
  children: ReactNode;
};

type AuthContext = {
  supabaseClient: SupabaseClient<Database>;
  user?: User;
  session?: Session;
  spotifyUserId?: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContext | null>(null);

const PROJECT_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SCOPES = [
  'ugc-image-upload',
  'user-read-recently-played',
  'user-top-read',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-read-email',
  'user-library-modify',
  'user-library-read',
];

export const AuthProvider = ({ children }: SupabaseProviderProps) => {
  const supabaseClient = createClient<Database>(PROJECT_URL, ANON_KEY);
  const [auth, setAuth] = useState<Pick<AuthContext, 'user' | 'session'>>({});

  const login = async () => {
    if (!supabaseClient || (!!auth.session && !!auth.user)) {
      console.info('User already signed in');
      return;
    }

    // Get existing session
    const {
      data: { session: existingSession },
      error,
    } = await supabaseClient.auth.getSession();

    if (error || !existingSession) {
      // If no existing session login with oauth
      console.info('No existing session to fetch');
      await supabaseClient.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes: SCOPES.join(' '),
          redirectTo: `${window.location.origin}/auth?path=${encodeURIComponent(window.location.pathname)}`,
        },
      });
      return;
    }

    // Set context values
    setAuth({
      session: existingSession,
      user: existingSession.user,
    });
  };

  const logout = async () => {
    if (supabaseClient && !!auth.session) {
      await supabaseClient.auth.signOut();
      setAuth({});
    }
  };

  useEffect(() => {
    if (!auth.user || !auth.session) login();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        supabaseClient,
        ...auth,
        login,
        logout,
        spotifyUserId: auth.user?.identities?.find(
          ({ provider }) => provider === 'spotify',
        )?.identity_data?.provider_id,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error(
      'useSupabaseContext must be used inside of SupabaseProvider',
    );

  return context;
};
