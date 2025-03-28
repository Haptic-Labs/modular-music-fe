import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Section,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useAuth } from '../../providers';
import { ModulesQueries } from '../../queries';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from '@radix-ui/react-icons';
import { useDisclosure } from '@mantine/hooks';
import { Form, useForm } from '@mantine/form';

export const ModulesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: modules = [] } = ModulesQueries.useUserModulesQuery(
    { userId: user?.id ?? '' },
    { enabled: !!user },
  );

  const [moduleCreationModalIsOpen, moduleCreationModalFns] =
    useDisclosure(false);

  const { mutateAsync: createModule, isPending: isCreatingModule } =
    ModulesQueries.useAddModuleMutation();
  const moduleCreationForm = useForm({
    name: 'module-creation-form',
    initialValues: {
      moduleName: '',
    },
  });

  return (
    <Section py='4' px='2'>
      <Heading size='8'>Modules</Heading>
      <Flex py='2'>
        {modules.map((module) => (
          <Box maxWidth='250px' minWidth='250px' key={module.id}>
            <Card asChild>
              <Link to={`/modules/${module.id}`}>
                <Text weight='bold' size='4'>
                  {module.name}
                </Text>
                {!!module.next_scheduled_run && (
                  <Text size='2'>{module.next_scheduled_run}</Text>
                )}
              </Link>
            </Card>
          </Box>
        ))}
        <Dialog.Root>
          <Dialog.Trigger>
            <Button>
              <PlusIcon />
              Create Module
            </Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth={'min(90vw, 400px)'} asChild>
            <Flex direction='column' gap='2' asChild>
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
                <TextField.Root
                  {...moduleCreationForm.getInputProps('moduleName')}
                  placeholder='Enter a name for your module'
                />
                <Button type='submit' loading={isCreatingModule}>
                  Create Module
                </Button>
              </form>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>
    </Section>
  );
};
