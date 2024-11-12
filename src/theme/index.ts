import { colors } from "./colors";
import { fonts } from "./fonts";

export const theme: CustomTheme = {
  colors,
  fonts,
} as const;

export interface CustomTheme {
  colors: typeof colors;
  fonts: typeof fonts;
}
