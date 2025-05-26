import { useMantineTheme } from '@mantine/core';
import { Database } from '../../types';
import {
  IconArrowsShuffle,
  IconComponents,
  IconFilter,
  IconLayoutAlignTop,
  IconMusicPlus,
  IconProps,
} from '@tabler/icons-react';

type ModuleActionIconProps = {
  type: Database['public']['Enums']['MODULE_ACTION_TYPE'];
} & IconProps;

export const ModuleActionIcon = ({
  type,
  color: providedColor,
  ...rest
}: ModuleActionIconProps) => {
  const theme = useMantineTheme();
  const color = providedColor || theme.colors.green[5];
  switch (type) {
    case 'SHUFFLE':
      return <IconArrowsShuffle color={color} {...rest} />;
    case 'LIMIT':
      return <IconLayoutAlignTop color={color} {...rest} />;
    case 'FILTER':
      return <IconFilter color={color} {...rest} />;
    case 'MODULE':
      return <IconComponents color={color} {...rest} />;
    case 'COMBINE':
      return <IconMusicPlus color={color} {...rest} />;
  }
};
