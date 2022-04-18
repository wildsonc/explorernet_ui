import { Timeline, Text } from "@mantine/core";
import { useQuery } from "react-query";
import { Plus, Pencil, Check } from "tabler-icons-react";
import api from "../../services/api";
import moment from "moment";
import "moment/locale/pt-br";

interface Props {
  id: number;
  action: "A" | "U";
  user: {
    full_name: string;
  };
  object: {
    name: string;
    free: number;
  };
  created_at: string;
}

export default function DrawerContent() {
  const { data, isLoading } = useQuery<Props[], Error>(
    "lvl2-history",
    async () => {
      const response = await api.get(`api/leveltwo/history`);
      return response.data;
    },
    {
      staleTime: 1000 * 30,
    }
  );

  if (!data) return <></>;

  moment.locale("pt-br");

  const actions = {
    A: {
      label: "Nova CTO",
      icon: <Plus size={14} />,
      color: "green",
    },
    U: {
      label: "Editado",
      icon: <Pencil size={14} />,
      color: "blue",
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
          <span>
            {i.object.name}
            <br />
            Portas livre: {i.object.free}
          </span>
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
