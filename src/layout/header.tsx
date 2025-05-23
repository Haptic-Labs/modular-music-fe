import { Button } from '@mantine/core';
import { Wordmark } from '../assets';
import { useAuth } from '../providers';

export const Header = () => {
  const { session, login, logout } = useAuth();

  return (
    <nav
      css={(theme) => ({
        display: 'flex',
        maxWidth: '100vw',
        height: 70,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: theme.colors.dark[9],
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
