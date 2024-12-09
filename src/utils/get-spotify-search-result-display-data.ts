import { ItemType } from "@soundify/web-api";
import { SpotifySearchItem } from "../types";
import { getSmallestSpotifyImage } from "./get-smallest-spotify-image";

type GetSpotifySearchResultDisplayDataArgs<T extends ItemType = ItemType> = {
  item: SpotifySearchItem<T>;
  itemType: T;
  minimumImgSize?: number;
};

type SpotifyDisplayData = {
  imgSrc?: string;
  title: string;
  subtitle: string;
};

export const getSpotifySearchResultDisplayData = <
  T extends ItemType = ItemType,
>({
  item,
  itemType,
  minimumImgSize = 50,
}: GetSpotifySearchResultDisplayDataArgs<T>): SpotifyDisplayData => {
  const images = "album" in item ? item.album.images : item.images;

  const getSubtitle = (): string => {
    if (itemType === "audiobook") {
      const { authors } = item as SpotifySearchItem<"audiobook">;
      const joinedAuthorNames = authors.map((author) => author.name).join(", ");
      return joinedAuthorNames;
    } else if (itemType === "artist") {
      return (
        item as SpotifySearchItem<"artist">
      ).followers.total.toLocaleString();
    } else if (itemType === "playlist") {
      const playlist = item as SpotifySearchItem<"playlist">;
      return (
        playlist.description ||
        playlist.owner.display_name ||
        `${playlist.tracks.total.toLocaleString()} tracks`
      );
    } else if (itemType === "episode") {
      return (item as SpotifySearchItem<"episode">).description;
    } else if (itemType === "album" || itemType === "track") {
      const { artists } = item as SpotifySearchItem<"album" | "track">;
      const joinedArtistNames = artists.map((artist) => artist.name).join(", ");
      return joinedArtistNames;
    } else {
      return (item as SpotifySearchItem<"show">).description;
    }
  };

  return {
    imgSrc: getSmallestSpotifyImage({ images, minimumSize: minimumImgSize })
      ?.url,
    title: item.name,
    subtitle: getSubtitle(),
  };
};
