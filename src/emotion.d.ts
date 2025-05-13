import { CustomTheme } from './theme';
import type { EmotionStyles, EmotionSx } from '@mantine/emotion';
import '@mantine/core';
import { MantineTheme } from '@mantine/core';

declare module '@emotion/react' {
  export interface Theme extends CustomTheme, MantineTheme {}
}

declare module '@mantine/core' {
  export interface BoxProps {
    sx?: EmotionSx;
    styles?: EmotionStyles;
  }
}
