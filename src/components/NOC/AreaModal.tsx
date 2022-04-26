import {
    Modal,
    Group,
    Button,
    Title,
    Avatar,
    Tooltip,
    Text,
    NativeSelect,
    TextInput,
    Stack,
} from '@mantine/core';
import api from '../../services/api';
import moment from 'moment';
import 'moment/locale/pt-br';
import { formatDate } from '../../services/utils/formatDate';
import { useState } from 'react';
import { useForm } from '@mantine/form';

interface Props {
    onClose: (v: boolean) => void;
    open: boolean;
    refetch: () => void;
    data: any;
}

export default function AreaModal({ onClose, open, data, refetch }: Props) {
    const [opened, setOpened] = useState(false);
    const form = useForm({ initialValues: { time: '1', time_type: 'horas' } });
    if (!data) return null;
    const resolve = async (id: number) => {
        await api.put(`api/noc/notification/${id}`);
        refetch();
        onClose(false);
    };
    const extend = async (id: number) => {
        await api.put(`api/noc/notification/extend/${id}`, form.values);
        refetch();
        setOpened(false);
        onClose(false);
    };

    const title = <Title order={3}>{data.title}</Title>;
    moment.locale('pt-br');
    const created_at = moment(data.created_at).fromNow();

    const select = (
        <NativeSelect
            data={['horas', 'minutos']}
            {...form.getInputProps('time_type')}
            styles={{
                input: {
                    fontWeight: 500,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                },
            }}
        />
    );

    return (
        <Modal opened={open} onClose={() => onClose(false)} title={title}>
            <Text>{data.description}</Text>
            <Text>
                <strong>Usuários afetados:</strong>{' '}
                {data.polygon?.properties?.custumers}
            </Text>
            <Text py={10} color="dimmed">
                Previsão: {formatDate(data.expected_date)}
            </Text>
            <Group position="apart">
                <Group position="left" sx={{ marginBottom: -5 }}>
                    <Tooltip label={data.user.full_name} position="bottom">
                        <Avatar
                            color="indigo"
                            radius="xl"
                            size="sm"
                            sx={{ marginRight: -10 }}
                        >
                            {data.user.first_name.substring(0, 1)}
                            {data.user.last_name.substring(0, 1)}{' '}
                        </Avatar>{' '}
                    </Tooltip>
                    <Text size="sm">{created_at}</Text>
                </Group>
                <Group position="center">
                    <Button
                        variant="outline"
                        color="orange"
                        onClick={() => setOpened(true)}
                    >
                        Prorrogar
                    </Button>
                    <Button
                        variant="filled"
                        color="green"
                        onClick={() => resolve(data.id)}
                    >
                        Resolver
                    </Button>
                </Group>
            </Group>
            <Modal
                opened={opened}
                centered
                onClose={() => setOpened(false)}
                title={<Title order={4}>Prorrogar</Title>}
            >
                <Stack align="center">
                    <TextInput
                        type="number"
                        placeholder="1"
                        rightSection={select}
                        sx={{ width: 200 }}
                        rightSectionWidth={100}
                        {...form.getInputProps('time')}
                    />
                    <Button
                        variant="outline"
                        color="orange"
                        mt={15}
                        onClick={() => extend(data.id)}
                    >
                        Prorrogar
                    </Button>
                </Stack>
            </Modal>
        </Modal>
    );
}
