import {
  ActionIcon,
  Group,
  Select,
  TextInput,
  useMantineTheme,
  Title,
  Grid,
  Text,
  Timeline,
  ScrollArea,
  Badge,
  Paper,
  Checkbox,
  createStyles,
  Table,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { ArrowRight, FileInvoice, Lock, LockOpen } from "tabler-icons-react";
import CustomerPainel from "../../components/CustomerPainel";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import { formatDate } from "../../services/utils/formatDate";
import hasPermission from "../../services/utils/hasPermission";
import "dayjs/locale/pt-br";

interface History {
  id: number;
  date: string;
  hour: string;
  description: string;
  color: string;
  line: "solid" | "dashed";
  icon: "invoice" | "lock" | "unlock" | "default";
}

interface Invoice {
  id: string;
  due_date: string;
  description: string;
  type: string;
  value: number;
  overdue: boolean;
}

interface Customer {
  contract: number;
  connection: number;
  customer?: number;
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
  history: History[];
  invoices: Invoice[];
  used_days: number;
  status?: "OK" | "Not Found";
}

const iconHistory = {
  invoice: <FileInvoice size={16} />,
  lock: <Lock size={16} />,
  unlock: <LockOpen size={16} />,
  default: null,
};

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

const Negotiation = () => {
  const { accessTokenPayload } = useSessionContext();
  const { classes, cx } = useStyles();
  const [selection, setSelection] = useState(["1"]);
  const theme = useMantineTheme();
  const [data, setData] = useState<Props>();
  const [isLoading, setIsLoading] = useState(false);
  const [interest, setInterest] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const searchForm = useForm({
    initialValues: {
      type: "codconexao",
      value: "",
    },
  });

  useEffect(() => {
    if (!data?.customer) return;
    let total = 0;
    let newInterest = 0;
    data.invoices.forEach((e) => {
      if (selection.includes(e.id)) {
        total += e.value;
        const days = dateDiff(new Date(e.due_date));
        newInterest += e.value * 0.02 + e.value * days * 0.001;
      }
    });
    setInterest(newInterest);
    setTotalPrice(total + newInterest);
  }, [selection]);

  const dateDiff = (date: Date | null) => {
    const a = moment(date);
    const days = a.diff(moment().startOf("day"), "days");
    if (days == 0) return 0;
    if (days < -1) return days * -1;
    if (days < 0) return days * -1;
    return days;
  };

  const items = useMemo(() => {
    return data?.history?.map((e) => {
      return (
        <Timeline.Item
          bullet={iconHistory[e.icon]}
          title={e.description}
          key={e.id}
          color={e.color}
          lineVariant={e.line}
        >
          <Text color="dimmed" size="sm">
            {e.date} {e.hour}
          </Text>
        </Timeline.Item>
      );
    });
  }, [data?.history]);

  const roles = accessTokenPayload.roles;

  if (!hasPermission("view_finance", roles)) {
    return <NotAuthorized />;
  }

  const handleSubmitSearch = async (values: typeof searchForm.values) => {
    setIsLoading(true);
    setSelection([]);
    const response = await api.post<Props>("api/finance/customer", {
      ...values,
      method: "negotiation",
    });
    if (response.data.status == "Not Found") {
      setData(undefined);
      setIsLoading(false);
      return showNotification({
        message: <strong>N??o encontrado</strong>,
        color: "red",
      });
    }
    setData(response.data);
    setIsLoading(false);
  };

  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () => {
    if (!data) return;
    setSelection((current) =>
      current.length === data.invoices.length
        ? []
        : data.invoices.map((item) => item.id)
    );
  };

  const rows = data?.invoices.map((item) => {
    const selected = selection.includes(item.id);
    return (
      <tr key={item.id} className={cx({ [classes.rowSelected]: selected })}>
        <td>
          <Checkbox
            checked={selection.includes(item.id)}
            onChange={() => toggleRow(item.id)}
            transitionDuration={0}
          />
        </td>
        <td>
          {item.description}{" "}
          {item.overdue ? (
            <Badge ml={10} color="red">
              vencida
            </Badge>
          ) : (
            ""
          )}
        </td>
        <td>
          <Badge color="cyan">{item.type}</Badge>
        </td>
        <td>{formatDate(item.due_date, false)}</td>
        <td>
          <strong>R$ {item.value}</strong>
        </td>
      </tr>
    );
  });

  return (
    <>
      <form onSubmit={searchForm.onSubmit(handleSubmitSearch)}>
        <Group>
          <Select
            sx={{ maxWidth: 100 }}
            mr={-15}
            {...searchForm.getInputProps("type")}
            data={[
              { label: "contrato", value: "contrato" },
              { label: "conex??o", value: "codconexao" },
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
      <Title mt={5} mb={-10} order={2}>
        Negocia????o
      </Title>
      <Grid>
        <Grid.Col sm={9}>
          <ScrollArea sx={{ height: 680 }}>
            <CustomerPainel {...data} />
            {data?.customer && (
              <>
                <Title order={4} mt={10}>
                  Faturas
                </Title>

                <Paper withBorder p={5}>
                  <ScrollArea sx={{ height: 200 }} type="always">
                    <Table verticalSpacing="xs" highlightOnHover>
                      <thead>
                        <tr>
                          <th style={{ width: 30 }}>
                            <Checkbox
                              onChange={toggleAll}
                              checked={
                                selection.length === data?.invoices.length
                              }
                              indeterminate={
                                selection.length > 0 &&
                                selection.length !== data?.invoices.length
                              }
                              transitionDuration={0}
                            />
                          </th>
                          <th>Descri????o</th>
                          <th>Tipo</th>
                          <th>Vencimento</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>{rows}</tbody>
                    </Table>
                  </ScrollArea>
                </Paper>
                <Group mt={20} position="center" align="start">
                  <Group direction="column" position="center">
                    <Badge size="lg" color="lime" mb={-10}>
                      ?? vista
                    </Badge>
                    <Text weight={500}>
                      R$ {(totalPrice - interest).toFixed(2)}
                    </Text>
                  </Group>
                  <Group direction="column" position="center">
                    <Badge size="lg" color="grape" mb={-10}>
                      3X
                    </Badge>
                    <Text weight={500}>R$ {totalPrice.toFixed(2)}</Text>
                    <Text mt={-20} color="dimmed" weight={500}>
                      3x {(totalPrice / 3).toFixed(2)}
                    </Text>
                    <Text mt={-20} color="red" weight={700}>
                      + {interest.toFixed(2)}
                    </Text>
                  </Group>
                  <Group direction="column" position="center">
                    <Badge size="lg" color="indigo" mb={-10}>
                      6X
                    </Badge>
                    <Text weight={500}>
                      R$ {(totalPrice * 1.12).toFixed(2)}
                    </Text>
                    <Text mt={-20} weight={500} color="dimmed">
                      6x {((totalPrice * 1.12) / 6).toFixed(2)}
                    </Text>
                    <Text mt={-20} color="red" weight={700}>
                      + {(totalPrice * 1.12 - totalPrice).toFixed(2)}
                    </Text>
                  </Group>
                </Group>
              </>
            )}
          </ScrollArea>
        </Grid.Col>
        <Grid.Col sm={2}>
          <ScrollArea sx={{ height: 680, width: 300 }}>
            <Timeline active={100} bulletSize={20} lineWidth={2}>
              {items}
            </Timeline>
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default Negotiation;
