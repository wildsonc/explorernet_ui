import {
  Modal,
  Group,
  Button,
  Title,
  Avatar,
  Tooltip,
  Text,
  ColorInput,
} from "@mantine/core";
import api from "../../services/api";
import moment from "moment";
import "moment/locale/pt-br";
import { useModals } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";

interface Props {
  onClose: (v: boolean) => void;
  open: boolean;
  refetch: () => void;
  data: any;
}

moment.locale("pt-br");

export default function AreaModal({ onClose, open, data, refetch }: Props) {
  const modals = useModals();
  const [color, setColor] = useState("");
  const [debounced] = useDebouncedValue(color, 400);

  useEffect(() => {
    setColor(data.color);
  }, [data]);

  useEffect(() => {
    if (debounced == data.color) return;
    api
      .put(`api/marketing/campaign/${data.id}`, { color: debounced })
      .then((res) => refetch());
  }, [debounced]);

  if (!data) return null;

  const remove = async (id: number, silence: boolean = false) => {
    await api.delete(`api/marketing/campaign/${id}`);
    refetch();
    onClose(false);
  };

  const title = <Title order={3}>{data.title}</Title>;
  const created_at = moment(data.created_at).fromNow();

  const openModal = () =>
    modals.openConfirmModal({
      title: <Title order={3}>Excluir</Title>,
      children: <Text>Você confirma esta ação?</Text>,
      labels: { confirm: "Confirmar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => remove(data.id),
      centered: true,
    });

  return (
    <Modal
      opened={open}
      onClose={() => onClose(false)}
      title={title}
      zIndex={1}
    >
      <Text>
        <strong>Clientes:</strong> {data.polygon?.properties?.total}
      </Text>
      <Text>
        <strong>Template:</strong> {data.template}
      </Text>
      <Group>
        <strong>Cor:</strong>
        <ColorInput
          mt={5}
          defaultValue={data.color}
          value={color}
          onChange={(e) => setColor(e)}
        />
      </Group>

      <Group position="apart">
        <Group position="left" sx={{ marginBottom: -5 }}>
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
        <Group position="center">
          <Button variant="filled" color="red" onClick={openModal}>
            Excluir
          </Button>
        </Group>
      </Group>
    </Modal>
  );
}
