import {
  ActionIcon,
  Button,
  Group,
  Select,
  Switch,
  TextInput,
  Title,
  useMantineTheme,
  Anchor,
  Text,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import {
  ArrowRight,
  Businessplan,
  Settings,
  SettingsAutomation,
} from "tabler-icons-react";
import CustomerPainel from "../../components/CustomerPainel";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";
import { useModals } from "@mantine/modals";
import AutoSaveTextInput from "../../components/AutoSave/AutoSaveTextInput";

interface AccessPlan {
  name: string;
  value: number;
}

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
  access_plan: string;
  company_real_name: string;
  franchise: string;
  company: "explorernet" | "internetup";
  access_plan_price: number;
  company_cnpj: string;
  due_date: number;
}

interface Props {
  customer?: Customer;
  access_plans?: AccessPlan[];
  fix_ip_price: number;
  status?: "OK" | "Not Found";
}

const ChangePlan = () => {
  const theme = useMantineTheme();
  const [data, setData] = useState<Props>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [price, setPrice] = useState(0);
  const [accessPlan, setAccessPlan] = useState("");
  const { accessTokenPayload } = useSessionContext();
  const modals = useModals();
  const searchForm = useForm({
    initialValues: {
      type: "contrato",
      value: "",
    },
  });
  const form = useForm({
    initialValues: {
      price: 0.0,
      access_plan: "",
      fix_ip: false,
      change_owner: false,
    },
  });

  useEffect(() => {
    updatePrice();
    form.setFieldValue("access_plan", accessPlan);
  }, [accessPlan, form.values.fix_ip]);

  const roles = accessTokenPayload.roles;

  if (!hasPermission("view_finance", roles)) {
    return <NotAuthorized />;
  }

  const openSettingsModal = () =>
    modals.openModal({
      title: (
        <>
          <Text weight={600}>
            <Settings size={16} /> Configurações
          </Text>
        </>
      ),
      children: (
        <>
          <AutoSaveTextInput label="PDF Template" name="APITEMPLATE_MDP" />
          <AutoSaveTextInput label="UNICO Template" name="UNICO_MDP" />
        </>
      ),
    });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoadingDocument(true);
    const payload = { ...data?.customer, ...values };
    const res = await api.post("api/finance/mdp_unico", payload);
    const openContentModal = () => {
      const id = modals.openModal({
        title: <strong>Documento criado</strong>,
        children: (
          <>
            <Anchor href={res.data["link"]} target="_blank">
              {res.data["link"]}
            </Anchor>
            <Text>{res.data["msg"]}</Text>
            <Group position="center" mt={20}>
              <Button color="green" onClick={() => modals.closeModal(id)}>
                Ok
              </Button>
            </Group>
          </>
        ),
      });
    };
    setIsLoadingDocument(false);
    openContentModal();
  };

  const handleSubmitSearch = async (values: typeof searchForm.values) => {
    setIsLoading(true);
    const response = await api.post("api/finance/customer", {
      ...values,
      method: "change plan",
    });
    if (response.data.status == "Not Found") {
      showNotification({
        message: <strong>Não encontrado</strong>,
        color: "red",
      });
    }
    form.reset();
    setAccessPlan("");
    setData(response.data);
    setIsLoading(false);
  };

  const updatePrice = () => {
    const currentPlan = data?.access_plans?.filter(
      (e) => e.name == accessPlan
    )[0];
    let newPrice = currentPlan?.value || 0;
    if (form.values.fix_ip) newPrice += Number(data?.fix_ip_price) || 0;
    setPrice(newPrice);
    form.setFieldValue("price", newPrice);
  };

  return (
    <>
      <form onSubmit={searchForm.onSubmit(handleSubmitSearch)}>
        <Group>
          <Select
            sx={{ maxWidth: 100 }}
            mr={-15}
            {...searchForm.getInputProps("type")}
            data={[
              { label: "conexão", value: "codconexao" },
              { label: "contrato", value: "contrato" },
            ]}
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
            placeholder="8011"
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
      <CustomerPainel {...data} />
      <Title mt={20} order={2}>
        Alterar plano
      </Title>
      {data?.access_plans && (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Switch mt={15} label="IP Fixo" {...form.getInputProps("fix_ip")} />
          <Switch
            label="Troca de titularidade"
            mt={5}
            value={String(form.values.change_owner)}
            onChange={(event) =>
              form.setFieldValue("change_owner", event.currentTarget.checked)
            }
          />
          <Group mt={15}>
            <Select
              mr={-10}
              data={data.access_plans.map((e) => e.name)}
              sx={{ minWidth: 300 }}
              value={accessPlan}
              required
              onChange={(e) => {
                setAccessPlan(e || "");
              }}
            />
            <TextInput
              value={price}
              icon={<Businessplan size={18} />}
              sx={{ maxWidth: 100 }}
              disabled
            />
          </Group>
          <Button
            mt={20}
            type="submit"
            disabled={form.values.access_plan == ""}
            loading={isLoadingDocument}
          >
            {isLoadingDocument ? "Gerando" : "Gerar contrato"}
          </Button>
        </form>
      )}
      {hasPermission("admin", roles) && (
        <ActionIcon
          sx={{ position: "absolute", bottom: 30, right: 30 }}
          size="xl"
          color="blue"
          onClick={openSettingsModal}
        >
          <Settings />
        </ActionIcon>
      )}
    </>
  );
};

export default ChangePlan;
