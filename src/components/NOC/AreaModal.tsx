import {
  Modal,
  Group,
  Button,
  Title,
  Avatar,
  Tooltip,
  Text,
} from "@mantine/core";
import api from "../../services/api";
import moment from "moment";
import "moment/locale/pt-br";

export default function AreaModal({ onClose, open, data, refetch }: any) {
  if (!data) return null;
  const resolve = async (id: number) => {
    await api.put(`api/noc/notification/${id}`);
    refetch();
    onClose(false);
  };

  const title = <Title order={3}>{data.title}</Title>;
  moment.locale("pt-br");
  const created_at = moment(data.created_at).fromNow();

  return (
    <Modal opened={open} onClose={() => onClose(false)} title={title}>
      <p>
        {data.description} <br />
        <strong>Usuários afetados:</strong>{" "}
        {data.polygon?.properties?.custumers}
      </p>

      <Group position="center">
        <Button
          variant="outline"
          color="green"
          onClick={() => resolve(data.id)}
        >
          Resolver
        </Button>
      </Group>
      <Group position="left" sx={{ marginTop: -25 }}>
        <Tooltip label={data.user.full_name} position="bottom">
          <Avatar
            color="indigo"
            radius="xl"
            size="sm"
            sx={{ marginRight: -10 }}
          >
            {data.user.first_name.substring(0, 1)}
            {data.user.last_name.substring(0, 1)}{" "}
          </Avatar>{" "}
        </Tooltip>
        <Text size="sm">{created_at}</Text>
      </Group>
    </Modal>
  );
}
