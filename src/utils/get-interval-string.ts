import { Database } from "../types";

export const getIntervalString = (
  interval: Database["public"]["Enums"]["RECENTLY_PLAYED_INTERVAL"],
  quantity?: number,
): string => {
  if (quantity === 1) {
    return interval.slice(0, -1).toLowerCase();
  } else {
    return interval.toLowerCase();
  }
};
