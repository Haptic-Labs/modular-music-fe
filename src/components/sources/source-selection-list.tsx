import {
  ActionIcon,
  Button,
  Group,
  SimpleGrid,
  SimpleGridProps,
  Stack,
  StackProps,
  Title,
} from '@mantine/core';
import { SpotifySearchItem } from '../../types';
import { ItemType } from '@soundify/web-api';
import { SpotifySourceButton } from '../modals/source-selection-modal/spotify-source-button';
import { getSpotifySearchResultDisplayData } from '../../utils';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useUncontrolled } from '@mantine/hooks';

type SourceSelectionListProps<SourceType extends ItemType> = {
  simpleGridProps?: SimpleGridProps;
  sources: (SpotifySearchItem<SourceType> | null)[];
  onSourceSelect: (source: SpotifySearchItem<SourceType>) => void;
  title?: ReactNode;
  keepVisible?: boolean;
  isExpanded?: boolean;
  setIsExpanded?: Dispatch<SetStateAction<boolean>>;
} & StackProps;

export const SourceSelectionList = <SourceType extends ItemType>({
  simpleGridProps,
  sources,
  onSourceSelect,
  title,
  keepVisible,
  isExpanded: providedIsExpanded,
  setIsExpanded: providedSetIsExpanded,
  ...rest
}: SourceSelectionListProps<SourceType>) => {
  const [isExpanded, setIsExpanded] = useUncontrolled({
    value: providedIsExpanded,
    defaultValue: false,
    onChange: providedSetIsExpanded,
  });

  if (!keepVisible && sources.length === 0) {
    return null;
  }

  const validSources = sources.filter((source) => !!source);
  const sourcesToShow = isExpanded ? validSources : validSources.slice(0, 6);

  return (
    <Stack gap={4} {...rest}>
      <Group
        align='center'
        justify={isExpanded ? 'start' : 'space-between'}
        gap={4}
      >
        {!!isExpanded && (
          <ActionIcon
            variant='subtle'
            onClick={() => setIsExpanded(false)}
            size='sm'
          >
            <IconArrowLeft />
          </ActionIcon>
        )}
        {!!title &&
          (typeof title === 'string' ? (
            <Title order={4}>{title}</Title>
          ) : (
            title
          ))}
        {!isExpanded && (
          <Button
            variant='subtle'
            size='compact-sm'
            css={{ fontWeight: 'normal' }}
            onClick={() => setIsExpanded(true)}
          >
            See All
          </Button>
        )}
      </Group>

      <SimpleGrid cols={{ sm: 2, base: 1 }} spacing='xs' {...simpleGridProps}>
        {sourcesToShow.map((source) => {
          if (!source) return null;
          const { imgSrc, title, subtitle } = getSpotifySearchResultDisplayData(
            {
              item: source,
              itemType: source.type,
            },
          );
          return (
            <SpotifySourceButton
              key={source.id}
              imageSrc={imgSrc}
              title={title}
              subtitle={subtitle}
              onClick={() => onSourceSelect(source)}
            />
          );
        })}
      </SimpleGrid>
    </Stack>
  );
};
