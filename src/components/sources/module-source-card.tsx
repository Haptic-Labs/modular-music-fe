import {
  Card,
  Flex,
  IconButton,
  Popover,
  Skeleton,
  Text,
} from '@radix-ui/themes';
import { ModulesQueries, SpotifyQueries } from '../../queries';
import { Database } from '../../types';
import { SpotifyComponents } from '..';
import { Cross1Icon, Pencil1Icon } from '@radix-ui/react-icons';
import { RecentlyListenedConfigPopover } from '../popovers';
import { useDisclosure } from '@mantine/hooks';

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
      css={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: isRemoving || isUpdatingRecentlyListened ? 0.5 : 1,
      }}
    >
      <Flex gap='2' align='center'>
        <SpotifyComponents.SourceImage
          src={source.image_url ?? undefined}
          sourceType={source.type}
          css={{
            width: 20,
            height: 20,
            padding: 4,
          }}
        />
        <Flex direction='column'>
          <Text>{source.title}</Text>
          {source.type === 'RECENTLY_PLAYED' ? (
            <Skeleton
              loading={isLoadingRecentlyListenedConfig}
              css={{ opacity: 0.5 }}
            >
              <Text color='gray' size='2'>
                {`Last ${recentlyListenedConfig?.quantity.toLocaleString()} ${recentlyListenedConfig?.interval.slice(0, recentlyListenedConfig.quantity === 1 ? -1 : undefined).toLowerCase()}`}
              </Text>
            </Skeleton>
          ) : source.type === 'LIKED_SONGS' ? (
            <Skeleton
              loading={likedSongsLengthIsLoading}
              css={{ opacity: 0.5 }}
            >
              <Text
                color='gray'
                size='2'
              >{`${likedSongsLength?.toLocaleString()} songs`}</Text>
            </Skeleton>
          ) : null}
        </Flex>
      </Flex>
      <Flex gap='4' mr='2' align='center'>
        {!!recentlyListenedConfig && (
          <Popover.Root
            open={editPopoverOpen}
            onOpenChange={(open) =>
              open ? openEditPopover() : closeEditPopover()
            }
          >
            <Popover.Trigger>
              <IconButton
                color='gray'
                variant='ghost'
                loading={isUpdatingRecentlyListened}
              >
                <Pencil1Icon />
              </IconButton>
            </Popover.Trigger>
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
          </Popover.Root>
        )}
        <IconButton
          color='gray'
          variant='ghost'
          onClick={() => {
            removeSource({ sourceId: source.id });
          }}
          loading={isRemoving}
        >
          <Cross1Icon />
        </IconButton>
      </Flex>
    </Card>
  );
};
