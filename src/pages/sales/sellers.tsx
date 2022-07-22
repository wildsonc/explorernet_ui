import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Center,
  Group,
  Modal,
  ScrollArea,
  Table,
  Text,
  TextInput,
  useMantineTheme,
  Loader,
  Switch,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import {
  Columns,
  LockOff,
  LockOpen,
  Pencil,
  Plus,
  Refresh,
  Rotate2,
  Search,
  User,
} from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import { formatDate } from "../../services/utils/formatDate";
import hasPermission from "../../services/utils/hasPermission";

interface SellerProps {
  id: number;
  name: string;
  username: string;
  monday_board: string;
  monday_columns?: [
    {
      id: string;
      title: string;
    }
  ];
  active: boolean;
  created_at: string;
}

export default function Seller() {
  const theme = useMantineTheme();
  const modals = useModals();
  const [opened, setOpened] = useState(false);
  const [seller, setSeller] = useState<SellerProps>();
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState<SellerProps[]>();
  const { accessTokenPayload } = useSessionContext();

  const form = useForm({
    initialValues: {
      monday_board: "",
      username: "",
      name: "",
      active: true,
    },
    validate: {
      username: (value) =>
        value.startsWith("@") ? "Caractere @ não permitido" : null,
    },
  });

  const { data, refetch } = useQuery<SellerProps[], Error>(
    "sellers",
    async () => {
      const response = await api.get(`api/sales/seller`);
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

  const handleSubmit = (values: typeof form.values) => {
    if (seller) {
      api.put(`api/sales/seller/${seller?.id}`, values).then(() => {
        setOpened(false);
        refetch();
        showNotification({
          title: "Atualizado",
          message: seller?.username,
          color: "green",
        });
      });
    } else {
      api.post(`api/sales/seller`, values).then(() => {
        setOpened(false);
        refetch();
      });
    }
  };

  const edit = (user: SellerProps) => {
    setSeller(user);
    setOpened(true);
    form.setValues({
      monday_board: user.monday_board,
      username: user.username,
      name: user.name,
      active: user.active,
    });
  };

  const resync = (user: SellerProps) => {
    api.put(`api/sales/seller/${user.id}`, user).then(() => {
      refetch();
      showNotification({
        title: "Colunas sincronizadas",
        message: user.username,
        color: "green",
      });
    });
  };

  const syncAll = () => {
    api.post(`api/sales/seller/sync`).then(() => {
      showNotification({
        title: "Sincronizando...",
        message: "",
        color: "green",
      });
    });
  };

  const openDeleteModal = (user: SellerProps) => {
    if (!user.active) return toggleActive(user);
    modals.openConfirmModal({
      title: "Desativar usuário",
      centered: true,
      children: (
        <Text size="sm">
          Você tem certeza que deseja inativar o usuário{" "}
          <strong>{user.username}</strong>?
        </Text>
      ),
      labels: { confirm: "Desativar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => toggleActive(user),
    });
  };

  const openColumnsModal = (user: SellerProps) => {
    const id = modals.openModal({
      title: <strong>Colunas sincronizadas</strong>,
      children: (
        <>
          <ScrollArea
            sx={{ height: user.monday_columns ? 500 : 0 }}
            offsetScrollbars
            type="always"
          >
            {user.monday_columns?.map((e) => (
              <Box key={e.id}>
                <Text lineClamp={1}>{e.title}</Text>
                <Text
                  color="dimmed"
                  weight={500}
                  size="xs"
                  mb={10}
                  lineClamp={1}
                >
                  {e.id}
                </Text>
              </Box>
            ))}
          </ScrollArea>
          <Center>
            <Button onClick={() => modals.closeModal(id)} mt="md">
              Fechar
            </Button>
          </Center>
        </>
      ),
    });
  };

  const toggleActive = async (user: SellerProps) => {
    if (user.active) {
      showNotification({
        title: "Usuário desativado",
        message: user.username,
        color: "red",
      });
    } else {
      showNotification({
        title: "Usuário ativado",
        message: user.username,
        color: "green",
      });
    }
    await api.patch(`api/sales/seller/${user.id}`);
    refetch();
  };

  function filterData(data: SellerProps[], search: string) {
    const keys = ["name", "username"];
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
        <Group spacing="sm">
          <Avatar size={30} radius={30}>
            <User size={16} />
          </Avatar>
          <Text size="sm" weight={500}>
            {item.name || "-"}
          </Text>
        </Group>
      </td>
      <td>
        <Anchor<"a">
          size="sm"
          weight={500}
          target="_blank"
          href={`https://t.me/${item.username}`}
        >
          {item.username}
        </Anchor>
      </td>
      <td>
        <Anchor<"a">
          size="sm"
          weight={500}
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_MONDAY_URL}/boards/${item.monday_board}`}
        >
          {item.monday_board}
        </Anchor>
      </td>
      <td>{formatDate(item.created_at)}</td>
      <td>
        <Badge
          color={item.active ? "green" : "gray"}
          variant={theme.colorScheme === "dark" ? "light" : "outline"}
        >
          {item.active ? "ATIVO" : "INATIVO"}
        </Badge>
      </td>

      <td>
        <Group spacing={0} position="right">
          <ActionIcon
            title="Re-sync"
            onClick={() => {
              resync(item);
            }}
          >
            <Refresh size={16} />
          </ActionIcon>
          <ActionIcon
            title="Colunas"
            onClick={() => {
              openColumnsModal(item);
            }}
          >
            <Columns size={18} />
          </ActionIcon>
          <ActionIcon
            title="Editar"
            onClick={() => {
              edit(item);
            }}
          >
            <Pencil size={16} />
          </ActionIcon>
          <ActionIcon
            color={item.active == true ? "red" : "green"}
            onClick={() => openDeleteModal(item)}
          >
            {item.active == true ? (
              <LockOff size={16} />
            ) : (
              <LockOpen size={16} />
            )}
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
          onClick={syncAll}
          variant="outline"
          leftIcon={<Rotate2 size={18} />}
        >
          Sincronizar
        </Button>
      </Group>
      <ScrollArea sx={{ height: "calc(100vh - 90px)" }} offsetScrollbars>
        <Table sx={{ minWidth: 800 }} verticalSpacing="sm" highlightOnHover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Username</th>
              <th>Monday</th>
              <th>Criado</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={<strong>{seller?.name || seller?.username}</strong>}
          withCloseButton={false}
          overlayOpacity={0.55}
          overlayBlur={2}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput label="Nome" {...form.getInputProps("name")} />
            <TextInput
              label="Username"
              {...form.getInputProps("username")}
              required
            />
            <TextInput
              label="Monday"
              type="number"
              {...form.getInputProps("monday_board")}
              required
            />
            <Switch
              label="Ativo"
              mt={20}
              {...form.getInputProps("active", { type: "checkbox" })}
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
      <ActionIcon
        sx={{ position: "absolute", bottom: 20, right: 30 }}
        radius="xl"
        size="xl"
        color="blue"
        variant="filled"
        onClick={() => {
          form.reset();
          setSeller(undefined);
          setOpened(true);
        }}
      >
        <Plus />
      </ActionIcon>
    </>
  );
}
