import { ItemType, SearchResponse, Track } from "@soundify/web-api";
import { ItemTypeToResultKey } from "../queries/spotify/types";

export type SpotifyImage = Track["album"]["images"][number];

export type SpotifySearchItem<T extends ItemType = ItemType> =
  SearchResponse[ItemTypeToResultKey[T]]["items"][number];
