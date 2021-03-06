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

interface FranchiseProps {
  id: number;
  name: string;
  trade_name: string;
  cnpj: string;
  phone: string;
  cities: string[];
  companies: string[];
  updated_at: string;
  created_at: string;
}

interface cityProps {
  id: number;
  name: string;
  is_active: boolean;
}

export default function Franchise() {
  const modals = useModals();
  const [opened, setOpened] = useState(false);
  const [franchise, setFranchise] = useState<FranchiseProps>();
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState<FranchiseProps[]>();
  const { accessTokenPayload } = useSessionContext();
  const [cities, setCities] = useState(["Todas"]);

  const form = useForm({
    initialValues: {
      name: "",
      trade_name: "",
      cnpj: "",
      phone: "",
      cities: ["Todas"],
      companies: ["Explorernet", "Internetup"],
    },
    validate: {
      cities: (value) =>
        value.length == 0 ? "Escolha pelo menos uma cidade" : null,
      companies: (value) =>
        value.length == 0 ? "Escolha pelo menos uma empresa" : null,
    },
  });

  const { data, refetch } = useQuery<FranchiseProps[], Error>(
    "franchises",
    async () => {
      const response = await api.get(`api/sales/franchise`);
      return response.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  useEffect(() => {
    api.get<cityProps[]>("api/city").then((res) => {
      let data = res.data.map((e) => e.name);
      data.unshift("Todas");
      setCities(data);
    });
  }, []);

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
    if (franchise) {
      api.put(`api/sales/franchise/${franchise?.id}`, values).then(() => {
        setOpened(false);
        refetch();
        showNotification({
          title: "Atualizado",
          message: values.name,
          color: "green",
        });
      });
    } else {
      api.post(`api/sales/franchise`, values).then(() => {
        setOpened(false);
        refetch();
      });
    }
  };

  const edit = (p: FranchiseProps) => {
    setFranchise(p);
    setOpened(true);
    form.setValues({
      cnpj: p.cnpj,
      trade_name: p.trade_name,
      name: p.name,
      cities: p.cities,
      phone: p.phone,
      companies: p.companies,
    });
  };

  const openDeleteModal = (p: FranchiseProps) => {
    modals.openConfirmModal({
      title: "Excluir franquia",
      centered: true,
      children: (
        <Text size="sm">
          Voc?? tem certeza que deseja excluir a franquia{" "}
          <strong>{p.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Excluir", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        api.delete(`api/sales/franchise/${p.id}`).then(() => {
          refetch();
          showNotification({
            title: "Exclu??do",
            message: p.name,
            color: "red",
          });
        });
      },
    });
  };

  function filterData(data: FranchiseProps[], search: string) {
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

  const rows = sortedData?.map((item) => (
    <tr key={item.id}>
      <td>
        <Group spacing="sm" noWrap>
          <Avatar size={30} radius={30}>
            <Building size={16} />
          </Avatar>
          <Text size="sm" weight={500}>
            {item.name || "-"}
          </Text>
        </Group>
      </td>
      <td>
        <Center>{item.trade_name}</Center>
      </td>
      <td>
        <Center>
          <Group spacing="xs" noWrap>
            {item.companies.map((e, i) => (
              <Badge key={i} color={e == "Explorernet" ? "orange" : "pink"}>
                {e == "Explorernet" ? "EXP" : "IUP"}
              </Badge>
            ))}
          </Group>
        </Center>
      </td>
      <td>
        <Center>
          {item.cities.length > 1 ? (
            <Text>
              {item.cities[0]}{" "}
              <Tooltip
                position="right"
                label={item.cities.map((e, i) => {
                  if (i > 0) {
                    return (
                      <Text size="sm" key={i}>
                        {e}
                      </Text>
                    );
                  }
                })}
              >
                <Badge size="sm">
                  <Text size="xs">+{item.cities.length - 1}</Text>
                </Badge>
              </Tooltip>
            </Text>
          ) : (
            item.cities
          )}
        </Center>
      </td>
      <td>
        <Center>{item.phone}</Center>
      </td>
      <td>
        <Center>{item.cnpj}</Center>
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
            setFranchise(undefined);
            setOpened(true);
          }}
          leftIcon={<Plus size={18} />}
        >
          Franquia
        </Button>
      </Group>
      <ScrollArea sx={{ height: "calc(100vh - 90px)" }} offsetScrollbars>
        <Table sx={{ minWidth: 800 }} verticalSpacing="sm" highlightOnHover>
          <thead>
            <tr>
              <th>
                <Center>Raz??o Social</Center>
              </th>
              <th>
                <Center>Nome fantasia</Center>
              </th>
              <th>
                <Center>Empresa</Center>
              </th>
              <th>
                <Center>Cidades</Center>
              </th>
              <th>
                <Center>Telefone</Center>
              </th>
              <th>
                <Center>CNPJ</Center>
              </th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={<strong>{franchise?.name}</strong>}
          withCloseButton={false}
          overlayOpacity={0.55}
          overlayBlur={2}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Raz??o Social"
              {...form.getInputProps("name")}
              required
            />
            <TextInput
              label="Nome Fantasia"
              {...form.getInputProps("trade_name")}
              required
            />
            <TextInput
              label="Telefone"
              {...form.getInputProps("phone")}
              required
            />
            <TextInput label="CNPJ" {...form.getInputProps("cnpj")} required />
            <MultiSelect
              data={["Explorernet", "Internetup"]}
              searchable
              label="Empresa"
              required
              mt={5}
              {...form.getInputProps("companies")}
            />
            <MultiSelect
              data={cities}
              searchable
              label="Cidades"
              mt={5}
              {...form.getInputProps("cities")}
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
