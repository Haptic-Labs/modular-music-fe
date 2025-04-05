import { QuestionMarkIcon } from '@radix-ui/react-icons';
import { Avatar, Button, ButtonProps, Flex, Text } from '@radix-ui/themes';
import { forwardRef, ReactNode } from 'react';
import { colors } from '../../../theme/colors';

type SpotifySourceButtonProps = {
  imageSrc: string | ReactNode;
  title: string;
  subtitle?: string;
  isSelected?: boolean;
  removable?: boolean;
} & Omit<ButtonProps, 'title' | 'subtitle' | 'imageSrc'>;

export const SpotifySourceButton = forwardRef<
  HTMLButtonElement,
  SpotifySourceButtonProps
>(({ imageSrc, title, subtitle, isSelected, removable, ...rest }, ref) => {
  // TODO: implement removable
  const combinedTitle = `${title}${subtitle ? ` - ${subtitle}` : ''}`;
  const isUsingIcon = typeof imageSrc !== 'string';
  const icon = (isUsingIcon ? imageSrc : undefined) ?? <QuestionMarkIcon />;

  return (
    <Button
      ref={ref}
      css={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        height: 'fit-content',
        minHeight: 50,
      }}
      size='3'
      variant={isSelected ? 'solid' : 'soft'}
      color={isSelected ? 'green' : 'gray'}
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
    </Button>
  );
});
