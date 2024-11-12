/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CustomTheme } from "./theme";

declare module "@emotion/react" {
  export interface Theme extends CustomTheme {}
}
