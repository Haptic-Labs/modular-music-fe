import { ItemType } from "@soundify/web-api";
import { Database } from "../types";

export const convertItemTypeToSourceType = (
  itemType: ItemType,
): Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"] | undefined => {
  switch (itemType) {
    case "track":
      return "TRACK";
    case "album":
      return "ALBUM";
    case "playlist":
      return "PLAYLIST";
    case "artist":
      return "ARTIST";
    default:
      return undefined;
  }
};
