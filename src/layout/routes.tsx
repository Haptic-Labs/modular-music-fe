/* eslint-disable react-refresh/only-export-components */
import { RouteObject } from 'react-router-dom';
import { AppLayout } from '.';
import { HomePage, PageNotFound } from '../pages';
import { AuthPage } from '../pages/auth';
import { ModulePage, ModulesPage } from '../pages/modules';

export const TOP_LEVEL_ROUTES: RouteObject[] = [
  {
    index: true,
    element: <HomePage />,
    id: 'Home',
  },
  {
    path: '/modules',
    element: <ModulesPage />,
    id: 'Modules',
  },
] as const;

export const ROUTES: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      ...TOP_LEVEL_ROUTES,
      {
        path: '/modules/:moduleId',
        element: <ModulePage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '*',
    element: <PageNotFound />,
  },
] as const;
