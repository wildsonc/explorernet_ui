import { Timeline, Text, Button, ScrollArea } from "@mantine/core";
import { useQuery } from "react-query";
import { MapPin, Urgent } from "tabler-icons-react";
import api from "../../services/api";
import moment from "moment";
import "moment/locale/pt-br";
import bbox from "@turf/bbox";

interface Props {
  id: number;
  title: string;
  description: string;
  polygon: any;
  created_at: string;
}

export default function DrawerActiveContent({ mapRef }: any) {
  const { data } = useQuery<Props[], Error>(
    "noc-notifications",
    async () => {
      const response = await api.get(`api/noc/notification`);
      return response.data;
    },
    {
      staleTime: 1000 * 5,
    }
  );

  if (!data) return null;

  const onClick = (polygon: any) => {
    if (polygon) {
      // calculate the bounding box of the feature
      const [minLng, minLat, maxLng, maxLat] = bbox(polygon);

      mapRef.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 2000 }
      );
    }
  };

  moment.locale("pt-br");

  const items = data.map((i) => {
    let time = moment(i.created_at).fromNow();
    const now = moment();
    const days = moment.duration(now.diff(moment(i.created_at))).asDays();
    if (days > 0.9) {
      time = new Date(i.created_at).toLocaleString("pt-BR", {
        hour12: false,
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return (
      <Timeline.Item
        key={i.id}
        bullet={<Urgent size={18} />}
        title={i.title}
        color="orange"
      >
        <Text color="dimmed" size="sm" weight={500}>
          {i.description}
        </Text>
        <Button
          onClick={() => onClick(i.polygon)}
          size="xs"
          variant="subtle"
          color="yellow"
          p={3}
          ml={-10}
          leftIcon={<MapPin size={16} />}
        >
          Ver no mapa
        </Button>
        <Text size="xs" mt={4}>
          {time}
        </Text>
      </Timeline.Item>
    );
  });

  return (
    <ScrollArea sx={{ height: "100%" }}>
      <Timeline active={10} bulletSize={26} lineWidth={4}>
        {items}
      </Timeline>
    </ScrollArea>
  );
}
