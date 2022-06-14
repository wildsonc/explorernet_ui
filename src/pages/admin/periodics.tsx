import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Input,
  InputWrapper,
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
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Pencil, Plus, Trash } from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";
import { parseExpression } from "cron-parser";

interface Crontab {
  minute: string;
  hour: string;
  day_of_week: string;
  day_of_month: string;
  month_of_year: string;
}

interface Props {
  id: number;
  name: string;
  crontab: Crontab;
  enabled: boolean;
  last_run_at?: string;
  total_run_count?: number;
  one_off: boolean;
  task: string;
  start_time?: string;
}

const initialValues = {
  name: "",
  task: "",
  one_off: false,
  enabled: true,
  minute: "*",
  hour: "*",
  day_of_week: "*",
  day_of_month: "*",
  month_of_year: "*",
  start_time: "",
};

function Routines() {
  const { accessTokenPayload } = useSessionContext();
  const addForm = useForm({ initialValues });
  const editForm = useForm({
    initialValues: { ...initialValues, id: 0 },
  });
  const modals = useModals();
  const [opened, setOpened] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [tasks, setTasks] = useState<string[]>([]);

  const { data, refetch } = useQuery<Props[], Error>(
    "admin-periodic",
    async () => {
      const response = await api.get(`api/periodic`);
      return response.data.sort((a: Props, b: Props) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );
    },
    {
      staleTime: 1000 * 60,
    }
  );

  useEffect(() => {
    api.get("api/tasks").then((res) => setTasks(res.data));
  }, []);

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  if (!data) return <></>;

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

  const openDeleteModal = (e: Props) =>
    modals.openConfirmModal({
      title: <Title order={3}>Deletar rotina</Title>,
      centered: true,
      children: (
        <Text size="sm">
          Você tem certeza que quer apagar a rotina <strong>{e.name}</strong>?
          Essa operação é irreversível.
        </Text>
      ),
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => deletePeriodic(e),
    });

  const deletePeriodic = async (e: Props) => {
    await api.delete(`api/periodic/${e.id}`);
    showNotification({
      title: "Deletado",
      message: e.name,
      color: "red",
    });
    refetch();
  };

  const handleSubmit = async (values: typeof addForm.values) => {
    await api.post(`api/periodic`, values);
    refetch();
    setOpened(false);
    addForm.reset();
  };

  const handleEditSubmit = async (values: typeof editForm.values) => {
    await api.put(`api/periodic/${values.id}`, values);
    refetch();
    setOpenedEdit(false);
    editForm.reset();
  };

  const addFormContent = (
    <form onSubmit={addForm.onSubmit(handleSubmit)}>
      <TextInput label="Nome" {...addForm.getInputProps("name")} required />
      <Select
        label="Task"
        data={tasks}
        required
        {...addForm.getInputProps("task")}
      />
      <Group position="apart" grow sx={{ textAlign: "center" }}>
        <TextInput
          label="Min"
          required
          sx={{ width: 50 }}
          {...addForm.getInputProps("minute")}
        />
        <TextInput
          label="Hora"
          required
          sx={{ width: 50 }}
          {...addForm.getInputProps("hour")}
        />
        <TextInput
          label="DDS"
          required
          sx={{ width: 50 }}
          {...addForm.getInputProps("day_of_week")}
        />
        <TextInput
          label="DDM"
          required
          sx={{ width: 50 }}
          {...addForm.getInputProps("day_of_month")}
        />
        <TextInput
          label="MDA"
          required
          sx={{ width: 50 }}
          {...addForm.getInputProps("month_of_year")}
        />
      </Group>
      <InputWrapper label="Horário de ínicio">
        <Input
          type="datetime-local"
          {...addForm.getInputProps("start_time")}
        ></Input>
      </InputWrapper>
      <Checkbox
        label="One-Off"
        mt={20}
        {...addForm.getInputProps("one_off", { type: "checkbox" })}
      />
      <Checkbox
        label="Ativo"
        mt={20}
        {...addForm.getInputProps("enabled", { type: "checkbox" })}
      />
      <Group position="right" mt={20}>
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
        label="Task"
        data={tasks}
        required
        {...editForm.getInputProps("task")}
      />
      <Group position="apart" grow sx={{ textAlign: "center" }}>
        <TextInput
          label="Min"
          required
          sx={{ width: 50 }}
          {...editForm.getInputProps("minute")}
        />
        <TextInput
          label="Hora"
          required
          sx={{ width: 50 }}
          {...editForm.getInputProps("hour")}
        />
        <TextInput
          label="DDS"
          required
          sx={{ width: 50 }}
          {...editForm.getInputProps("day_of_week")}
        />
        <TextInput
          label="DDM"
          required
          sx={{ width: 50 }}
          {...editForm.getInputProps("day_of_month")}
        />
        <TextInput
          label="MDA"
          required
          sx={{ width: 50 }}
          {...editForm.getInputProps("month_of_year")}
        />
      </Group>
      <InputWrapper label="Horário de ínicio">
        <Input
          type="datetime-local"
          {...editForm.getInputProps("start_time")}
        ></Input>
      </InputWrapper>
      <Checkbox
        label="One-Off"
        mt={20}
        {...editForm.getInputProps("one_off", { type: "checkbox" })}
      />
      <Checkbox
        label="Ativo"
        mt={20}
        {...editForm.getInputProps("enabled", { type: "checkbox" })}
      />
      <Group position="right" mt={20}>
        <Button variant="filled" color="green" type="submit">
          Salvar
        </Button>
      </Group>
    </form>
  );

  const getCrontab = (i: Crontab) => {
    return `${i.minute} 
                ${i.hour} 
                ${i.day_of_week} 
                ${i.day_of_month} 
                ${i.month_of_year}`;
  };

  const getNextRun = (crontab: Crontab) => {
    const interval = parseExpression(getCrontab(crontab));
    return interval.next().toString();
  };

  const toggleState = (id: number, active: boolean) => {
    api
      .put("api/whatsapp/periodic/state", { id, active })
      .then((res) => refetch());
  };

  const rows = data.map((item) => (
    <tr key={item.id}>
      <td>
        <Badge
          color={item.enabled ? "green" : "red"}
          sx={{ "&:hover": { cursor: "pointer" } }}
          onClick={() => toggleState(item.id, !item.enabled)}
        >
          {item.enabled ? "ATIVO" : "INATIVO"}
        </Badge>
      </td>
      <td>
        <Text size="sm" weight={500}>
          {item.name}
        </Text>
      </td>
      <td>
        <Text size="sm" weight={500}>
          {getCrontab(item.crontab)}
        </Text>
      </td>

      <td>
        {item.one_off ? (
          <Badge color="green">SIM</Badge>
        ) : (
          <Badge color="red">NÃO</Badge>
        )}
      </td>
      <td>
        <Text size="sm" weight={500}>
          {item.last_run_at && formatDate(item.last_run_at)}
        </Text>
      </td>
      <td>
        <Text size="sm" weight={500}>
          {formatDate(getNextRun(item.crontab))}
        </Text>
      </td>
      <td>
        <Group spacing={0} position="left">
          <ActionIcon
            onClick={() => {
              //@ts-ignore
              editForm.setValues({
                id: item.id,
                name: item.name,
                task: item.task,
                one_off: item.one_off,
                enabled: item.enabled,
                start_time: item.start_time ? item.start_time : "",
                ...item.crontab,
              });
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
      <ScrollArea sx={{ height: "calc(100vh - 90px)" }} offsetScrollbars>
        <Table sx={{ minWidth: 800 }} verticalSpacing="xs" highlightOnHover>
          <thead>
            <tr>
              <th></th>
              <th>Nome</th>
              <th>Crontab</th>
              <th>One-Off</th>
              <th>Última execução</th>
              <th>Próxima execução</th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
      <Modal
        title={<Title order={3}>Adicionar rotina</Title>}
        opened={opened}
        onClose={() => setOpened(false)}
      >
        {addFormContent}
      </Modal>
      <Modal
        title={<Title order={3}>Editar rotina</Title>}
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

export default Routines;
