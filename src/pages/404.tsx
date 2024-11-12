import { Text, Button, Flex, Heading, Section } from "@radix-ui/themes";
import { Link, useNavigate } from "react-router-dom";

export const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Section
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Heading size="8">Oops!</Heading>
      <Text>Looks like this page doesn't exist.</Text>
      <Flex gap="3">
        <Button
          variant="outline"
          onClick={() => {
            navigate(-1);
          }}
          size="3"
        >
          Go Back
        </Button>
        <Button variant="solid" asChild size="3">
          <Link to="/">Go Home</Link>
        </Button>
      </Flex>
    </Section>
  );
};
