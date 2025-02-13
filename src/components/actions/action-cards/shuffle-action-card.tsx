import { Card, Flex, IconButton, Spinner, Text } from '@radix-ui/themes';
import { ActionsQueries, ModulesQueries } from '../../../queries';
import { BaseActionCardProps } from './types';
import { ModuleActionIcon } from '../module-action-icon';
import { titleCase } from '../../../utils';
import { colors } from '../../../theme/colors';
import { Cross1Icon } from '@radix-ui/react-icons';
import { ACTION_CARD_BASE_STYLES } from './constants';

type ShuffleActionCardProps = BaseActionCardProps<'SHUFFLE'>;

export const ShuffleActionCard = ({ action }: ShuffleActionCardProps) => {
  const deleteActionMutation = ModulesQueries.useRemoveModuleActionMutation(); // TODO: move to ActionsQueries
  const configQuery = ActionsQueries.useShuffleConfig(
    { actionId: action.id },
    { enabled: !!action.id },
  );

  return (
    <Card css={ACTION_CARD_BASE_STYLES}>
      <Flex gap='2' align='center' justify='between'>
        {configQuery.isLoading ? (
          <Spinner />
        ) : (
          <>
            <Flex align='center' gap='2'>
              <ModuleActionIcon
                type='SHUFFLE'
                color={colors.greenDark.green9}
              />
              <Flex direction='column'>
                <Text size='3' css={{ fontWeight: 'semibold' }}>
                  Shuffle
                </Text>
                {!!configQuery.data && (
                  <Text size='2' color='gray'>
                    {titleCase(configQuery.data?.shuffle_type)}
                  </Text>
                )}
              </Flex>
            </Flex>
            <IconButton
              variant='ghost'
              color='gray'
              onClick={() => {
                deleteActionMutation.mutate({ actionId: action.id });
              }}
              loading={deleteActionMutation.isPending}
            >
              <Cross1Icon />
            </IconButton>
          </>
        )}
      </Flex>
    </Card>
  );
};
