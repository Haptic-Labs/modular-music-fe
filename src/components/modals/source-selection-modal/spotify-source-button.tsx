import {
  ActionIcon,
  Avatar,
  Button,
  ButtonProps,
  Group,
  Paper,
  PaperProps,
  Stack,
  Text,
} from '@mantine/core';
import { Cross1Icon, QuestionMarkIcon } from '@radix-ui/react-icons';
import { forwardRef, ReactNode, Ref } from 'react';

type BaseProps<RemoveFn extends (() => void) | undefined | never> = {
  imageSrc: string | ReactNode;
  title: string;
  subtitle?: ReactNode;
  isSelected?: boolean;
  disabled?: boolean;
  onRemove?: RemoveFn;
  onClick?: () => void;
};

type SpotifySourceButtonProps<
  RemoveFn extends (() => void) | undefined | never,
> = BaseProps<RemoveFn> &
  (RemoveFn extends undefined | never
    ? Omit<PaperProps, keyof BaseProps<RemoveFn>>
    : Omit<ButtonProps, keyof BaseProps<RemoveFn>>);

export const SpotifySourceButton = forwardRef(
  <RemoveFn extends (() => void) | undefined | never>(
    {
      imageSrc,
      title,
      subtitle,
      isSelected,
      onRemove,
      onClick,
      disabled,
      ...rest
    }: SpotifySourceButtonProps<RemoveFn>,
    ref: RemoveFn extends undefined | never
      ? Ref<HTMLDivElement>
      : Ref<HTMLButtonElement>,
  ) => {
    const combinedTitle = `${title}${subtitle ? ` - ${subtitle}` : ''}`;
    const isUsingIcon = typeof imageSrc !== 'string';
    const icon = (isUsingIcon ? imageSrc : undefined) ?? <QuestionMarkIcon />;

    if (onRemove) {
      const typedRest = rest as Omit<PaperProps, keyof BaseProps<RemoveFn>>;
      return (
        <Paper
          component={Group}
          ref={ref as Ref<HTMLDivElement>}
          p={4}
          css={{
            backgroundColor: 'var(--mantine-color-gray-light)',
          }}
          align='center'
          justify='space-between'
          wrap='nowrap'
          {...typedRest}
        >
          <Group wrap='nowrap' gap='xs'>
            <Avatar
              src={isUsingIcon ? undefined : imageSrc}
              styles={{ placeholder: { backgroundColor: 'transparent' } }}
              css={(theme) =>
                disabled
                  ? { svg: { color: theme.colors.gray[6] } }
                  : { svg: { color: theme.colors.green[8] } }
              }
              radius='sm'
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
              gap={0}
            >
              <Text css={{ maxWidth: '100%', textWrap: 'nowrap' }} truncate>
                {title}
              </Text>
              {!!subtitle && typeof subtitle === 'string' ? (
                <Text truncate size='sm' css={{ opacity: 0.7 }}>
                  {subtitle}
                </Text>
              ) : (
                subtitle
              )}
            </Stack>
          </Group>

          <ActionIcon
            onClick={onRemove}
            color='gray'
            variant='subtle'
            disabled={disabled}
          >
            <Cross1Icon />
          </ActionIcon>
        </Paper>
      );
    }

    const typedRest = rest as Omit<ButtonProps, keyof BaseProps<RemoveFn>>;
    return (
      <Button
        ref={ref as Ref<HTMLButtonElement>}
        justify={onRemove ? 'space-between' : 'start'}
        variant={isSelected ? 'solid' : 'light'}
        color={isSelected ? 'green' : 'gray'}
        disabled={disabled}
        h='100%'
        styles={{
          label: {
            flexGrow: 1,
          },
        }}
        onClick={onClick}
        {...typedRest}
        title={combinedTitle}
        leftSection={
          <Avatar
            src={isUsingIcon ? undefined : imageSrc}
            styles={{ placeholder: { backgroundColor: 'transparent' } }}
            css={(theme) =>
              disabled
                ? { svg: { color: theme.colors.gray[6] } }
                : { svg: { color: theme.colors.green[8] } }
            }
            radius='sm'
          >
            {icon}
          </Avatar>
        }
      >
        <Stack
          align='start'
          css={{
            width: '100%',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
          gap={0}
        >
          <Text css={{ maxWidth: '100%', textWrap: 'nowrap' }} truncate>
            {title}
          </Text>
          {!!subtitle && typeof subtitle === 'string' ? (
            <Text truncate size='sm' css={{ opacity: 0.7 }}>
              {subtitle}
            </Text>
          ) : (
            subtitle
          )}
        </Stack>
      </Button>
    );
  },
);
