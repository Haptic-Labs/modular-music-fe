import {
  Avatar,
  Button,
  Card,
  Dialog,
  Flex,
  IconButton,
  Text,
} from '@radix-ui/themes';
import { Database } from '../../../types';
import { ModuleActionIcon } from '../module-action-icon';
import { titleCase } from '../../../utils';
import {
  CornerBottomLeftIcon,
  Cross1Icon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import { colors } from '../../../theme/colors';
import { useModuleActionData } from './use-module-action-data';
import { LikedSongsIcon, RecentlyListenedIcon } from '../../../ui';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FilterActionConfigModal } from '../config-modals';
import { ModulesQueries } from '../../../queries';
import { useDisclosure } from '@mantine/hooks';

const ACTION_TYPES_WITH_SOURCES: Database['public']['Enums']['MODULE_ACTION_TYPE'][] =
  ['FILTER', 'COMBINE'];

const MotionFlex = motion.create(Flex);

type SimpleActionCardProps = {
  action: Database['public']['Tables']['module_actions']['Row'];
  onRemove: () => void;
};

export const ActionCard = ({ action, onRemove }: SimpleActionCardProps) => {
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const { subtitle, sources, recentlyListenedConfig } = useModuleActionData({
    actionId: action.id,
    actionType: action.type,
  });
  const [editSourcesIsOpen, editSourcesFns] = useDisclosure(false);

  const { mutateAsync: replaceSources, isPending: isSaving } =
    ModulesQueries.useReplaceModuleFilterSources();

  return (
    <Card>
      <Flex align='center' justify='between' gap='1'>
        <Flex align='center' gap='2'>
          <ModuleActionIcon
            type={action.type}
            color={colors.greenDark.green9}
          />
          <Flex direction='column'>
            <Text>{titleCase(action.type)}</Text>
            {!!subtitle && (
              <Text size='2' color='gray'>
                {subtitle}
              </Text>
            )}
          </Flex>
        </Flex>
        <Flex gap='1' align='center'>
          {ACTION_TYPES_WITH_SOURCES.includes(action.type) && (
            <Button
              onClick={() => setSourcesExpanded((prev) => !prev)}
              variant='ghost'
              data-override='fix-margin'
            >
              {sourcesExpanded ? 'Hide Sources' : 'View Sources'}
            </Button>
          )}
          <IconButton
            onClick={onRemove}
            variant='ghost'
            data-override='fix-margin'
            color='gray'
          >
            <Cross1Icon />
          </IconButton>
        </Flex>
      </Flex>
      <AnimatePresence>
        {!!sources?.length && sourcesExpanded && (
          <MotionFlex
            gap='1'
            align='center'
            css={{ width: '100%' }}
            initial={{
              marginTop: 0,
              paddingTop: 0,
              borderTop: `1px solid ${colors.grayDark.gray5}00`,
              height: 0,
              overflow: 'clip',
            }}
            animate={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: `1px solid ${colors.grayDark.gray5}`,
              height: 'auto',
              overflow: 'clip',
            }}
            exit={{
              marginTop: 0,
              paddingTop: 0,
              borderTop: `1px solid ${colors.grayDark.gray5}00`,
              height: 0,
              overflow: 'clip',
            }}
          >
            <CornerBottomLeftIcon color={colors.grayDark.gray8} />
            {!!sourcesExpanded &&
              sources.map((source, i) => (
                <Flex
                  key={source.id + i}
                  align='center'
                  css={
                    i !== sources.length - 1
                      ? {
                          borderRight: `1px solid ${colors.grayDark.gray5}`,
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
                    fallback={
                      source.source_type === 'RECENTLY_PLAYED' ? (
                        <RecentlyListenedIcon css={{ width: 20, height: 20 }} />
                      ) : source.source_type === 'LIKED_SONGS' ? (
                        <LikedSongsIcon css={{ width: 20, height: 20 }} />
                      ) : (
                        <div></div>
                      )
                    }
                    css={
                      !!source.image_url && {
                        gap: 8,
                      }
                    }
                  />
                  <Flex direction='column'>
                    <Text size='2'>{source.title}</Text>
                    {!!recentlyListenedConfig &&
                      source.source_type === 'RECENTLY_PLAYED' && (
                        <Text color='gray' size='1'>
                          {`${recentlyListenedConfig.quantity.toLocaleString()} ${titleCase(recentlyListenedConfig.interval)}`}
                        </Text>
                      )}
                    {source.source_type !== 'RECENTLY_PLAYED' && (
                      <Text color='gray' size='1'>
                        {titleCase(source.source_type.replace('_', ' '))}
                      </Text>
                    )}
                  </Flex>
                </Flex>
              ))}
            <Dialog.Root
              open={editSourcesIsOpen}
              onOpenChange={(open) =>
                open ? editSourcesFns.open() : editSourcesFns.close()
              }
            >
              <Dialog.Trigger>
                <IconButton
                  variant='ghost'
                  css={{ marginLeft: 16 }}
                  title='Edit Filter Sources'
                  onClick={() => {}}
                >
                  <Pencil2Icon />
                </IconButton>
              </Dialog.Trigger>
              <FilterActionConfigModal
                isSaving={isSaving}
                onSave={(selectedSources) => {
                  const newRecentlyListenedConfig = selectedSources.find(
                    (source) => source.source_type === 'RECENTLY_PLAYED',
                  )?.recently_listened_config;

                  const newSources = selectedSources.reduce<
                    Database['public']['Tables']['filter_action_sources']['Insert'][]
                  >(
                    (
                      acc,
                      {
                        source_type,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        id,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        action_id,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        recently_listened_config,
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
                initialSelectedSources={sources.map((source) => ({
                  ...source,
                  recently_listened_config:
                    source.source_type === 'RECENTLY_PLAYED'
                      ? (recentlyListenedConfig ?? null)
                      : null,
                }))}
              />
            </Dialog.Root>
          </MotionFlex>
        )}
      </AnimatePresence>
    </Card>
  );
};
