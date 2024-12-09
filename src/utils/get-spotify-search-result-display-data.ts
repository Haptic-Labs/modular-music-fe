import { ItemType } from "@soundify/web-api";
import { SpotifySearchItem } from "../types";
import { getSmallestSpotifyImage } from "./get-smallest-spotify-image";

type GetSpotifySearchResultDisplayDataArgs<T extends ItemType = ItemType> = {
  item: SpotifySearchItem<T>;
  subtitleSource?: keyof SpotifySearchItem<T>;
  minimumImgSize?: number;
};

type SpotifyDisplayData = {
  imgSrc?: string;
  title: string;
  subtitle?: string;
};

export const getSpotifySearchResultDisplayData = <
  T extends ItemType = ItemType,
>({
  item,
  subtitleSource = "type",
  minimumImgSize = 50,
}: GetSpotifySearchResultDisplayDataArgs<T>): SpotifyDisplayData => {
  const images = "album" in item ? item.album.images : item.images;
  const subtitleData = item[subtitleSource];

  return {
    imgSrc: getSmallestSpotifyImage({ images, minimumSize: minimumImgSize })
      ?.url,
    title: item.name,
    subtitle: subtitleData ? String(subtitleData) : undefined,
  };
};
