import { ModulesQueries, SpotifyQueries } from '../../queries';
import { Database } from '../../types';
import { SpotifyComponents } from '..';
import { Cross1Icon, Pencil1Icon } from '@radix-ui/react-icons';
import { RecentlyListenedConfigPopover } from '../popovers';
import { useDisclosure } from '@mantine/hooks';
import {
  ActionIcon,
  Card,
  Group,
  Popover,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';

type ModuleSourceCardProps = {
  source: Database['public']['Tables']['module_sources']['Row'];
};

export const ModuleSourceCard = ({ source }: ModuleSourceCardProps) => {
  const {
    data: recentlyListenedConfig,
    isPending: isLoadingRecentlyListenedConfig,
  } = ModulesQueries.useRecentlyListenedConfigQuery(
    {
      sourceId: source.id,
    },
    { enabled: source.type === 'RECENTLY_PLAYED' },
  );
  const [editPopoverOpen, { open: openEditPopover, close: closeEditPopover }] =
    useDisclosure(false);
  const {
    mutate: updateRecentlyListened,
    isPending: isUpdatingRecentlyListened,
  } = ModulesQueries.useAddRecentlyListenedSource({
    onSuccess: () => {
      closeEditPopover();
    },
  });
  const { mutate: removeSource, isPending: isRemoving } =
    ModulesQueries.useRemoveModuleSourceMutation();

  const { data: likedSongsLength, isLoading: likedSongsLengthIsLoading } =
    SpotifyQueries.useLikedSongsLength({
      enabled: source.type === 'LIKED_SONGS',
    });

  return (
    <Card
      radius='md'
      css={{
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: isRemoving || isUpdatingRecentlyListened ? 0.5 : 1,
      }}
      px='md'
      py='xs'
    >
      <Group gap='md' align='center'>
        <SpotifyComponents.SourceImage
          src={source.image_url ?? undefined}
          sourceType={source.type}
          css={{
            width: 30,
            height: 30,
          }}
        />
        <Stack gap={0}>
          <Text>{source.title}</Text>
          {source.type === 'RECENTLY_PLAYED' ? (
            <Skeleton
              visible={isLoadingRecentlyListenedConfig}
              css={{ opacity: 0.5 }}
            >
              <Text c='gray'>
                {`Last ${recentlyListenedConfig?.quantity.toLocaleString()} ${recentlyListenedConfig?.interval.slice(0, recentlyListenedConfig.quantity === 1 ? -1 : undefined).toLowerCase()}`}
              </Text>
            </Skeleton>
          ) : source.type === 'LIKED_SONGS' ? (
            <Skeleton
              visible={likedSongsLengthIsLoading}
              css={{ opacity: 0.5 }}
            >
              <Text c='gray'>{`${likedSongsLength?.toLocaleString()} songs`}</Text>
            </Skeleton>
          ) : null}
        </Stack>
      </Group>
      <Stack gap='4' mr='2' align='center'>
        {!!recentlyListenedConfig && (
          <Popover
            opened={editPopoverOpen}
            onChange={(open) => (open ? openEditPopover() : closeEditPopover())}
          >
            <Popover.Target>
              <ActionIcon
                color='gray'
                variant='subtle'
                loading={isUpdatingRecentlyListened}
              >
                <Pencil1Icon />
              </ActionIcon>
            </Popover.Target>
            <RecentlyListenedConfigPopover
              initialConfig={recentlyListenedConfig}
              onSave={({ interval, quantity }) => {
                updateRecentlyListened({
                  p_interval: interval,
                  p_quantity: quantity,
                  p_module_id: source.module_id,
                  p_source_id: source.id,
                });
              }}
            />
          </Popover>
        )}
        <ActionIcon
          color='gray'
          variant='subtle'
          onClick={() => {
            removeSource({ sourceId: source.id });
          }}
          loading={isRemoving}
        >
          <Cross1Icon />
        </ActionIcon>
      </Stack>
    </Card>
  );
};
