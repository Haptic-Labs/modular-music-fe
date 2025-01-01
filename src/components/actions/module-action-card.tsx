import { Card, Flex, Text } from "@radix-ui/themes";
import { Database } from "../../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ModuleActionIcon } from "./module-action-icon";
import { colors } from "../../theme/colors";

type ModuleActionCardProps = {
  action: Database["public"]["Tables"]["module_actions"]["Row"];
};

export const ModuleActionCard = ({ action }: ModuleActionCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: action.id });

  return (
    <Card
      ref={setNodeRef}
      css={[{ transform: CSS.Transform.toString(transform), transition }]}
      {...attributes}
      {...listeners}
    >
      <Flex gap="2" align="center">
        <ModuleActionIcon
          type={action.type}
          color={colors.greenDark.green9}
          css={{ padding: 2 }}
        />
        <Flex direction="column">
          <Text>{action.title}</Text>
        </Flex>
      </Flex>
    </Card>
  );
};
