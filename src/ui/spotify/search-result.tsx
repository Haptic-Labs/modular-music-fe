import { ItemType, SearchResponse } from "@soundify/web-api";
import { ItemTypeToResultKey } from "../../queries/spotify/types";
import { Card, CardProps } from "@radix-ui/themes";
import { SourceImage } from "./source-image";

type SearchItem<T extends ItemType> =
  SearchResponse[ItemTypeToResultKey[T]]["items"][number];

type SearchResultProps<T extends ItemType> = {
  type: T;
  item: SearchItem<T>;
} & CardProps;

export const SearchResult = <T extends ItemType>({
  type,
  item,
  ...rest
}: SearchResultProps<T>) => {
  switch (type) {
    case "track":
      const track = item as SearchItem<"track">;
      return (
        <Card {...rest}>
          <SourceImage src={track.album.images[0]?.url} sourceType="TRACK" />
        </Card>
      );
  }
};
