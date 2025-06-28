import { ItemType } from '@soundify/web-api';
import { SourceImage } from './source-image';
import {
  convertItemTypeToSourceType,
  getSpotifySearchResultDisplayData,
} from '../../utils';
import { SpotifySearchItem } from '../../types';
import { HTMLAttributes } from 'react';
import { Button, ButtonProps, Stack, Text } from '@mantine/core';

type SearchResultProps<T extends ItemType> = {
  type: T;
  item: SpotifySearchItem<T>;
  imageSize?: number;
  isSelected?: boolean;
} & Pick<ButtonProps, 'color' | 'variant'> &
  HTMLAttributes<HTMLButtonElement>;

export const SearchResult = <T extends ItemType>({
  type,
  item,
  imageSize = 50,
  isSelected = false,
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
        justifyContent: 'start',
        height: 'max-content',
        padding: 8,
        paddingRight: 24,
      }}
      variant={isSelected ? 'solid' : 'soft'}
      color={isSelected ? 'green' : 'gray'}
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
      <Stack gap='1' align='start' w='100%'>
        <Text
          truncate
          css={{
            maxWidth: '100%',
          }}
        >
          {displayData.title}
        </Text>
        <Text
          c='gray'
          truncate
          css={{
            maxWidth: '100%',
          }}
        >
          {displayData.subtitle}
        </Text>
      </Stack>
    </Button>
  );
};
