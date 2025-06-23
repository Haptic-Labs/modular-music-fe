import { ReactNode } from 'react';
import { useModulesRunningListener } from './use-modules-running-listener';

export const WSProvider = ({ children }: { children: ReactNode }) => {
  useModulesRunningListener();

  return children;
};
