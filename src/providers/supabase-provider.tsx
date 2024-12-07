/* eslint-disable react-refresh/only-export-components */
import {
  createClient,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Database } from "../types";

type SupabaseProviderProps = {
  children: ReactNode;
};

type AuthContext = {
  supabaseClient: SupabaseClient<Database>;
  user?: User;
  session?: Session;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContext | null>(null);

const PROJECT_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SCOPES = [
  "ugc-image-upload",
  "user-read-recently-played",
  "user-top-read",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-read-email",
  "user-library-modify",
  "user-library-read",
];

export const AuthProvider = ({ children }: SupabaseProviderProps) => {
  const supabaseClient = createClient<Database>(PROJECT_URL, ANON_KEY);
  const [auth, setAuth] = useState<Pick<AuthContext, "user" | "session">>({});

  const login = async () => {
    if (!supabaseClient || (!!auth.session && !!auth.user)) {
      console.info("User already signed in");
      return;
    }

    // Get existing session
    const {
      data: { session: existingSession },
      error,
    } = await supabaseClient.auth.getSession();

    if (error || !existingSession) {
      // If no existing session login with oauth
      console.info("No existing session to fetch");
      await supabaseClient.auth.signInWithOAuth({
        provider: "spotify",
        options: {
          scopes: SCOPES.join(" "),
          redirectTo: `${window.location.origin}/auth?path=${encodeURIComponent(window.location.pathname)}`,
        },
      });
      return;
    }

    // Upsert new tokens if they exist
    const { provider_token, provider_refresh_token } = existingSession;
    if (
      typeof provider_token === "string" &&
      typeof provider_refresh_token === "string"
    ) {
      await supabaseClient.schema("spotify_auth").rpc("UpsertProviderData", {
        p_user_id: existingSession.user.id,
        p_access: provider_token,
        p_refresh: provider_refresh_token,
        p_expires_at: provider_token
          ? existingSession.expires_at
            ? new Date(existingSession.expires_at * 1000).toISOString()
            : new Date(new Date().getTime() * 1000).toISOString()
          : undefined,
      });
    } else {
      // If they don't exist on the session, get a new token via edge function
      const { data: newTokensResponse, error } =
        await supabaseClient.functions.invoke<
          Database["spotify_auth"]["Tables"]["provider_session_data"]["Row"]
        >(`spotify/auth/refresh-token/${existingSession.user.id}`, {
          method: "POST",
        });
      if (error || !newTokensResponse) {
        console.error("Error fetching spotify tokens", error);
        return;
      }
      await supabaseClient.schema("spotify_auth").rpc("UpsertProviderData", {
        p_user_id: newTokensResponse.user_id,
        p_access: newTokensResponse.access,
        p_refresh: newTokensResponse.refresh,
        p_expires_at: newTokensResponse.expires_at,
      });
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
    <AuthContext.Provider value={{ supabaseClient, ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error(
      "useSupabaseContext must be used inside of SupabaseProvider",
    );

  return context;
};
