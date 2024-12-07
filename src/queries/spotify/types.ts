import { ItemType } from "@soundify/web-api";
import { ALL_ITEM_TYPES } from "./constants";

export type AllItemTypes = typeof ALL_ITEM_TYPES;

export type ItemTypeToResultKey = {
  album: "albums";
  artist: "artists";
  playlist: "playlists";
  track: "tracks";
  show: "shows";
  episode: "episodes";
  audiobook: "audiobooks";
};
export type ItemTypesToSearchResultKeys<T extends ItemType | ItemType[]> =
  T extends ItemType[]
    ? Pick<ItemTypeToResultKey, T[number]>[T[number]]
    : T extends ItemType
      ? ItemTypeToResultKey[T]
      : never;
