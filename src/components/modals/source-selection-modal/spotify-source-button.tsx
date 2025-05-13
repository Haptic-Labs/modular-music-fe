import {
  ActionIcon,
  Avatar,
  Button,
  ButtonProps,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { Cross1Icon, QuestionMarkIcon } from '@radix-ui/react-icons';
import { forwardRef, ReactNode } from 'react';

type SpotifySourceButtonProps = {
  imageSrc: string | ReactNode;
  title: string;
  subtitle?: string;
  isSelected?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
} & Omit<ButtonProps, 'title' | 'subtitle' | 'imageSrc'>;

export const SpotifySourceButton = forwardRef<
  HTMLButtonElement,
  SpotifySourceButtonProps
>(
  (
    {
      imageSrc,
      title,
      subtitle,
      isSelected,
      onRemove,
      disabled,
      ...buttonProps
    },
    ref,
  ) => {
    // TODO: implement removable
    const combinedTitle = `${title}${subtitle ? ` - ${subtitle}` : ''}`;
    const isUsingIcon = typeof imageSrc !== 'string';
    const icon = (isUsingIcon ? imageSrc : undefined) ?? <QuestionMarkIcon />;
    const interactable = !!buttonProps.onClick;

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
        variant={isSelected ? 'solid' : 'soft'}
        color={isSelected ? 'green' : 'gray'}
        disabled={disabled}
        {...buttonProps}
        title={combinedTitle}
      >
        <Group align='center' gap='2'>
          <Avatar
            src={isUsingIcon ? undefined : imageSrc}
            css={(theme) => ({
              padding: isUsingIcon ? 4 : undefined,
              backgroundColor: theme.colors.green[9],
            })}
          >
            {icon}
          </Avatar>
          <Stack
            align='start'
            css={{
              width: '100%',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            <Text css={{ maxWidth: '100%', textWrap: 'nowrap' }} truncate>
              {title}
            </Text>
            {!!subtitle && (
              <Text
                c='gray'
                css={{ maxWidth: '100%', textWrap: 'nowrap', fontWeight: 400 }}
                truncate
              >
                {subtitle}
              </Text>
            )}
          </Stack>
        </Group>
        {!!onRemove && (
          <ActionIcon
            onClick={onRemove}
            color='gray'
            variant='ghost'
            data-override='fix-margin'
            disabled={disabled}
          >
            <Cross1Icon />
          </ActionIcon>
        )}
      </Button>
    );
  },
);
