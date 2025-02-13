import { Database } from "../../types";
import {
  IconArrowsShuffle,
  IconComponents,
  IconFilter,
  IconLayoutAlignTop,
  IconMusicPlus,
  IconProps,
} from "@tabler/icons-react";

type ModuleActionIconProps = {
  type: Database["public"]["Enums"]["MODULE_ACTION_TYPE"];
} & IconProps;

export const ModuleActionIcon = ({ type, ...rest }: ModuleActionIconProps) => {
  switch (type) {
    case "SHUFFLE":
      return <IconArrowsShuffle {...rest} />;
    case "LIMIT":
      return <IconLayoutAlignTop {...rest} />;
    case "FILTER":
      return <IconFilter {...rest} />;
    case "MODULE":
      return <IconComponents {...rest} />;
    case "COMBINE":
      return <IconMusicPlus {...rest} />;
  }
};
