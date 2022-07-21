import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  ScrollArea,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Pencil, Plus, Trash } from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import { formatDate } from "../../services/utils/formatDate";
import hasPermission from "../../services/utils/hasPermission";

interface Props {
  id: number;
  name: string;
  host: string;
  database: string;
  user: string;
  port: string;
  driver: string;
  updated_at: string;
}

const initialValues = {
  name: "",
  host: "",
  database: "",
  user: "",
  port: "",
  driver: "",
  password: "",
};

function Database() {
  const { accessTokenPayload } = useSessionContext();
  const addForm = useForm({ initialValues });
  const editForm = useForm({ initialValues: { ...initialValues, id: 0 } });
  const modals = useModals();
  const [opened, setOpened] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);

  const { data, refetch } = useQuery<Props[], Error>(
    "database",
    async () => {
      const response = await api.get(`api/database`);
      return response.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  if (!data) return <></>;

  const openDeleteModal = (e: Props) =>
    modals.openConfirmModal({
      title: <Title order={3}>Deletar banco de dados</Title>,
      centered: true,
      children: (
        <Text size="sm">
          Você tem certeza que quer apagar o bando de dados{" "}
          <strong>{e.name}</strong>? Essa operação é irreversível.
        </Text>
      ),
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => deleteDatabase(e),
    });
  const deleteDatabase = async (e: Props) => {
    const response = await api.delete(`api/database/${e.id}`);
    showNotification({
      title: "Deletado",
      message: e.name,
      color: "red",
    });
    refetch();
  };

  const handleSubmit = async (values: typeof addForm.values) => {
    await api.post(`api/database`, values);
    refetch();
    setOpened(false);
    addForm.reset();
  };

  const handleEditSubmit = async (values: typeof editForm.values) => {
    await api.put(`api/database/${values.id}`, values);
    refetch();
    setOpenedEdit(false);
    editForm.reset();
  };

  const addFormContent = (
    <form onSubmit={addForm.onSubmit(handleSubmit)}>
      <TextInput label="Nome" {...addForm.getInputProps("name")} required />
      <Select
        label="Driver"
        required
        data={["postgres"]}
        {...addForm.getInputProps("driver")}
      />
      <TextInput
        label="Host"
        required
        placeholder="localhost"
        {...addForm.getInputProps("host")}
      />
      <TextInput
        label="Database"
        required
        placeholder="postgres"
        {...addForm.getInputProps("database")}
      />
      <TextInput label="User" required {...addForm.getInputProps("user")} />
      <TextInput
        label="Senha"
        type="password"
        required
        {...addForm.getInputProps("password")}
      />
      <TextInput
        label="Porta"
        required
        placeholder="5432"
        {...addForm.getInputProps("port")}
      />
      <Group position="right" mt={20}>
        <Button
          variant="outline"
          color="orange"
          onClick={() => testConnection(addForm.values)}
        >
          Testar
        </Button>
        <Button variant="filled" color="green" type="submit">
          Salvar
        </Button>
      </Group>
    </form>
  );
  const editFormContent = (
    <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
      <TextInput label="Nome" {...editForm.getInputProps("name")} required />
      <Select
        label="Driver"
        required
        data={["postgres"]}
        {...editForm.getInputProps("driver")}
      />
      <TextInput
        label="Host"
        required
        placeholder="localhost"
        {...editForm.getInputProps("host")}
      />
      <TextInput
        label="Database"
        required
        placeholder="postgres"
        {...editForm.getInputProps("database")}
      />
      <TextInput label="User" required {...editForm.getInputProps("user")} />
      <TextInput
        label="Senha"
        type="password"
        required
        {...editForm.getInputProps("password")}
      />
      <TextInput
        label="Porta"
        required
        placeholder="5432"
        {...editForm.getInputProps("port")}
      />
      <Group position="right" mt={20}>
        <Button
          variant="outline"
          color="orange"
          onClick={() => testConnection(editForm.values)}
        >
          Testar
        </Button>
        <Button variant="filled" color="green" type="submit">
          Salvar
        </Button>
      </Group>
    </form>
  );

  const testConnection = async (values: any) => {
    const response = await api.post(`api/database-test`, values);
    if (response.data.status == "Error") {
      showNotification({
        title: "Falhou",
        message: response.data.message,
        color: "red",
      });
    } else if (response.data.status == "OK") {
      showNotification({
        title: "Sucesso",
        message: "Conexão bem sucedida",
        color: "green",
      });
    }
  };

  const openAddModal = () =>
    modals.openModal({
      title: <Title order={3}>Adicionar novo banco</Title>,
      centered: true,
      children: addFormContent,
    });

  const updateDatabase = async (e: Props) => {
    // const response = await api.put(`api/database/${e.id}`)
    showNotification({
      title: "Salvo",
      message: e.name,
      color: "green",
    });
  };

  const rows = data.map((item) => (
    <tr key={item.id}>
      <td>
        <Text size="sm" weight={500}>
          {item.name}
        </Text>
      </td>

      <td>
        <Badge>{item.driver}</Badge>
      </td>
      <td>
        <Text size="sm" weight={500}>
          {item.host}
        </Text>
      </td>
      <td>
        <Text size="sm" weight={500}>
          {item.database}
        </Text>
      </td>
      <td>
        <Text size="sm" weight={500}>
          {formatDate(item.updated_at, false)}
        </Text>
      </td>
      <td>
        <Group spacing={0} position="left">
          <ActionIcon
            onClick={() => {
              editForm.setValues({ ...item, password: "" });
              setOpenedEdit(true);
            }}
          >
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
    <>
      <ScrollArea>
        <Table sx={{ minWidth: 800 }} verticalSpacing="xs" highlightOnHover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Driver</th>
              <th>Host</th>
              <th>Database</th>
              <th>Atualizado</th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
      <Modal
        title={<Title order={3}>Adicionar fonte de dados</Title>}
        opened={opened}
        onClose={() => setOpened(false)}
      >
        {addFormContent}
      </Modal>
      <Modal
        title={<Title order={3}>Editar fonte de dados</Title>}
        opened={openedEdit}
        onClose={() => setOpenedEdit(false)}
      >
        {editFormContent}
      </Modal>
      <ActionIcon
        sx={{ position: "absolute", bottom: 20, right: 30 }}
        radius="xl"
        size="xl"
        color="blue"
        variant="filled"
        onClick={() => setOpened(true)}
      >
        <Plus />
      </ActionIcon>
    </>
  );
}

export default Database;
