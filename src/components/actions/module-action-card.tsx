import { ReactNode, useMemo } from 'react';
import { Database } from '../../types';
import {
  Button,
  ButtonProps,
  Card,
  CardProps,
  Flex,
  IconButton,
  Text,
} from '@radix-ui/themes';
import { ModuleActionIcon } from './module-action-icon';
import { colors } from '../../theme/colors';
import { ModulesQueries } from '../../queries';
import { Cross1Icon, Cross2Icon } from '@radix-ui/react-icons';
import { titleCase } from '../../utils';

const getActionTitleFromType = (
  actionType: Database['public']['Enums']['MODULE_ACTION_TYPE'],
) => {
  switch (actionType) {
    case 'SHUFFLE':
      return 'Shuffle';
    case 'COMBINE':
      return 'Add Sources';
    case 'LIMIT':
      return 'Limit';
    case 'FILTER':
      return 'Filter';
    default:
      return undefined;
  }
};

type ModuleActionCardProps<
  T extends Database['public']['Enums']['MODULE_ACTION_TYPE'],
> = {
  actionType: T;
  action?: Database['public']['Tables']['module_actions']['Row'];
  title?: ReactNode;
  subtitle?: ReactNode;
  isSelected?: boolean;
} & CardProps;

export const ModuleActionCard = <
  T extends Database['public']['Enums']['MODULE_ACTION_TYPE'],
>({
  actionType,
  action,
  title: providedTitle,
  subtitle: providedSubtitle,
  isSelected,
  ...rest
}: ModuleActionCardProps<T>) => {
  const deleteActionMutation = ModulesQueries.useRemoveModuleActionMutation();
  const title =
    providedTitle ?? getActionTitleFromType(actionType) ?? 'Unknown Action';

  const subtitle = useMemo(() => {
    if (!action) return undefined;
    switch (actionType) {
      case 'SHUFFLE':
        return undefined;
      case 'COMBINE':
        return `Sources: ${action.sources}`;
      case 'LIMIT':
        return `Limit: ${action.config.limit}`;
      case 'FILTER':
        return `Filter: ${action.config.filter}`;
      default:
        return undefined;
    }
  }, []);
  // TODO: add accordion for sources

  return (
    <Card
      title={title}
      css={{
        justifyContent: 'space-between',
        height: 64,
        padding: 8,
        paddingRight: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
      {...rest}
    >
      <Flex gap='2' align='center'>
        <ModuleActionIcon
          type={actionType}
          color={isSelected ? 'white' : colors.greenDark.green9}
        />
        <Flex direction='column' gap='1'>
          <Text as='p' truncate>
            {title}
          </Text>
          {!!subtitle && (
            <Text as='p' size='1' color='gray' truncate>
              {subtitle}
            </Text>
          )}
        </Flex>
      </Flex>
      {!!action?.id && (
        <IconButton
          variant='ghost'
          size='3'
          color='gray'
          loading={deleteActionMutation.isPending}
          onClick={() => {
            deleteActionMutation.mutate({ actionId: action?.id });
          }}
        >
          <Cross1Icon />
        </IconButton>
      )}
    </Card>
  );
};
