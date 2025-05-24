import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './global-styles.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './layout/routes';
import { AuthProvider } from './providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SoundifyProvider } from './providers/soundify-provider';
import { MantineProvider } from '@mantine/core';
import { emotionTransform, MantineEmotionProvider } from '@mantine/emotion';
import { EmotionThemeProvider } from './providers/emotion-theme-provider';

const router = createBrowserRouter(ROUTES);
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

function App() {
  return (
    <MantineProvider
      stylesTransform={emotionTransform}
      defaultColorScheme='dark'
      theme={{
        primaryColor: 'green',
        primaryShade: { dark: 8 },
        cursorType: 'pointer',
      }}
    >
      <MantineEmotionProvider>
        <EmotionThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <SoundifyProvider>
                <RouterProvider router={router} />
              </SoundifyProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </EmotionThemeProvider>
      </MantineEmotionProvider>
    </MantineProvider>
  );
}

export default App;
