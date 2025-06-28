import { Title, Text, Button, Group } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';

export const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <section
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <Title>Oops!</Title>
      <Text>Looks like this page doesn't exist.</Text>
      <Group gap='md'>
        <Button
          onClick={() => {
            navigate(-1);
          }}
        >
          Go Back
        </Button>
        <Button>
          <Link to='/'>Go Home</Link>
        </Button>
      </Group>
    </section>
  );
};
