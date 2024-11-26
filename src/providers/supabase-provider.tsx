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

type SupabaseContext = {
  supabaseClient: SupabaseClient<Database>;
  user?: User;
  session?: Session;
};

export const SupabaseContext = createContext<SupabaseContext | null>(null);

const PROJECT_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const supabaseClient = createClient<Database>(PROJECT_URL, ANON_KEY);
  const [auth, setAuth] = useState<Pick<SupabaseContext, "user" | "session">>(
    {},
  );

  const login = async () => {
    if (supabaseClient && (!auth.session || !auth.user)) {
      const newSession = await supabaseClient.auth.getSession();
      if (
        !newSession.data ||
        !!newSession.error ||
        !newSession.data.session?.user
      ) {
        setAuth({});
        return;
      }

      const newUser = newSession.data.session.user;
      setAuth({
        session: newSession.data.session,
        user: newUser,
      });
    }
  };

  useEffect(() => {
    login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!supabaseClient]);

  return (
    <SupabaseContext.Provider value={{ supabaseClient, ...auth }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);

  if (!context)
    throw new Error(
      "useSupabaseContext must be used inside of SupabaseProvider",
    );

  return context;
};
