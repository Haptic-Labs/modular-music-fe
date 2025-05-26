import { ItemType, SearchResponse, Track } from '@soundify/web-api';
import { ItemTypeToResultKey } from '../queries/spotify/types';
import { ALL_ITEM_TYPES } from '../queries/spotify/constants';

export type SpotifyImage = Track['album']['images'][number];

export type SpotifySearchItem<T extends ItemType = ItemType> =
  SearchResponse[ItemTypeToResultKey[T]]['items'][number];

export type ImplementedItemTypes = (typeof ALL_ITEM_TYPES)[number];
