import { ItemType } from "@soundify/web-api";
import { Button, ButtonProps, Flex, Text } from "@radix-ui/themes";
import { SourceImage } from "./source-image";
import {
  convertItemTypeToSourceType,
  getSpotifySearchResultDisplayData,
} from "../../utils";
import { SpotifySearchItem } from "../../types";
import { HTMLAttributes } from "react";

type SearchResultProps<T extends ItemType> = {
  type: T;
  item: SpotifySearchItem<T>;
  imageSize?: number;
  isSelected: boolean;
} & Pick<ButtonProps, "color" | "variant" | "onClick"> &
  HTMLAttributes<HTMLButtonElement>;

export const SearchResult = <T extends ItemType>({
  type,
  item,
  imageSize = 50,
  isSelected,
  ...rest
}: SearchResultProps<T>) => {
  const displayData = getSpotifySearchResultDisplayData<T>({
    item,
    itemType: type,
    minimumImgSize: imageSize,
  });

  return (
    <Button
      title={`${displayData.title} | ${displayData.subtitle}`}
      css={{
        justifyContent: "start",
        height: "max-content",
        padding: 8,
        paddingRight: 24,
      }}
      variant={isSelected ? "solid" : "soft"}
      color={isSelected ? "green" : "gray"}
      {...rest}
    >
      <SourceImage
        src={displayData.imgSrc}
        sourceType={convertItemTypeToSourceType(type)}
        css={{
          width: imageSize,
          minWidth: imageSize,
          height: imageSize,
          minHeight: imageSize,
          borderRadius: 8,
        }}
      />
      <Flex direction="column" gap="1" align="start" width="100%">
        <Text
          as="p"
          truncate
          css={{
            maxWidth: "100%",
          }}
        >
          {displayData.title}
        </Text>
        <Text
          as="p"
          color="gray"
          truncate
          size="1"
          css={{
            maxWidth: "100%",
          }}
        >
          {displayData.subtitle}
        </Text>
      </Flex>
    </Button>
  );
};
