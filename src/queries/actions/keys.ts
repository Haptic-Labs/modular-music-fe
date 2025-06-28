import { UseShuffleConfigRequest } from './use-shuffle-config';

export const actionQueryKeys = {
  shuffleConfig: (req?: UseShuffleConfigRequest) => {
    const baseKey = ['shuffle-config'] as const;
    if (req) return [...baseKey, req] as const;
    return baseKey;
  },
};
