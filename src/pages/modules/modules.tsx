import { useAuth } from '../../providers';
import { ModulesQueries } from '../../queries';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from '@radix-ui/react-icons';
import { useForm } from '@mantine/form';
import {
  Title,
  Modal,
  Button,
  TextInput,
  Stack,
  SimpleGrid,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export const ModulesPage = () => {
  const theme = useMantineTheme();
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
      <SimpleGrid
        py='2'
        cols={{
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 5,
        }}
        spacing='xs'
      >
        {modules.map((module) => (
          <Button
            key={module.id}
            component={Link}
            to={`/modules/${module.id}`}
            variant='light'
            color='gray'
            h={60}
          >
            {module.name}
          </Button>
        ))}
        <Button
          h='auto'
          leftSection={<PlusIcon width={20} height={20} />}
          variant='light'
          color='gray'
          justify='start'
          onClick={creationModalFns.open}
        >
          Create Module
        </Button>
      </SimpleGrid>
      <Modal
        opened={creationModalOpen}
        onClose={creationModalFns.close}
        title='Create a new module:'
        centered
        styles={{ title: { fontSize: theme.fontSizes.lg } }}
      >
        <form
          onSubmit={moduleCreationForm.onSubmit(async (values) => {
            const newModule = await createModule({
              user_id: user?.id ?? '',
              name: values.moduleName,
            });

            navigate(`/modules/${newModule.id}`, { replace: false });
          })}
        >
          <Stack maw={'min(90vw, 400px)'} gap='sm'>
            <TextInput
              {...moduleCreationForm.getInputProps('moduleName')}
              description='Enter a name for your module'
              placeholder='Module name'
              data-autofocus
            />
            <Button type='submit' loading={isCreatingModule}>
              Create Module
            </Button>
          </Stack>
        </form>
      </Modal>
    </section>
  );
};
