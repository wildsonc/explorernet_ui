import { ScrollArea, Text, Timeline } from "@mantine/core";
import moment from "moment";
import "moment/locale/pt-br";
import { useQuery } from "react-query";
import { Check, Message, X } from "tabler-icons-react";
import api from "../../services/api";

interface Props {
  id: number;
  user: {
    full_name: string;
  };
  object: {
    phone: string;
    result: string;
    template: string;
    is_success: boolean;
  };
  created_at: string;
}

export default function DrawerContent() {
  const { data } = useQuery<Props[], Error>("route-history", async () => {
    const response = await api.get(`api/route/history`);
    return response.data;
  });

  if (!data) return null;

  moment.locale("pt-br");

  const items = data.map((i) => {
    const time = moment(i.created_at).fromNow();
    return (
      <Timeline.Item
        key={i.id}
        bullet={i.object.is_success ? <Check size={16} /> : <X size={16} />}
        title={i.object.phone}
        color={i.object.is_success ? "green" : "red"}
      >
        <Text color="dimmed" size="sm" weight={500}>
          {i.object.is_success ? null : i.object.result}
        </Text>
        <Text size="xs" mt={4}>
          <Message size={12} /> {i.object.template}
        </Text>
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
