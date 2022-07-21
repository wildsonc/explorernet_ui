import {
  ActionIcon,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  ScrollArea,
  Select,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Pencil, Plus, Search, Trash } from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import { formatDate } from "../../services/utils/formatDate";
import hasPermission from "../../services/utils/hasPermission";

interface OltProps {
  id: number;
  name: string;
  ip: string;
  olt_type: string;
  created_at: string;
  updated_at: string;
}

export default function Olt() {
  const modals = useModals();
  const [opened, setOpened] = useState(false);
  const [olt, setOlt] = useState<OltProps>();
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState<OltProps[]>();
  const { accessTokenPayload } = useSessionContext();

  const form = useForm({
    initialValues: {
      name: "",
      ip: "",
      olt_type: "",
    },
  });

  const { data, refetch } = useQuery<OltProps[], Error>(
    "olts",
    async () => {
      const response = await api.get(`api/leveltwo/olt`);
      setSortedData(response.data);
      return response.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  if (!data) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }
  if (!sortedData) setSortedData(data);

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  const types = [
    "huawei",
    "fiberhome",
    "zte",
    "datacom",
    "vsolutions",
    "nokia",
  ];

  const handleSubmit = (values: typeof form.values) => {
    if (olt) {
      api.put(`api/leveltwo/olt/${olt?.id}`, values).then(() => {
        setOpened(false);
        refetch();
        showNotification({
          title: "Atualizado",
          message: olt?.name,
          color: "green",
        });
      });
    } else {
      api.post(`api/leveltwo/olt`, values).then(() => {
        setOpened(false);
        refetch();
        showNotification({
          title: "Nova olt",
          message: values.name,
          color: "blue",
        });
      });
    }
  };

  const edit = (olt: OltProps) => {
    form.setValues({ name: olt.name, ip: olt.ip, olt_type: olt.olt_type });
    setOlt(olt);
    setOpened(true);
  };

  const openDeleteModal = (olt: OltProps) => {
    modals.openConfirmModal({
      title: <strong>Excluir OLT</strong>,
      centered: true,
      children: (
        <Text size="sm">
          Você tem certeza que deseja excluir a OLT <strong>{olt.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Excluir", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        api.delete(`api/leveltwo/olt/${olt.id}`).then(() => {
          setOpened(false);
          refetch();
          showNotification({
            title: "OLT excluída",
            message: olt.name,
            color: "red",
          });
        });
      },
    });
  };

  function filterData(data: OltProps[], search: string) {
    const keys = ["name", "ip", "olt_type"];
    const query = search.toLowerCase().trim();
    return data.filter((item) =>
      keys.some((key) => (item as any)[key]?.toLowerCase().includes(query))
    );
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(filterData(data, value));
  };

  const rows = sortedData?.map((item) => (
    <tr key={item.id}>
      <td>{item.name}</td>
      <td>{item.ip}</td>
      <td>{item.olt_type}</td>
      <td>{formatDate(item.created_at)}</td>
      <td>{formatDate(item.updated_at)}</td>
      <td>
        <Group spacing={0} position="right">
          <ActionIcon
            onClick={() => {
              edit(item);
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
      <Group position="apart" noWrap>
        <TextInput
          placeholder="Buscar"
          mb="md"
          icon={<Search size={14} />}
          value={search}
          onChange={handleSearchChange}
          sx={{ width: "100%" }}
        />
        <Button
          mt={-16}
          sx={{ width: 150 }}
          onClick={() => {
            form.reset();
            setOlt(undefined);
            setOpened(true);
          }}
          leftIcon={<Plus size={18} />}
        >
          OLT
        </Button>
      </Group>
      <ScrollArea sx={{ height: "calc(100vh - 90px)" }} offsetScrollbars>
        <Table sx={{ minWidth: 800 }} verticalSpacing="sm" highlightOnHover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>IP</th>
              <th>Tipo</th>
              <th>Criado</th>
              <th>Atualizado</th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={olt?.name}
          withCloseButton={false}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput label="Nome" {...form.getInputProps("name")} />
            <TextInput label="IP" {...form.getInputProps("ip")} />
            <Select
              data={types}
              searchable
              label="Tipo"
              {...form.getInputProps("olt_type")}
            />
            <Group position="right" sx={{ marginTop: 20 }}>
              <Button color="gray" onClick={() => setOpened(false)}>
                Cancelar
              </Button>
              <Button color="green" type="submit">
                Salvar
              </Button>
            </Group>
          </form>
        </Modal>
      </ScrollArea>
    </>
  );
}
