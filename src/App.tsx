import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { theme } from "./theme";
import { ROUTES } from "./layout/routes";
import { AuthProvider } from "./providers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter(ROUTES);
const queryClient = new QueryClient({});

function App() {
  return (
    <Theme appearance="dark" panelBackground="translucent" accentColor="green">
      <EmotionThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </EmotionThemeProvider>
    </Theme>
  );
}

export default App;
