import { Database } from '../../../types';
import { ModuleActionIcon } from '../module-action-icon';
import {
  convertFilterActionSourcesToSelectedSources,
  titleCase,
} from '../../../utils';
import {
  CornerBottomLeftIcon,
  Cross1Icon,
  DragHandleDots2Icon,
  Pencil1Icon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import { useModuleActionData } from './use-module-action-data';
import { LikedSongsIcon, RecentlyListenedIcon } from '../../../ui';
import { ComponentProps, forwardRef, HTMLAttributes, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ModulesQueries } from '../../../queries';
import { useDisclosure } from '@mantine/hooks';
import { SourceSelectionModal } from '../..';
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';

const ACTION_TYPES_WITH_SOURCES: Database['public']['Enums']['MODULE_ACTION_TYPE'][] =
  ['FILTER', 'COMBINE'];

const MotionGroup = motion.create(Group);

type SimpleActionCardProps = {
  action: Database['public']['Tables']['module_actions']['Row'];
  onRemove: () => void;
  handle?: boolean;
  handleProps?: HTMLAttributes<HTMLDivElement>;
  onEdit?: () => void;
} & Omit<ComponentProps<typeof Card>, 'ref' | 'children'>;

export const ActionCard = forwardRef<HTMLDivElement, SimpleActionCardProps>(
  ({ action, onRemove, handle, handleProps, onEdit, ...rest }, ref) => {
    const theme = useMantineTheme();
    const [sourcesExpanded, setSourcesExpanded] = useState(false);
    const { subtitle, sources, recentlyListenedConfig } = useModuleActionData({
      actionId: action.id,
      actionType: action.type,
    });
    const [editSourcesIsOpen, editSourcesFns] = useDisclosure(false);

    const { mutateAsync: replaceSources, isPending: isSaving } =
      ModulesQueries.useReplaceModuleFilterSources();

    // TODO: add replaceCombinSources mutation

    return (
      <Card {...rest} ref={ref}>
        <Group align='center' justify='between' gap='sm'>
          <Group align='center' gap='md'>
            {!!handle && (
              <div {...handleProps}>
                <DragHandleDots2Icon />
              </div>
            )}
            <ModuleActionIcon type={action.type} />
            <Stack>
              <Text>{titleCase(action.type)}</Text>
              {!!subtitle && <Text c='gray'>{subtitle}</Text>}
            </Stack>
          </Group>
          <Group gap='1' align='center'>
            {ACTION_TYPES_WITH_SOURCES.includes(action.type) && (
              <Button
                onClick={() => setSourcesExpanded((prev) => !prev)}
                variant='ghost'
                data-override='fix-margin'
              >
                {sourcesExpanded ? 'Hide Sources' : 'View Sources'}
              </Button>
            )}
            {!!onEdit && (
              <ActionIcon
                onClick={onEdit}
                variant='ghost'
                data-override='fix-margin'
                color='gray'
              >
                <Pencil1Icon />
              </ActionIcon>
            )}

            <ActionIcon
              onClick={onRemove}
              variant='ghost'
              data-override='fix-margin'
              color='gray'
            >
              <Cross1Icon />
            </ActionIcon>
          </Group>
        </Group>
        <AnimatePresence>
          {!!sources?.length && sourcesExpanded && (
            <MotionGroup
              gap='1'
              align='center'
              css={{ width: '100%' }}
              initial={{
                marginTop: 0,
                paddingTop: 0,
                borderTop: `1px solid ${theme.colors.gray[5]}00`,
                height: 0,
                overflow: 'clip',
              }}
              animate={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: `1px solid ${theme.colors.gray[5]}`,
                height: 'auto',
                overflow: 'clip',
              }}
              exit={{
                marginTop: 0,
                paddingTop: 0,
                borderTop: `1px solid ${theme.colors.gray[5]}00`,
                height: 0,
                overflow: 'clip',
              }}
            >
              <CornerBottomLeftIcon color={theme.colors.gray[8]} />
              {!!sourcesExpanded &&
                sources.map((source, i) => (
                  <Group
                    key={source.id + i}
                    align='center'
                    css={
                      i !== sources.length - 1
                        ? {
                            borderRight: `1px solid ${theme.colors.gray[5]}`,
                            padding: '4px 16px 4px 4px',
                          }
                        : {
                            marginLeft: 8,
                            gap: 10,
                          }
                    }
                    gap={
                      source.source_type !== 'LIKED_SONGS' &&
                      source.source_type !== 'RECENTLY_PLAYED'
                        ? '2'
                        : undefined
                    }
                  >
                    <Avatar
                      src={source.image_url ?? undefined}
                      css={
                        !!source.image_url && {
                          gap: 8,
                        }
                      }
                    >
                      {source.source_type === 'RECENTLY_PLAYED' ? (
                        <RecentlyListenedIcon css={{ width: 20, height: 20 }} />
                      ) : source.source_type === 'LIKED_SONGS' ? (
                        <LikedSongsIcon css={{ width: 20, height: 20 }} />
                      ) : (
                        <div></div>
                      )}
                    </Avatar>
                    <Stack>
                      <Text>{source.title}</Text>
                      {!!recentlyListenedConfig &&
                        source.source_type === 'RECENTLY_PLAYED' && (
                          <Text c='gray'>
                            {`${recentlyListenedConfig.quantity.toLocaleString()} ${titleCase(recentlyListenedConfig.interval)}`}
                          </Text>
                        )}
                      {source.source_type !== 'RECENTLY_PLAYED' && (
                        <Text c='gray'>
                          {titleCase(source.source_type.replace('_', ' '))}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                ))}
              <ActionIcon
                variant='ghost'
                css={{ marginLeft: 16 }}
                title='Edit Filter Sources'
                onClick={editSourcesFns.open}
              >
                <Pencil2Icon />
              </ActionIcon>
              <SourceSelectionModal
                opened={editSourcesIsOpen}
                onClose={editSourcesFns.close}
                onChange={(open) =>
                  open ? editSourcesFns.open() : editSourcesFns.close()
                }
                isSaving={isSaving}
                onSave={(selectedSources) => {
                  const newRecentlyListenedConfig = selectedSources.find(
                    (source) => source.source_type === 'RECENTLY_PLAYED',
                  )?.recently_listened_config;

                  const newSources = selectedSources.reduce<
                    Parameters<typeof replaceSources>[0]['newSources']
                  >(
                    (
                      acc,
                      {
                        source_type,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        recently_listened_config,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        subtitle,
                        ...rest
                      },
                    ) => {
                      if (source_type)
                        acc.push({
                          ...rest,
                          action_id: action.id,
                          source_type,
                        });
                      return acc;
                    },
                    [],
                  );

                  replaceSources(
                    {
                      actionType: action.type,
                      actionId: action.id,
                      newSources,
                      recentlyPlayedConfig:
                        newRecentlyListenedConfig?.quantity &&
                        newRecentlyListenedConfig?.interval
                          ? {
                              quantity: newRecentlyListenedConfig.quantity,
                              interval: newRecentlyListenedConfig.interval,
                            }
                          : undefined,
                    },
                    {
                      onSuccess: () => {
                        editSourcesFns.close();
                      },
                    },
                  );
                }}
                initialSelectedSources={convertFilterActionSourcesToSelectedSources(
                  sources,
                  recentlyListenedConfig ?? undefined,
                )}
                isOpen={editSourcesIsOpen}
                onCancel={editSourcesFns.close}
                title='Select Filter Sources:'
              />
            </MotionGroup>
          )}
        </AnimatePresence>
      </Card>
    );
  },
);
