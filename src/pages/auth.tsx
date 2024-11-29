import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../providers";
import { useEffect } from "react";
import { Spinner, Text } from "@radix-ui/themes";

export const AuthPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLogin = async () => {
    const definedPath = searchParams.get("path");
    const decodedPath = decodeURIComponent(definedPath || "/");
    navigate(decodedPath, { replace: true });
  };

  useEffect(() => {
    if (session) handleLogin();
  }, [!!session]);

  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spinner size="3" />
      <Text>Logging you in...</Text>
    </div>
  );
};
