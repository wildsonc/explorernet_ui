import {
  ActionIcon,
  Group,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Pencil, Plus, Trash } from "tabler-icons-react";
import NotAuthorized from "../../../components/ErrorPage/NotAuthorized";
import api from "../../../services/api";
import hasPermission from "../../../services/utils/hasPermission";

interface Props {
  id: number;
  name: string;
  template: string;
  updated_at: string;
}

function Query() {
  const { accessTokenPayload } = useSessionContext();
  const modals = useModals();
  const router = useRouter();

  const { data, refetch } = useQuery<Props[], Error>("query", async () => {
    const response = await api.get(`api/whatsapp/query`);
    return response.data;
  });

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  if (!data) return <></>;

  const formatDate = (date: string) => {
    let newDate = new Date(date).toLocaleString();
    return newDate;
  };

  const openDeleteModal = (e: Props) =>
    modals.openConfirmModal({
      title: <Title order={3}>Deletar consulta</Title>,
      centered: true,
      children: (
        <Text size="sm">
          Você tem certeza que quer apagar a consulta <strong>{e.name}</strong>?
          Essa operação é irreversível.
        </Text>
      ),
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => deleteQuery(e),
    });
  const deleteQuery = async (e: Props) => {
    const response = await api.delete(`api/whatsapp/query/${e.id}`);
    showNotification({
      title: "Deletado",
      message: e.name,
      color: "red",
    });
    refetch();
  };

  const rows = data.map((item) => (
    <tr key={item.id}>
      <td>
        <Text size="sm" weight={500}>
          {item.name}
        </Text>
      </td>

      <td>
        <Text size="sm" weight={500}>
          {item.template}
        </Text>
      </td>
      <td>
        <Text size="sm" weight={500}>
          {formatDate(item.updated_at)}
        </Text>
      </td>
      <td>
        <Group spacing={0} position="left">
          <ActionIcon onClick={() => router.push(`query/${item.id}`)}>
            <Pencil size={16} />
          </ActionIcon>
          <ActionIcon color="red" onClick={() => openDeleteModal(item)}>
            <Trash size={16} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));
  return (
    <ScrollArea sx={{ height: "calc(100vh - 90px)" }} offsetScrollbars>
      <ScrollArea>
        <Table sx={{ minWidth: 800 }} verticalSpacing="xs" highlightOnHover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Template</th>
              <th>Atualizado</th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
      <ActionIcon
        sx={{ position: "absolute", bottom: 20, right: 30 }}
        radius="xl"
        size="xl"
        color="blue"
        variant="filled"
        onClick={() => router.push("query/new")}
      >
        <Plus />
      </ActionIcon>
    </ScrollArea>
  );
}

export default Query;
