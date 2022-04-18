import { Timeline, Text } from "@mantine/core";
import { useQuery } from "react-query";
import { Plus, Pencil, Check } from "tabler-icons-react";
import api from "../../services/api";
import moment from "moment";
import "moment/locale/pt-br";

interface Props {
  id: number;
  action: "A" | "F" | "U";
  user: {
    full_name: string;
  };
  object: {
    title: string;
  };
  created_at: string;
}

export default function DrawerContent() {
  const { data, isLoading } = useQuery<Props[], Error>(
    "noc-history",
    async () => {
      const response = await api.get(`api/noc/history`);
      return response.data;
    },
    {
      staleTime: 1000 * 30,
    }
  );

  if (!data) return null;

  moment.locale("pt-br");

  const actions = {
    A: {
      label: "Nova área",
      icon: <Plus />,
      color: "red",
    },
    F: {
      label: "Resolvido",
      icon: <Check />,
      color: "green",
    },
    U: {
      label: "Editado",
      icon: <Pencil />,
      color: "dark",
    },
  };

  const items = data.map((i) => {
    const time = moment(i.created_at).fromNow();
    const action = actions[i.action];
    return (
      <Timeline.Item
        key={i.id}
        bullet={action.icon}
        title={action.label}
        color={action.color}
      >
        <Text color="dimmed" size="sm" weight={500}>
          {i.object.title}
        </Text>
        <Text size="xs" mt={4}></Text>
        <Text size="xs" mt={4}>
          <Text color="dimmed" size="xs">
            {i.user.full_name}
          </Text>
          {time}
        </Text>
      </Timeline.Item>
    );
  });

  return (
    <Timeline active={1} bulletSize={24} lineWidth={4}>
      {items}
    </Timeline>
  );
}
