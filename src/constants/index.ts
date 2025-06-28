import { SimpleGrid } from '@mantine/core';
import { ComponentProps } from 'react';

export const MODULE_GRID_CONFIG: ComponentProps<typeof SimpleGrid>['cols'] = {
  base: 2,
  sm: 2,
  xs: 1,
  lg: 3,
  xl: 4,
};
