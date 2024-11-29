import { useAuth } from "../providers";

export const HomePage = () => {
  const { user } = useAuth();
  return <div>{JSON.stringify(user)}</div>;
};
