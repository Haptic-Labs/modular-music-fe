import { useAuth } from '../../providers';
import { ModulesQueries } from '../../queries';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from '@radix-ui/react-icons';
import { useForm } from '@mantine/form';
import {
  Box,
  Card,
  Title,
  Text,
  Modal,
  Button,
  TextInput,
  Group,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export const ModulesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: modules = [] } = ModulesQueries.useUserModulesQuery(
    { userId: user?.id ?? '' },
    { enabled: !!user },
  );

  const { mutateAsync: createModule, isPending: isCreatingModule } =
    ModulesQueries.useAddModuleMutation();
  const moduleCreationForm = useForm({
    name: 'module-creation-form',
    initialValues: {
      moduleName: '',
    },
  });
  const [creationModalOpen, creationModalFns] = useDisclosure(false);

  return (
    <section
      css={(theme) => ({
        padding: `${theme.spacing.md} ${theme.spacing.sm}`,
      })}
    >
      <Title>Modules</Title>
      <Group py='2'>
        {modules.map((module) => (
          <Box maw='250px' miw='250px' key={module.id}>
            <Card component={Link} to={`/modules/${module.id}`}>
              <Text css={{ fontWeight: 'bold' }}>{module.name}</Text>
              {!!module.next_scheduled_run && (
                <Text>{module.next_scheduled_run}</Text>
              )}
            </Card>
          </Box>
        ))}
        <Modal opened={creationModalOpen} onClose={creationModalFns.close}>
          <Button leftSection={<PlusIcon />}>Create Module</Button>
          <Stack maw={'min(90vw, 400px)'} gap='2'>
            <form
              onSubmit={moduleCreationForm.onSubmit(async (values) => {
                const newModule = await createModule({
                  user_id: user?.id ?? '',
                  name: values.moduleName,
                });

                navigate(`/modules/${newModule.id}`, { replace: false });
              })}
            >
              <Text>Create a new module:</Text>
              <TextInput
                {...moduleCreationForm.getInputProps('moduleName')}
                description='Enter a name for your module'
                placeholder='Module name'
              />
              <Button type='submit' loading={isCreatingModule}>
                Create Module
              </Button>
            </form>
          </Stack>
        </Modal>
      </Group>
    </section>
  );
};
