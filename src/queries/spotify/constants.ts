import { ItemType } from '@soundify/web-api';

export const ALL_ITEM_TYPES: ItemType[] = [
  'album',
  'playlist',
  'track',
  // 'show',
  // 'episode',
  // 'audiobook',
  'artist',
] satisfies ItemType[];
