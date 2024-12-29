import { Grid } from "@radix-ui/themes";
import { ComponentProps } from "react";

export const MODULE_GRID_CONFIG: ComponentProps<typeof Grid>["columns"] = {
  initial: "2",
  sm: "2",
  xs: "1",
  lg: "3",
  xl: "4",
};
