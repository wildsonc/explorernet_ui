import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  MultiSelect,
  NumberInput,
  ScrollArea,
  Select,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { formList, useForm } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import {
  Award,
  CurrencyReal,
  FileInvoice,
  Pencil,
  Plus,
  Search,
  Trash,
} from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import { formatDate } from "../../services/utils/formatDate";
import hasPermission from "../../services/utils/hasPermission";

interface ProductProps {
  id: number;
  name: string;
  price: number;
  award: number;
  cities: string[];
  companies: string[];
  override_data?: any;
  updated_at: string;
  created_at: string;
}

interface cityProps {
  id: number;
  name: string;
  is_active: boolean;
}

export default function Products() {
  const modals = useModals();
  const [opened, setOpened] = useState(false);
  const [product, setProduct] = useState<ProductProps>();
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState<ProductProps[]>();
  const { accessTokenPayload } = useSessionContext();
  const [dataField, setDataField] = useState([""]);
  const [cities, setCities] = useState(["Todas"]);

  const form = useForm({
    initialValues: {
      name: "",
      price: 0,
      award: 0,
      cities: ["Todas"],
      companies: ["Explorernet", "Internetup"],
      override_data: formList([{ key: "MESES_PROMOCIONAIS", value: "3" }]),
    },
    validate: {
      cities: (value) =>
        value.length == 0 ? "Escolha pelo menos uma cidade" : null,
      companies: (value) =>
        value.length == 0 ? "Escolha pelo menos uma empresa" : null,
    },
  });

  const { data, refetch } = useQuery<ProductProps[], Error>(
    "products",
    async () => {
      const response = await api.get(`api/sales/product`);
      return response.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  useEffect(() => {
    api.get("api/integrations/fields").then((res) => setDataField(res.data));
    api.get<cityProps[]>("api/city").then((res) => {
      let data = res.data.map((e) => e.name);
      data.unshift("Todas");
      setCities(data);
    });
  }, []);

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
    if (product) {
      api.put(`api/sales/product/${product?.id}`, values).then(() => {
        setOpened(false);
        refetch();
        showNotification({
          title: "Atualizado",
          message: values.name,
          color: "green",
        });
      });
    } else {
      api.post(`api/sales/product`, values).then(() => {
        setOpened(false);
        refetch();
      });
    }
  };

  const edit = (p: ProductProps) => {
    setProduct(p);
    setOpened(true);
    form.setValues({
      price: p.price,
      award: p.award,
      name: p.name,
      cities: p.cities,
      companies: p.companies,
      override_data: formList(p.override_data || []),
    });
  };

  const openDeleteModal = (p: ProductProps) => {
    modals.openConfirmModal({
      title: "Excluir plano",
      centered: true,
      children: (
        <Text size="sm">
          Você tem certeza que deseja excluir o plano <strong>{p.name}</strong>?
        </Text>
      ),
      labels: { confirm: "Excluir", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        api.delete(`api/sales/product/${p.id}`).then(() => {
          refetch();
          showNotification({
            title: "Excluído",
            message: p.name,
            color: "red",
          });
        });
      },
    });
  };

  function filterData(data: ProductProps[], search: string) {
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
            <FileInvoice size={16} />
          </Avatar>
          <Text size="sm" weight={500}>
            {item.name || "-"}
          </Text>
        </Group>
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
        <Center>{item.price}</Center>
      </td>
      <td>
        <Center>{item.award}</Center>
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
        <Center>{formatDate(item.created_at)}</Center>
      </td>
      <td>
        <Center>{formatDate(item.updated_at)}</Center>
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
          <ActionIcon color="red" onClick={() => openDeleteModal(item)}>
            <Trash size={16} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  const fields = form.values.override_data.map((_, index) => (
    <Group key={index} noWrap mb={10}>
      <Select
        data={dataField}
        {...form.getListInputProps("override_data", index, "key")}
        sx={{ width: "100%" }}
      />
      <TextInput
        {...form.getListInputProps("override_data", index, "value")}
        sx={{ width: "70%" }}
      />
      <ActionIcon
        color="red"
        variant="hover"
        sx={{ width: 30 }}
        onClick={() => form.removeListItem("override_data", index)}
      >
        <Trash size={16} />
      </ActionIcon>
    </Group>
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
            setProduct(undefined);
            setOpened(true);
          }}
          leftIcon={<Plus size={18} />}
        >
          Plano
        </Button>
      </Group>
      <ScrollArea sx={{ height: "calc(100vh - 90px)" }} offsetScrollbars>
        <Table sx={{ minWidth: 800 }} verticalSpacing="sm" highlightOnHover>
          <thead>
            <tr>
              <th>
                <Center>Descrição</Center>
              </th>
              <th>
                <Center>Empresa</Center>
              </th>
              <th>
                <Center>Valor</Center>
              </th>
              <th>
                <Center>Premiação</Center>
              </th>
              <th>
                <Center>Cidades</Center>
              </th>
              <th>
                <Center>Criado</Center>
              </th>
              <th>
                <Center>Atualizado</Center>
              </th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={<strong>{product?.name}</strong>}
          withCloseButton={false}
          overlayOpacity={0.55}
          overlayBlur={2}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput label="Nome" {...form.getInputProps("name")} required />
            <Group grow noWrap mt={5}>
              <NumberInput
                label="Preço"
                min={0}
                precision={2}
                icon={<CurrencyReal size={18} />}
                decimalSeparator=","
                {...form.getInputProps("price")}
                required
              />
              <NumberInput
                label="Premiação"
                min={0}
                precision={2}
                step={0.1}
                decimalSeparator=","
                icon={<Award size={18} />}
                {...form.getInputProps("award")}
                required
              />
            </Group>
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
              required
              {...form.getInputProps("cities")}
            />
            <Box mt={15}>
              {fields.length > 0 ? (
                <Group mb="xs" grow>
                  <Text weight={500} size="sm" sx={{ flex: 1 }} align="center">
                    Variável
                  </Text>
                  <Text weight={500} size="sm" align="center" pr={50}>
                    Valor
                  </Text>
                </Group>
              ) : null}

              {fields}

              <Group position="center" mt="md">
                <Button
                  onClick={() =>
                    form.addListItem("override_data", { key: "", value: "" })
                  }
                >
                  + Override
                </Button>
              </Group>
            </Box>
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
