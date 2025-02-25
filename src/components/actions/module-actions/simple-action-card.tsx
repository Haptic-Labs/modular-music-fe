import { Card, Flex, IconButton, Text } from '@radix-ui/themes';
import { Database } from '../../../types';
import { ModuleActionIcon } from '../module-action-icon';
import { titleCase } from '../../../utils';
import { ReactNode } from 'react';
import { Cross1Icon } from '@radix-ui/react-icons';
import { colors } from '../../../theme/colors';

type SimpleActionCardProps = {
  actionType: Exclude<
    Database['public']['Enums']['MODULE_ACTION_TYPE'],
    'FILTER' | 'COMBINE' | 'Module'
  >;
  subtitle?: string | ReactNode;
  onRemove: () => void;
};

export const SimpleActionCard = ({
  actionType,
  subtitle,
  onRemove,
}: SimpleActionCardProps) => {
  return (
    <Card>
      <Flex align='center' justify='between' gap='1'>
        <Flex align='center' gap='2'>
          <ModuleActionIcon type={actionType} color={colors.greenDark.green9} />
          <Flex direction='column'>
            <Text>{titleCase(actionType)}</Text>
            {typeof subtitle === 'string' ? (
              <Text size='2' color='gray'>
                {subtitle}
              </Text>
            ) : (
              subtitle
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
    </Card>
  );
};
