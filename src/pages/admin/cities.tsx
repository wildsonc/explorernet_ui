import {
  ActionIcon,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  ScrollArea,
  Table,
  Text,
  TextInput,
  useMantineTheme,
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
import hasPermission from "../../services/utils/hasPermission";

interface CityProps {
  id: number;
  name: string;
  state: string;
  is_active: boolean;
}

export default function Cities() {
  const modals = useModals();
  const [opened, setOpened] = useState(false);
  const [city, setCity] = useState<CityProps>();
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState<CityProps[]>();
  const { accessTokenPayload } = useSessionContext();

  const form = useForm({
    initialValues: {
      name: "",
      state: "",
    },
  });

  const { data, refetch } = useQuery<CityProps[], Error>(
    "cities",
    async () => {
      const response = await api.get(`api/city`);
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
  if (!sortedData) return <></>;

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  const handleSubmit = (values: typeof form.values) => {
    if (city) {
      api.put(`api/city/${city?.id}`, values).then(() => {
        setOpened(false);
        refetch();
        showNotification({
          title: "Atualizado",
          message: city?.name,
          color: "green",
        });
      });
    } else {
      api.post(`api/city`, values).then(() => {
        setOpened(false);
        refetch();
        showNotification({
          title: "Nova cidade",
          message: values.name,
          color: "blue",
        });
      });
    }
  };

  const edit = (city: CityProps) => {
    form.setValues({ name: city.name, state: city.state });
    setCity(city);
    setOpened(true);
  };

  const openDeleteModal = (city: CityProps) => {
    modals.openConfirmModal({
      title: <strong>Excluir cidade</strong>,
      centered: true,
      children: (
        <Text size="sm">
          Você tem certeza que deseja excluir a cidade{" "}
          <strong>{city.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Excluir", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        api.delete(`api/city/${city.id}`).then(() => {
          setOpened(false);
          refetch();
          showNotification({
            title: "Cidade excluída",
            message: city.name,
            color: "red",
          });
        });
      },
    });
  };

  function filterData(data: CityProps[], search: string) {
    const keys = ["name"];
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

  const rows = sortedData.map((item) => (
    <tr key={item.id}>
      <td>{item.name}</td>
      <td>{item.state}</td>
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
            setCity(undefined);
            setOpened(true);
          }}
          leftIcon={<Plus size={18} />}
        >
          Cidade
        </Button>
      </Group>
      <ScrollArea sx={{ height: "calc(100vh - 90px)" }} offsetScrollbars>
        <Table sx={{ minWidth: 800 }} verticalSpacing="sm" highlightOnHover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>UF</th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={city?.name}
          withCloseButton={false}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput label="Nome" {...form.getInputProps("name")} />
            <TextInput label="UF" {...form.getInputProps("state")} />
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
