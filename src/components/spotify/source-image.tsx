import { HTMLAttributes } from "react";
import { Database } from "../../types";
import { LikedSongsIcon, RecentlyListenedIcon } from "../../ui/vectors";
import { colors } from "../../theme/colors";
import {
  IconMusic,
  IconPlaylist,
  IconProps,
  IconUser,
  IconVinyl,
} from "@tabler/icons-react";

type SVGType = "LIKED_SONGS" | "RECENTLY_PLAYED";

type SourceImageProps<
  T extends Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"] | undefined,
  Src extends string | undefined,
> = {
  src?: Src;
  sourceType?: T;
  color?: string;
} & (T extends string
  ? HTMLAttributes<T extends SVGType ? SVGElement : HTMLImageElement>
  : IconProps);

export const SourceImage = <
  T extends Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"] | undefined,
  Src extends string | undefined,
>({
  src,
  sourceType,
  color = colors.greenDark.green9,
  ...rest
}: SourceImageProps<T, Src>) => {
  if (sourceType === "LIKED_SONGS") {
    const typedRest = rest as HTMLAttributes<SVGElement>;
    return <LikedSongsIcon color={color} {...typedRest} />;
  } else if (sourceType === "RECENTLY_PLAYED") {
    const typedRest = rest as HTMLAttributes<SVGElement>;
    return <RecentlyListenedIcon color={color} {...typedRest} />;
  } else if (src) {
    const typedRest = rest as HTMLAttributes<HTMLImageElement>;
    return <img src={src} {...typedRest} />;
  } else {
    const typedRest = rest as IconProps;
    switch (sourceType) {
      case "TRACK":
        return <IconMusic color={colors.greenDark.green5} {...typedRest} />;
      case "ALBUM":
        return <IconVinyl color={colors.greenDark.green5} {...typedRest} />;
      case "ARTIST":
        return <IconUser color={colors.greenDark.green5} {...typedRest} />;
      case "PLAYLIST":
        return <IconPlaylist color={colors.greenDark.green5} {...typedRest} />;
    }
  }
};
