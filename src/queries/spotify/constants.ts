import { ItemType } from '@soundify/web-api';

export const ALL_ITEM_TYPES = [
  'album',
  'playlist',
  'track',
  // 'show',
  // 'episode',
  // 'audiobook',
  'artist',
] as const satisfies ItemType[];
