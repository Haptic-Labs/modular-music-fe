import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { theme } from "./theme";
import { ROUTES } from "./layout/routes";
import { AuthProvider } from "./providers";

const router = createBrowserRouter(ROUTES);

function App() {
  return (
    <Theme appearance="dark" panelBackground="translucent" accentColor="green">
      <EmotionThemeProvider theme={theme}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </EmotionThemeProvider>
    </Theme>
  );
}

export default App;
