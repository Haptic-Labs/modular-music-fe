import { Cross1Icon, QuestionMarkIcon } from '@radix-ui/react-icons';
import {
  Avatar,
  Button,
  ButtonProps,
  Flex,
  IconButton,
  Text,
} from '@radix-ui/themes';
import { forwardRef, ReactNode } from 'react';
import { colors } from '../../../theme/colors';

type SpotifySourceButtonProps = {
  imageSrc: string | ReactNode;
  title: string;
  subtitle?: string;
  isSelected?: boolean;
  onRemove?: () => void;
} & Omit<ButtonProps, 'title' | 'subtitle' | 'imageSrc'>;

export const SpotifySourceButton = forwardRef<
  HTMLButtonElement,
  SpotifySourceButtonProps
>(
  (
    { imageSrc, title, subtitle, isSelected, onRemove, disabled, ...rest },
    ref,
  ) => {
    // TODO: implement removable
    const combinedTitle = `${title}${subtitle ? ` - ${subtitle}` : ''}`;
    const isUsingIcon = typeof imageSrc !== 'string';
    const icon = (isUsingIcon ? imageSrc : undefined) ?? <QuestionMarkIcon />;
    const interactable = !!rest.onClick || !!rest.onClickCapture;

    return (
      <Button
        ref={ref}
        css={[
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px',
            height: 'fit-content',
            minHeight: 50,
          },
          !interactable && {
            ':hover': {
              backgroundColor: 'var(--accent-a3)',
              cursor: 'default',
            },
          },
          disabled && {
            opacity: 0.7,
          },
        ]}
        size='3'
        variant={isSelected ? 'solid' : 'soft'}
        color={isSelected ? 'green' : 'gray'}
        disabled={disabled}
        {...rest}
        title={combinedTitle}
      >
        <Flex align='center' gap='2'>
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
            css={{
              width: '100%',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
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
        </Flex>
        {!!onRemove && (
          <IconButton
            onClick={onRemove}
            color='gray'
            variant='ghost'
            data-override='fix-margin'
            disabled={disabled}
          >
            <Cross1Icon />
          </IconButton>
        )}
      </Button>
    );
  },
);
