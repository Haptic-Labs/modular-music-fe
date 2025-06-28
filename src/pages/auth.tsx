import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../providers';
import { useEffect } from 'react';
import { Loader, Text } from '@mantine/core';

export const AuthPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLogin = async () => {
    const definedPath = searchParams.get('path');
    const decodedPath = decodeURIComponent(definedPath || '/');
    navigate(decodedPath, { replace: true });
  };

  useEffect(() => {
    if (session) handleLogin();
  }, [!!session]);

  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Loader />
      <Text>Logging you in...</Text>
    </div>
  );
};
