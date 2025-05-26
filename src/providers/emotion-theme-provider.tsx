import { ThemeProvider } from '@emotion/react';
import { useMantineTheme } from '@mantine/core';
import { ReactNode } from 'react';

export const EmotionThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useMantineTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
