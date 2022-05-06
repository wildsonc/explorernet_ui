import { Badge, Group, Paper, Title, Text } from '@mantine/core';
import { BrandWhatsapp, DeviceMobile, Home, License } from 'tabler-icons-react';

interface Custumer {
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
    company: 'explorernet' | 'internetup';
    access_plan_price: number;
    company_cnpj: string;
    due_date: number;
}

interface Props {
    custumer?: Custumer;
}

const CustumerPainel = ({ custumer }: Props) => {
    if (!custumer) return <></>;
    const fullAddress = `${custumer.street}, ${custumer.number}, ${custumer.complement}, ${custumer.district}, ${custumer.city} - ${custumer.state}`;
    return (
        <>
            <Paper shadow="xs" p="md" withBorder mt={20}>
                <Title order={3}>
                    {custumer.full_name} - {custumer.document}
                </Title>
                <Group>
                    <Badge
                        color={
                            custumer.company == 'explorernet'
                                ? 'orange'
                                : 'pink'
                        }
                    >
                        {custumer.company}
                    </Badge>
                    <Text color="dimmed">{custumer.franchise}</Text>
                </Group>
                <Group pt={20}>
                    <Home size={20} />
                    <Text>{fullAddress}</Text>
                </Group>
                <Group>
                    <License size={20} />
                    <Text>{custumer.access_plan}</Text>
                </Group>
                <Group>
                    <BrandWhatsapp size={20} />
                    <Text>{custumer.phone}</Text>
                </Group>
            </Paper>
        </>
    );
};

export default CustumerPainel;