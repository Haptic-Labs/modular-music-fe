import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { theme } from "./theme";
import { ROUTES } from "./layout/routes";
import { AuthProvider } from "./providers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SoundifyProvider } from "./providers/soundify-provider";

const router = createBrowserRouter(ROUTES);
const queryClient = new QueryClient({});

function App() {
  return (
    <Theme appearance="dark" panelBackground="translucent" accentColor="green">
      <EmotionThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SoundifyProvider>
              <RouterProvider router={router} />
            </SoundifyProvider>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </EmotionThemeProvider>
    </Theme>
  );
}

export default App;
