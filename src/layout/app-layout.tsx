import { Header } from './header';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { TOP_LEVEL_ROUTES } from './routes';
import { Button, darken, Stack } from '@mantine/core';

export const AppLayout = () => {
  const location = useLocation();
  const currentTopLevelRoute = location.pathname.split('/')[1];

  return (
    <div
      css={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <Header />
      <div
        css={{
          display: 'flex',
          height: '100%',
        }}
      >
        <Stack
          component='nav'
          css={(theme) => ({
            backgroundColor: darken(theme.colors.dark[8], 0.2),
          })}
          p='sm'
          gap='sm'
          h='100%'
          w='350px'
        >
          {TOP_LEVEL_ROUTES.map((route) => {
            const isActive =
              (route.path?.replace('/', '') ?? '') === currentTopLevelRoute;

            return (
              <Button
                justify='left'
                component={Link}
                key={`route-button-${route.path}`}
                variant={isActive ? 'light' : 'subtle'}
                css={{
                  width: '100%',
                  justifyContent: 'flex-start',
                }}
                to={route.path ?? '/'}
                size='md'
              >
                {route.id}
              </Button>
            );
          })}
        </Stack>
        <main
          css={(theme) => ({
            height: '100%',
            width: '100%',
            overflow: 'auto',
            backgroundColor: theme.colors.dark[9],
          })}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
