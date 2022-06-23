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
import { useModals } from "@mantine/modals";
import { useForm } from "@mantine/form";

interface Props {
  onClose: (v: boolean) => void;
  open: boolean;
  refetch: () => void;
  data: any;
}

moment.locale("pt-br");

export default function AreaModal({ onClose, open, data, refetch }: Props) {
  const modals = useModals();
  const form = useForm({ initialValues: { time: "1", time_type: "horas" } });

  if (!data) return null;

  const resolve = async (id: number, silence: boolean = false) => {
    const silenced = silence ? "?silence=true" : "";
    await api.put(`api/noc/notification/${id}${silenced}`);
    refetch();
    onClose(false);
  };

  const extend = async (id: number) => {
    await api.put(`api/noc/notification/extend/${id}`, form.values);
    refetch();
    onClose(false);
  };

  const title = <Title order={3}>{data.title}</Title>;
  const created_at = moment(data.created_at).fromNow();

  const openExtendModal = () =>
    modals.openConfirmModal({
      title: <Title order={3}>Prorrogar</Title>,
      children: <Text>Você confirma esta ação?</Text>,
      labels: { confirm: "Confirmar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => extend(data.id),
      centered: true,
    });

  const openResolveModal = () =>
    modals.openConfirmModal({
      title: <Title order={3}>Normalizar</Title>,
      children: <Text>Você confirma esta ação?</Text>,
      labels: { confirm: "Confirmar", cancel: "Resolver em silêncio" },
      confirmProps: { color: "green" },
      onConfirm: () => resolve(data.id),
      onCancel: () => resolve(data.id, true),
      centered: true,
    });

  const formatDate = (date: string) => {
    let newDate = new Date(date).toLocaleString("pt-BR", {
      hour12: false,
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    return newDate;
  };

  return (
    <Modal
      opened={open}
      onClose={() => onClose(false)}
      title={title}
      zIndex={1}
    >
      <Text>{data.description}</Text>
      <Text>
        <strong>Usuários afetados:</strong>{" "}
        {data.polygon?.properties?.customers}
      </Text>
      <Text py={10} color="dimmed">
        Previsão: {formatDate(data.expected_date)}
      </Text>
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
          <Button variant="outline" color="orange" onClick={openExtendModal}>
            Prorrogar
          </Button>
          <Button variant="filled" color="green" onClick={openResolveModal}>
            Resolver
          </Button>
        </Group>
      </Group>
    </Modal>
  );
}
