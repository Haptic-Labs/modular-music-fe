import { Avatar, Card, Flex, IconButton, Text } from '@radix-ui/themes';
import { Database } from '../../../types';
import { ModuleActionIcon } from '../module-action-icon';
import { titleCase } from '../../../utils';
import { CaretDownIcon, Cross1Icon } from '@radix-ui/react-icons';
import { colors } from '../../../theme/colors';
import { useModuleActionData } from './use-module-action-data';
import { LikedSongsIcon, RecentlyListenedIcon } from '../../../ui';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

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
        <IconButton
          onClick={onRemove}
          variant='ghost'
          data-override='fix-margin'
          color='gray'
        >
          <Cross1Icon />
        </IconButton>
      </Flex>
      {!!sources?.length && (
        <MotionFlex direction='column'>
          <Flex justify='between'>
            <Text weight='bold' size='2'>
              Sources:
            </Text>
            <IconButton
              variant='ghost'
              data-override='fix-margin'
              color='gray'
              onClick={() => setSourcesExpanded((prev) => !prev)}
            >
              <CaretDownIcon
                css={{
                  rotate: sourcesExpanded ? '180deg' : '0deg',
                  transition: 'rotate 300ms ease-in-out',
                }}
              />
            </IconButton>
          </Flex>
          <AnimatePresence>
            {!!sourcesExpanded &&
              sources.map((source) => (
                <MotionFlex
                  key={source.id}
                  align='center'
                  initial={{
                    marginTop: 0,
                    paddingTop: 0,
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
                    height: 0,
                    overflow: 'clip',
                  }}
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
                  />
                  <Flex direction='column'>
                    <Text size='2'>{source.title}</Text>
                    {!!recentlyListenedConfig && (
                      <Text color='gray' size='1'>
                        {`${recentlyListenedConfig.quantity.toLocaleString()} ${titleCase(recentlyListenedConfig.interval)}`}
                      </Text>
                    )}
                  </Flex>
                </MotionFlex>
              ))}
          </AnimatePresence>
        </MotionFlex>
      )}
    </Card>
  );
};
