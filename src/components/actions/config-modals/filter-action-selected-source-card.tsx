import { QuestionMarkIcon } from '@radix-ui/react-icons';
import { Avatar, Card, CardProps, Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import { colors } from '../../../theme/colors';

type FilterActionSelectedSourceCardProps = {
  imageSrc: string | ReactNode;
  title: string;
  subtitle?: string;
  onRemove: () => void;
} & CardProps;

export const FilterActionSelectedSourceCard = ({
  imageSrc,
  title,
  subtitle,
  onRemove,
  ...rest
}: FilterActionSelectedSourceCardProps) => {
  const combinedTitle = `${title}${subtitle ? ` - ${subtitle}` : ''}`;
  const isUsingIcon = typeof imageSrc !== 'string';
  const icon = (isUsingIcon ? imageSrc : undefined) ?? <QuestionMarkIcon />;

  return (
    <Card
      css={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        height: 'fit-content',
        minHeight: 50,
      }}
      size='3'
      {...rest}
      title={combinedTitle}
    >
      <Avatar
        src={isUsingIcon ? undefined : imageSrc}
        asChild
        fallback={icon}
        css={{
          padding: isUsingIcon ? 4 : undefined,
          backgroundColor: colors.greenDark.green9,
        }}
      >
        <figure />
      </Avatar>
      <Flex
        direction='column'
        align='start'
        css={{ width: '100%', textOverflow: 'ellipsis', overflow: 'hidden' }}
      >
        <Text wrap='nowrap' css={{ maxWidth: '100%' }} truncate>
          {title}
        </Text>
        {!!subtitle && (
          <Text
            color='gray'
            size='2'
            wrap='nowrap'
            css={{ maxWidth: '100%' }}
            truncate
            weight='light'
          >
            {subtitle}
          </Text>
        )}
      </Flex>
    </Card>
  );
};
