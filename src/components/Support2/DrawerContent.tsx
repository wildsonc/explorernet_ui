import { Timeline, Text, Group, Button, ScrollArea } from "@mantine/core";
import { useQuery } from "react-query";
import { Plus, Pencil, MapPin } from "tabler-icons-react";
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
    latitude: string;
    longitude: string;
  };
  created_at: string;
}

export default function DrawerContent({ mapRef }: any) {
  const { data, isLoading } = useQuery<Props[], Error>(
    "lvl2-history",
    async () => {
      const response = await api.get(`api/leveltwo/history`);
      return response.data;
    },
    {
      staleTime: 1000 * 5,
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

  const onClick = (coordinates: [string, string]) => {
    if (coordinates) {
      mapRef.flyTo({
        center: coordinates,
        zoom: 20,
        essential: true,
      });
    }
  };

  const items = data.map((i) => {
    const time = moment(i.created_at).fromNow();
    const action = actions[i.action];
    const title = (
      <Group>
        {action.label}
        <Button
          onClick={() => onClick([i.object.longitude, i.object.latitude])}
          size="xs"
          variant="subtle"
          p={3}
          ml={-10}
          leftIcon={<MapPin size={16} />}
        >
          Ver no mapa
        </Button>
      </Group>
    );
    return (
      <Timeline.Item
        key={i.id}
        bullet={action.icon}
        title={title}
        color={action.color}
      >
        <Text color="dimmed" size="sm" weight={500}>
          <span>
            {i.object.name}
            <br />
            Portas livres: {i.object.free}
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
    <ScrollArea sx={{ height: "100%" }}>
      <Timeline active={10} bulletSize={24} lineWidth={4}>
        {items}
      </Timeline>
    </ScrollArea>
  );
}
