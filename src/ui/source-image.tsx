import { HTMLAttributes } from "react";
import { Database } from "../types";
import { LikedSongsIcon, RecentlyListenedIcon } from "./vectors";
import { colors } from "../theme/colors";

type SVGType = "LIKED_SONGS" | "RECENTLY_PLAYED";

type SourceImageProps<
  T extends Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"],
> = {
  src?: string;
  sourceType: T;
  color?: string;
} & HTMLAttributes<T extends SVGType ? SVGElement : HTMLImageElement>;

export const SourceImage = <
  T extends Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"],
>({
  src,
  sourceType,
  color = colors.greenDark.green9,
  ...rest
}: SourceImageProps<T>) => {
  if (sourceType === "LIKED_SONGS") {
    const typedRest = rest as HTMLAttributes<SVGElement>;
    return <LikedSongsIcon color={color} {...typedRest} />;
  } else if (sourceType === "RECENTLY_PLAYED") {
    const typedRest = rest as HTMLAttributes<SVGElement>;
    return <RecentlyListenedIcon color={color} {...typedRest} />;
  } else {
    const typedRest = rest as HTMLAttributes<HTMLImageElement>;
    return <img src={src} {...typedRest} />;
  }
};
