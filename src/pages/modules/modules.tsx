import { Box, Card, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { useAuth } from "../../providers";
import { ModulesQueries } from "../../queries";
import { Link } from "react-router-dom";

export const ModulesPage = () => {
  const { user } = useAuth();

  const { data: modules = [] } = ModulesQueries.useUserModulesQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user },
  );

  return (
    <Section py="4" px="2">
      <Heading size="8">Modules</Heading>
      <Flex py="2">
        {modules.map((module) => (
          <Box maxWidth="250px" minWidth="250px">
            <Card asChild>
              <Link to={`/modules/${module.id}`}>
                <Text weight="bold" size="4">
                  {module.name}
                </Text>
                {!!module.next_scheduled_run && (
                  <Text size="2">{module.next_scheduled_run}</Text>
                )}
              </Link>
            </Card>
          </Box>
        ))}
      </Flex>
    </Section>
  );
};
