import { Button } from "@radix-ui/themes";
import { Wordmark } from "../assets";
import { useAuth } from "../providers";

export const Header = () => {
  const { session, login, logout } = useAuth();

  return (
    <nav
      css={(theme) => ({
        display: "flex",
        maxWidth: "100vw",
        height: 60,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        backgroundColor: theme.colors.grayDark.gray1,
      })}
    >
      <Wordmark
        variant="dark"
        css={{
          height: "80%",
          width: "auto",
        }}
      />
      <Button
        onClick={() => {
          if (session) {
            logout();
          } else {
            login();
          }
        }}
      >
        {session ? "Logout" : "Login"}
      </Button>
    </nav>
  );
};
