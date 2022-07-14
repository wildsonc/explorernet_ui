import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Center,
  createStyles,
  Group,
  Modal,
  ScrollArea,
  Table,
  Text,
  TextInput,
  Tooltip,
  TransferList,
  useMantineTheme,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { LockOff, LockOpen, Pencil, Search } from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import GoogleIcon from "../../components/Icons/GoogleIcon";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";

interface GroupProps {
  id: number;
  name: string;
}

interface PermissionProps {
  id: number;
  codename: string;
}

interface UsersProps {
  id: number;
  full_name: string;
  groups: GroupProps[];
  user_permissions: PermissionProps[];
  email: string;
  is_active: boolean;
  is_superuser: boolean;
}

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
  },

  control: {
    width: "100%",
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  icon: {
    width: 21,
    height: 21,
    borderRadius: 21,
  },
}));

const groupColors: any = {
  sales: { color: "green", label: "Comercial" },
  route: { color: "indigo", label: "Rotas" },
  finance: { color: "yellow", label: "Financeiro" },
  support: { color: "pink", label: "ServiceDesk" },
  admin: { color: "cyan", label: "Admin" },
  noc: { color: "violet", label: "NOC" },
  support2: { color: "lime", label: "Nível 2" },
  marketing: { color: "blue", label: "Marketing" },
};

export default function UsersTable() {
  const theme = useMantineTheme();
  const modals = useModals();
  const [groups, setGroups] = useState<GroupProps[]>();
  const [opened, setOpened] = useState(false);
  const [user, setUser] = useState<UsersProps>();
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState<UsersProps[]>();
  const { accessTokenPayload } = useSessionContext();

  useEffect(() => {
    api.get("api/groups").then((res) => setGroups(res.data));
  }, []);

  const form = useForm({
    initialValues: {
      id: 0,
      groups: [[], []],
    },
  });

  const { data, refetch } = useQuery<UsersProps[], Error>(
    "users",
    async () => {
      const response = await api.get(`api/users`);
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
  if (!groups) return <></>;

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  const handleSubmit = (values: typeof form.values) => {
    api.put("api/auth/roles", values).then(() => {
      setOpened(false);
      refetch();
      showNotification({
        title: "Atualizado",
        message: user?.email,
        color: "green",
      });
    });
  };

  const edit = (user: UsersProps) => {
    if (groups) {
      const userGroupList = user.groups.map((e) => e.name);
      const userGroups = user.groups.map((e) => ({
        value: e.name,
        label: groupColors[e.name].label,
      }));
      const availableGroups = groups
        .filter((e) => !userGroupList.includes(e.name))
        .map((e) => ({
          value: e.name,
          label: groupColors[e.name].label,
        }));
      const dataList = [availableGroups, userGroups];
      // @ts-ignore
      form.setValues({ groups: dataList, id: user.id });
      setUser(user);
      setOpened(true);
    }
  };

  const openDeleteModal = (user: UsersProps) => {
    if (!user.is_active) return toggleActive(user);
    modals.openConfirmModal({
      title: "Desativar usuário",
      centered: true,
      children: (
        <Text size="sm">
          Você tem certeza que deseja inativar o usuário{" "}
          <strong>{user.email}</strong>?
        </Text>
      ),
      labels: { confirm: "Desativar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => toggleActive(user),
    });
  };

  const toggleActive = async (user: UsersProps) => {
    if (user.is_active) {
      showNotification({
        title: "Usuário desativado",
        message: user.email,
        color: "red",
      });
    } else {
      showNotification({
        title: "Usuário ativado",
        message: user.email,
        color: "green",
      });
    }
    await api.put(`api/user/status/${user.id}`);
    refetch();
  };

  function filterData(data: UsersProps[], search: string) {
    const keys = ["full_name", "email"];
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
      <td>
        <Group spacing="sm">
          <Avatar size={30} radius={30}>
            {item.full_name.slice(0, 1)}
          </Avatar>
          <Text size="sm" weight={500}>
            {item.full_name}
          </Text>
        </Group>
      </td>

      <td>
        {item.groups.slice(0, 1).map((g) => (
          <Badge
            key={g.id + item.id}
            variant={theme.colorScheme === "dark" ? "light" : "outline"}
            color={groupColors[g.name].color}
          >
            {groupColors[g.name].label}
          </Badge>
        ))}
        {item.groups.length > 1 && (
          <Tooltip
            position="right"
            label={item.groups.map((e, i) => {
              if (i > 0) {
                return (
                  <Text key={i} size="sm">
                    {groupColors[e.name].label}
                  </Text>
                );
              }
            })}
          >
            <Badge
              size="sm"
              variant={theme.colorScheme === "dark" ? "light" : "outline"}
              color="gray"
              sx={{ marginLeft: 3 }}
            >
              <Text size="xs">+{item.groups.length - 1}</Text>
            </Badge>
          </Tooltip>
        )}
      </td>
      <td>
        <Anchor<"a">
          size="sm"
          href="#"
          onClick={(event) => event.preventDefault()}
        >
          <Group>
            {item.email.includes("explorernet") && (
              <GoogleIcon style={{ marginRight: -10 }} />
            )}{" "}
            {item.email}
          </Group>
        </Anchor>
      </td>
      <td>
        <Badge
          color={item.is_active ? "green" : "gray"}
          variant={theme.colorScheme === "dark" ? "light" : "outline"}
        >
          {item.is_active ? "ATIVO" : "INATIVO"}
        </Badge>
      </td>
      <td>
        <Group spacing={0} position="right">
          <ActionIcon
            onClick={() => {
              edit(item);
            }}
          >
            <Pencil size={16} />
          </ActionIcon>
          <ActionIcon
            color={item.is_active == true ? "red" : "green"}
            onClick={() => openDeleteModal(item)}
          >
            {item.is_active == true ? (
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
      <TextInput
        placeholder="Buscar"
        mb="md"
        icon={<Search size={14} />}
        value={search}
        onChange={handleSearchChange}
      />
      <ScrollArea sx={{ height: "calc(100vh - 90px)" }} offsetScrollbars>
        <Table sx={{ minWidth: 800 }} verticalSpacing="sm" highlightOnHover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Grupos</th>
              <th>Email</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={user?.full_name}
          withCloseButton={false}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TransferList
              searchPlaceholder="Buscar..."
              nothingFound="Nenhum"
              titles={["Grupos", "Participante"]}
              breakpoint="sm"
              {...form.getInputProps("groups")}
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
