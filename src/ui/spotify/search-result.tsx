import { ItemType } from "@soundify/web-api";
import { Card, CardProps, Flex, Text } from "@radix-ui/themes";
import { SourceImage } from "./source-image";
import { getSpotifySearchResultDisplayData } from "../../utils";
import { SpotifySearchItem } from "../../types";

type SearchResultProps<T extends ItemType> = {
  type: T;
  item: SpotifySearchItem<T>;
  imageSize?: number;
} & CardProps;

export const SearchResult = <T extends ItemType>({
  type,
  item,
  imageSize = 50,
  ...rest
}: SearchResultProps<T>) => {
  // TODO: handle default subtitle sources for each type
  const displayData = getSpotifySearchResultDisplayData<T>({
    item,
    minimumImgSize: imageSize,
  });

  return (
    <Card {...rest}>
      <Flex gap="2" align="start" justify="center">
        <SourceImage src={displayData.imgSrc} sourceType={type} />
        <Flex direction="column" gap="2">
          <Text>{displayData.title}</Text>
        </Flex>
      </Flex>
    </Card>
  );
};
