import { Button, darken } from '@mantine/core';
import { Wordmark } from '../assets';
import { useAuth } from '../providers';

export const Header = () => {
  const { session, login, logout } = useAuth();

  return (
    <nav
      css={(theme) => ({
        display: 'flex',
        maxWidth: '100vw',
        height: 60,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: darken(theme.colors.dark[8], 0.2),
      })}
    >
      <Wordmark
        variant='dark'
        css={{
          height: '80%',
          width: 'auto',
        }}
      />
      <Button
        onClick={() => {
          if (session) {
            logout();
          } else {
            login();
          }
        }}
      >
        {session ? 'Logout' : 'Login'}
      </Button>
    </nav>
  );
};
