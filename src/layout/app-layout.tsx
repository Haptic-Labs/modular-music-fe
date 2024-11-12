import { Header } from "./header";
import { Button, Flex } from "@radix-ui/themes";
import { Link, Outlet, useLocation } from "react-router-dom";
import { TOP_LEVEL_ROUTES } from "./routes";

export const AppLayout = () => {
  const location = useLocation();
  const currentTopLevelRoute = location.pathname.split("/")[1];

  return (
    <div
      css={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Header />
      <div
        css={{
          display: "flex",
          height: "100%",
        }}
      >
        <Flex
          asChild
          css={(theme) => ({
            backgroundColor: theme.colors.grayDark.gray1,
            padding: 8,
          })}
          direction="column"
          gap="1"
          height="100%"
          width="350px"
        >
          <nav>
            {TOP_LEVEL_ROUTES.map((route) => {
              const isActive =
                (route.path?.replace("/", "") ?? "") === currentTopLevelRoute;

              return (
                <Button
                  key={`route-button-${route.path}`}
                  variant={isActive ? "soft" : "ghost"}
                  size="3"
                  css={{
                    width: "100%",
                    justifyContent: "flex-start",
                  }}
                  data-override={!isActive ? "inline-ghost" : undefined}
                  asChild
                >
                  <Link to={route.path ?? "/"}>{route.id}</Link>
                </Button>
              );
            })}
          </nav>
        </Flex>
        <main
          css={{
            height: "100%",
            width: "100%",
            overflow: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
