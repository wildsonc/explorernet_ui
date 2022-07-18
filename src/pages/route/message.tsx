import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Drawer,
  Group,
  Paper,
  Select,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { ArrowRight, History, Send, Settings } from "tabler-icons-react";
import AutoSaveTextInput from "../../components/AutoSave/AutoSaveTextInput";
import CustomerPainel from "../../components/CustomerPainel";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import DrawerContent from "../../components/Route/DrawerContent";
import api from "../../services/api";
import { formatDate } from "../../services/utils/formatDate";
import hasPermission from "../../services/utils/hasPermission";

interface Customer {
  contract: number;
  connection: number;
  full_name: string;
  document: string;
  city: string;
  district: string;
  street: string;
  complement: string;
  number: number;
  rg: string;
  state: string;
  tax_id: string;
  phone: string;
  phone2: string;
  access_plan: string;
  company_real_name: string;
  franchise: string;
  company: "explorernet" | "internetup";
  access_plan_price: number;
  company_cnpj: string;
  due_date: number;
}

interface Props {
  customer: Customer;
  status: "OK" | "Not Found";
}

interface Service {
  cd_os: number;
  connection_id: number;
  created_at: string;
  closed_at: string;
  description: string;
  is_closed: boolean;
  status: "OK" | "Not Found";
}

const SendMessage = () => {
  const theme = useMantineTheme();
  const [data, setData] = useState<Service>();
  const [customer, setCustomer] = useState<Props>();
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  let { accessTokenPayload } = useSessionContext();
  const modals = useModals();
  const searchForm = useForm({
    initialValues: {
      type: "os",
      value: "",
    },
  });
  const form = useForm({
    initialValues: {
      template: "",
      os: 0,
    },
    validate: {
      template: (values) => (values == "" ? "Escolha o tipo" : null),
    },
  });

  useEffect(() => {
    if (data?.status == "OK")
      api
        .get(`/api/integrations/mk/customer/codconexao/${data.connection_id}`)
        .then((res) => setCustomer(res.data));
  }, [data]);

  const roles = accessTokenPayload.roles;

  if (!hasPermission("view_route", roles)) {
    return <NotAuthorized />;
  }

  const handleSubmitSearch = async (values: typeof searchForm.values) => {
    setIsLoading(true);
    setCustomer(undefined);
    form.reset();
    const response = await api.get(
      `/api/integrations/mk/service/${values.value}`
    );
    if (response.data.status == "Not Found") {
      setData(undefined);
      showNotification({
        message: <strong>Não encontrado</strong>,
        color: "red",
      });
    }
    setData(response.data);
    setIsLoading(false);
  };

  const openSettingsModal = () =>
    modals.openModal({
      title: (
        <Text weight={600}>
          <Center>
            <Settings size={16} /> Templates
          </Center>
        </Text>
      ),
      children: (
        <>
          <AutoSaveTextInput label="Manutenção" name="ROUTE_HSM_MAN" />
          <AutoSaveTextInput label="Instalação" name="ROUTE_HSM_INST" />
          <AutoSaveTextInput label="Retirada" name="ROUTE_HSM_RET" />
          <AutoSaveTextInput
            label="Sem resposta"
            name="ROUTE_HSM_NO_RESPONSE"
          />
          <AutoSaveTextInput label="Timeout" name="ROUTE_HSM_TIMEOUT" />
        </>
      ),
    });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoadingDocument(true);
    const hsm = {
      template: form.values.template,
      phone: customer?.customer.phone,
      phone2: customer?.customer.phone2,
      body: [customer?.customer.full_name.split(" ")[0], data?.cd_os],
    };
    const res = await api.post("api/route/message", {
      hsm,
      customer: customer?.customer,
      service: data,
    });
    if (res.data.status === "success") {
      showNotification({
        title: "Enviado!",
        message: res.data.message.contacts[0].input,
        color: "green",
        autoClose: 1000 * 5,
      });
    }
    if (res.data.status === "error") {
      showNotification({
        title: res.data.message.title,
        message: res.data.message.details,
        color: "red",
        autoClose: 1000 * 20,
      });
    }
    setIsLoadingDocument(false);
  };

  return (
    <>
      <Group direction="column" align="center">
        <form onSubmit={searchForm.onSubmit(handleSubmitSearch)}>
          <Group>
            <Select
              sx={{ maxWidth: 100 }}
              mr={-15}
              {...searchForm.getInputProps("type")}
              data={[{ label: "O.S.", value: "os" }]}
              styles={{
                input: {
                  height: 42,
                  fontWeight: 500,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            />
            <TextInput
              type="number"
              placeholder="134677"
              sx={{ maxWidth: 150 }}
              size="md"
              styles={{
                input: {
                  height: 42,
                  fontWeight: 500,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                },
              }}
              {...searchForm.getInputProps("value")}
              rightSection={
                <ActionIcon
                  size={32}
                  color={theme.primaryColor}
                  component="button"
                  type="submit"
                  variant="filled"
                  loading={isLoading}
                >
                  <ArrowRight size={18} />
                </ActionIcon>
              }
              rightSectionWidth={42}
            />
          </Group>
        </form>
        <CustomerPainel {...customer} />
        {data?.status == "OK" && (
          <Paper shadow="xs" p="md" withBorder>
            <Group>
              <Badge color={data.is_closed ? "red" : "green"}>
                {data.is_closed ? "Encerrada" : "Aberta"}
              </Badge>
              <Text>{data.description}</Text>
              <Text>{formatDate(data.created_at)}</Text>
            </Group>
          </Paper>
        )}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {data?.status == "OK" && (
            <Select
              label="Tipo"
              required
              data={[
                { label: "Manutenção", value: "ROUTE_HSM_MAN" },
                { label: "Instalação", value: "ROUTE_HSM_INST" },
                { label: "Retirada", value: "ROUTE_HSM_RET" },
              ]}
              {...form.getInputProps("template")}
            />
          )}
          <Button
            leftIcon={<Send size={16} />}
            color="green"
            disabled={data?.status != "OK"}
            loading={isLoadingDocument}
            type="submit"
            mt={20}
          >
            Enviar mensagem
          </Button>
        </form>
      </Group>
      {hasPermission("admin", roles) && (
        <ActionIcon
          sx={{ position: "absolute", top: 20, right: 20 }}
          size="xl"
          color="blue"
          onClick={openSettingsModal}
        >
          <Settings />
        </ActionIcon>
      )}
      <ActionIcon
        sx={{
          position: "absolute",
          bottom: 30,
          right: 10,
        }}
        size="xl"
        radius="xl"
        variant="filled"
        color="blue"
        onClick={() => setDrawerOpened(true)}
      >
        <History />
      </ActionIcon>
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        overlayOpacity={0.4}
        position="right"
        title={<Title>Histórico</Title>}
        padding="xl"
        size="md"
      >
        <DrawerContent />
      </Drawer>
    </>
  );
};

export default SendMessage;
