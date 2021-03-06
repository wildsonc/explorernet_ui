import {
    ActionIcon,
    Badge,
    Button,
    Checkbox,
    Group,
    Modal,
    ScrollArea,
    Select,
    Switch,
    Table,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { Pencil, Plus, Trash } from 'tabler-icons-react';
import NotAuthorized from '../../components/ErrorPage/NotAuthorized';
import api from '../../services/api';
import hasPermission from '../../services/utils/hasPermission';

interface Props {
    id: number;
    name: string;
    phone: string;
    api_key: string;
    namespace: string;
    is_active: boolean;
    updated_at: string;
}

const initialValues = {
    name: '',
    api_key: '',
    namespace: '',
};

function Database() {
    const { accessTokenPayload } = useSessionContext();
    const addForm = useForm({ initialValues });
    const editForm = useForm({
        initialValues: { ...initialValues, id: 0, is_active: true },
    });
    const modals = useModals();
    const [opened, setOpened] = useState(false);
    const [openedEdit, setOpenedEdit] = useState(false);

    const { data, refetch } = useQuery<Props[], Error>(
        'dialog',
        async () => {
            const response = await api.get(`api/whatsapp/dialog`);
            return response.data;
        },
        {
            staleTime: 1000 * 60,
        }
    );

    const roles = accessTokenPayload.roles;

    if (!hasPermission('admin', roles)) {
        return <NotAuthorized />;
    }

    if (!data) return <></>;

    const formatDate = (date: string) => {
        let newDate = new Date(date).toLocaleString();
        return newDate;
    };

    const openDeleteModal = (e: Props) =>
        modals.openConfirmModal({
            title: <Title order={3}>Deletar banco de dados</Title>,
            centered: true,
            children: (
                <Text size="sm">
                    Voc?? tem certeza que quer apagar o bando de dados{' '}
                    <strong>{e.name}</strong>? Essa opera????o ?? irrevers??vel.
                </Text>
            ),
            labels: { confirm: 'Deletar', cancel: 'Cancelar' },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Cancel'),
            onConfirm: () => deleteDatabase(e),
        });
    const deleteDatabase = async (e: Props) => {
        const response = await api.delete(`api/whatsapp/dialog/${e.id}`);
        showNotification({
            title: 'Deletado',
            message: e.name,
            color: 'red',
        });
        refetch();
    };

    const handleSubmit = async (values: typeof addForm.values) => {
        await api.post(`api/whatsapp/dialog`, values);
        refetch();
        setOpened(false);
        addForm.reset();
    };

    const handleEditSubmit = async (values: typeof editForm.values) => {
        await api.put(`api/whatsapp/dialog/${values.id}`, values);
        refetch();
        setOpenedEdit(false);
        editForm.reset();
    };

    const addFormContent = (
        <form onSubmit={addForm.onSubmit(handleSubmit)}>
            <TextInput
                label="Nome"
                {...addForm.getInputProps('name')}
                required
            />
            <TextInput
                label="Api key"
                required
                {...addForm.getInputProps('api_key')}
            />
            <TextInput
                label="Namespace"
                required
                {...addForm.getInputProps('namespace')}
            />
            <Group position="right" mt={20}>
                <Button variant="filled" color="green" type="submit">
                    Salvar
                </Button>
            </Group>
        </form>
    );
    const editFormContent = (
        <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
            <TextInput
                label="Nome"
                {...editForm.getInputProps('name')}
                required
            />
            <TextInput
                label="Api key"
                required
                {...editForm.getInputProps('api_key')}
            />
            <TextInput
                label="Namespace"
                required
                {...editForm.getInputProps('namespace')}
            />
            <Group position="right" mt={20}>
                <Button variant="filled" color="green" type="submit">
                    Salvar
                </Button>
            </Group>
        </form>
    );

    const rows = data.map((item) => (
        <tr key={item.id}>
            <td>
                <Text size="sm" weight={500}>
                    {item.name}
                </Text>
            </td>

            <td>
                <Text size="sm" weight={500}>
                    {item.phone}
                </Text>
            </td>
            <td>
                {item.is_active ? (
                    <Badge color="green">ATIVO</Badge>
                ) : (
                    <Badge color="red">INATIVO</Badge>
                )}
            </td>
            <td>
                <Text size="sm" weight={500}>
                    {formatDate(item.updated_at)}
                </Text>
            </td>
            <td>
                <Group spacing={0} position="left">
                    <ActionIcon
                        onClick={() => {
                            editForm.setValues({ ...item });
                            setOpenedEdit(true);
                        }}
                    >
                        <Pencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                        color="red"
                        onClick={() => openDeleteModal(item)}
                    >
                        <Trash size={16} />
                    </ActionIcon>
                </Group>
            </td>
        </tr>
    ));
    return (
        <>
            <ScrollArea>
                <Table
                    sx={{ minWidth: 800 }}
                    verticalSpacing="xs"
                    highlightOnHover
                >
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Status</th>
                            <th>Atualizado</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </Table>
            </ScrollArea>
            <Modal
                title={<Title order={3}>Adicionar empresa</Title>}
                opened={opened}
                onClose={() => setOpened(false)}
            >
                {addFormContent}
            </Modal>
            <Modal
                title={<Title order={3}>Editar empresa</Title>}
                opened={openedEdit}
                onClose={() => setOpenedEdit(false)}
            >
                {editFormContent}
            </Modal>
            <ActionIcon
                sx={{ position: 'absolute', bottom: 20, right: 30 }}
                radius="xl"
                size="xl"
                color="blue"
                variant="filled"
                onClick={() => setOpened(true)}
            >
                <Plus />
            </ActionIcon>
        </>
    );
}

export default Database;
