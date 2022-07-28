import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  MultiSelect,
  ScrollArea,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Building, Pencil, Plus, Search, Trash } from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";

interface Props {
  id: number;
  phone: string;
}

export default function Franchise() {
  const modals = useModals();
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState<Props>();
  const [sortedData, setSortedData] = useState<Props[]>();
  const { accessTokenPayload } = useSessionContext();

  const form = useForm({
    initialValues: {
      phone: "",
    },
  });

  const { data, refetch } = useQuery<Props[], Error>(
    "blacklist",
    async () => {
      const response = await api.get(`api/whatsapp/blacklist`);
      return response.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  useEffect(() => {
    if (data) setSortedData(data);
  }, [data]);

  if (!data) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  const handleSubmit = (values: typeof form.values) => {
    if (phone) {
      api.put(`api/whatsapp/blacklist/${phone.id}`, values).then(() => {
        setOpened(false);
        refetch();
        showNotification({
          title: "Atualizado",
          message: values.phone,
          color: "green",
        });
      });
    } else {
      api.post(`api/whatsapp/blacklist`, values).then(() => {
        setOpened(false);
        refetch();
      });
    }
  };

  const edit = (p: Props) => {
    setPhone(p);
    setOpened(true);
    form.setValues({
      phone: p.phone,
    });
  };

  const openDeleteModal = (p: Props) => {
    modals.openConfirmModal({
      title: "Remover da blacklist",
      centered: true,
      children: (
        <Text size="sm">
          Você tem certeza que deseja remover o telefone{" "}
          <strong>{p.phone}</strong>?
        </Text>
      ),
      labels: { confirm: "Excluir", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        api.delete(`api/whatsapp/blacklist/${p.id}`).then(() => {
          refetch();
          showNotification({
            title: "Removido",
            message: p.phone,
            color: "red",
          });
        });
      },
    });
  };

  function filterData(data: Props[], search: string) {
    const keys = ["phone"];
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
      <td>
        <Center>{item.phone}</Center>
      </td>
      <td>
        <Group spacing={0} position="right" noWrap>
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
            setPhone(undefined);
            setOpened(true);
          }}
          leftIcon={<Plus size={18} />}
        >
          Telefone
        </Button>
      </Group>
      <ScrollArea sx={{ height: "calc(100vh - 90px)" }} offsetScrollbars>
        <Table sx={{ width: 300 }} verticalSpacing="sm" highlightOnHover>
          <thead>
            <tr>
              <th>
                <Center>Telefone</Center>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={<strong>{phone?.phone}</strong>}
          withCloseButton={false}
          overlayOpacity={0.55}
          overlayBlur={2}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Telefone"
              type="number"
              {...form.getInputProps("phone")}
              required
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
