import { Cross1Icon, QuestionMarkIcon } from '@radix-ui/react-icons';
import {
  Avatar,
  Card,
  CardProps,
  Flex,
  IconButton,
  Text,
} from '@radix-ui/themes';
import { ReactNode } from 'react';
import { colors } from '../../../theme/colors';
import { motion, MotionProps } from 'motion/react';

const MotionCard = motion(Card);

type FilterActionSelectedSourceCardProps = {
  imageSrc: string | ReactNode;
  title: string;
  subtitle?: string;
  onRemove: () => void;
} & CardProps &
  MotionProps;

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
    <MotionCard
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px',
        height: 'fit-content',
        minHeight: 50,
        gap: 12,
      }}
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
        <Text wrap='nowrap' css={{ maxWidth: '100%' }} truncate size='2'>
          {title}
        </Text>
        {!!subtitle && (
          <Text
            color='gray'
            size='1'
            wrap='nowrap'
            css={{ maxWidth: '100%' }}
            truncate
            weight='light'
          >
            {subtitle}
          </Text>
        )}
      </Flex>
      <IconButton
        onClick={onRemove}
        variant='ghost'
        color='gray'
        data-override='fix-margin'
      >
        <Cross1Icon />
      </IconButton>
    </MotionCard>
  );
};
