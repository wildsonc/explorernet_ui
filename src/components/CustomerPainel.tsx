import { Badge, Group, Paper, Title, Text } from "@mantine/core";
import { BrandWhatsapp, Home, License } from "tabler-icons-react";

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
}

const CustomerPainel = ({ customer }: Props) => {
  if (!customer) return <></>;
  const fullAddress = `${customer.street}, ${customer.number}, ${customer.complement}, ${customer.district}, ${customer.city} - ${customer.state}`;
  return (
    <>
      <Paper shadow="xs" p="md" withBorder mt={20}>
        <Title order={3}>
          {customer.full_name} - {customer.document}
        </Title>
        <Group>
          <Badge color={customer.company == "explorernet" ? "orange" : "pink"}>
            {customer.company}
          </Badge>
          <Text color="dimmed">{customer.franchise}</Text>
        </Group>
        <Group pt={20}>
          <Home size={20} />
          <Text>{fullAddress}</Text>
        </Group>
        <Group>
          <License size={20} />
          <Text>{customer.access_plan}</Text>
        </Group>
        <Group>
          <BrandWhatsapp size={20} />
          <Text>{customer.phone}</Text>
        </Group>
      </Paper>
    </>
  );
};

export default CustomerPainel;
