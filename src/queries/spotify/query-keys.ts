import { ItemType } from "@soundify/web-api";
import { AllItemTypes } from "./types";
import { SearchRequest } from "./use-search-query";

export const queryKeys = {
  search: <T extends ItemType[] | ItemType = AllItemTypes>(
    request: SearchRequest<T>,
  ) => ["spotify", "search", request],
};
