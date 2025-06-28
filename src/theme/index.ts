import { fonts } from './fonts';

export const theme: CustomTheme = {
  fonts,
} as const;

export interface CustomTheme {
  fonts: typeof fonts;
}
