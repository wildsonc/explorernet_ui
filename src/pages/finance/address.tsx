import {
    ActionIcon,
    Button,
    Group,
    Select,
    TextInput,
    useMantineTheme,
    Anchor,
    Title,
    Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { ArrowRight } from 'tabler-icons-react';
import CustumerPainel from '../../components/CustumerPainel';
import NotAuthorized from '../../components/ErrorPage/NotAuthorized';
import api from '../../services/api';
import hasPermission from '../../services/utils/hasPermission';
import { useModals } from '@mantine/modals';

interface AccessPlan {
    name: string;
    value: number;
}

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
    access_plans?: AccessPlan[];
    fix_ip_price: number;
    status?: 'OK' | 'Not Found';
}

const ChangeAddress = () => {
    const theme = useMantineTheme();
    const [data, setData] = useState<Props>();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDocument, setIsLoadingDocument] = useState(false);
    let { accessTokenPayload } = useSessionContext();
    const modals = useModals();
    const searchForm = useForm({
        initialValues: {
            type: 'codconexao',
            value: '',
        },
    });

    const roles = accessTokenPayload.roles;

    if (!hasPermission('view_finance', roles)) {
        return <NotAuthorized />;
    }

    const handleSubmitSearch = async (values: typeof searchForm.values) => {
        setIsLoading(true);
        const response = await api.post('api/finance/custumer', values);
        console.log(response);
        if (response.data.status == 'Not Found') {
            setData(undefined);
            showNotification({
                message: <strong>Não encontrado</strong>,
                color: 'red',
            });
        }
        setData(response.data);
        setIsLoading(false);
    };

    const handleSubmit = async () => {
        setIsLoadingDocument(true);
        const res = await api.post(
            'api/finance/generate_document_mde',
            data?.custumer
        );
        const openContentModal = () => {
            const id = modals.openModal({
                title: <strong>Documento criado</strong>,
                children: (
                    <>
                        <Anchor href={res.data['link']} target="_blank">
                            {res.data['link']}
                        </Anchor>
                        <Text>{res.data['msg']}</Text>
                        <Group position="center" mt={20}>
                            <Button
                                color="green"
                                onClick={() => modals.closeModal(id)}
                            >
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

    return (
        <>
            <form onSubmit={searchForm.onSubmit(handleSubmitSearch)}>
                <Group>
                    <Select
                        sx={{ maxWidth: 100 }}
                        mr={-15}
                        {...searchForm.getInputProps('type')}
                        data={[
                            { label: 'contrato', value: 'contrato' },
                            { label: 'conexão', value: 'codconexao' },
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
                        {...searchForm.getInputProps('value')}
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
            <Title mt={20} order={2}>
                Novo endereço
            </Title>
            <CustumerPainel {...data} />
            {data?.custumer && (
                <>
                    <Button
                        mt={20}
                        loading={isLoadingDocument}
                        onClick={handleSubmit}
                    >
                        {isLoadingDocument ? 'Gerando' : 'Gerar contrato'}
                    </Button>
                </>
            )}
        </>
    );
};

export default ChangeAddress;
