import {
    Timeline,
    Text,
    ActionIcon,
    Group,
    Button,
    ScrollArea,
} from '@mantine/core';
import { useQuery } from 'react-query';
import { Plus, Pencil, Check, MapPin } from 'tabler-icons-react';
import api from '../../services/api';
import moment from 'moment';
import 'moment/locale/pt-br';
import bbox from '@turf/bbox';

interface Props {
    id: number;
    action: 'A' | 'F' | 'U';
    user: {
        full_name: string;
    };
    object: {
        title: string;
        polygon: any;
    };
    created_at: string;
}

export default function DrawerContent({ mapRef }: any) {
    const { data } = useQuery<Props[], Error>('noc-history', async () => {
        const response = await api.get(`api/noc/history`);
        return response.data;
    });

    if (!data) return null;

    const onClick = (polygon: any) => {
        if (polygon) {
            // calculate the bounding box of the feature
            const [minLng, minLat, maxLng, maxLat] = bbox(polygon);

            mapRef.fitBounds(
                [
                    [minLng, minLat],
                    [maxLng, maxLat],
                ],
                { padding: 40, duration: 2000 }
            );
        }
    };

    moment.locale('pt-br');

    const actions = {
        A: {
            label: 'Nova área',
            icon: <Plus />,
            color: 'red',
        },
        F: {
            label: 'Resolvido',
            icon: <Check />,
            color: 'green',
        },
        U: {
            label: 'Prorrogado',
            icon: <Pencil />,
            color: 'dark',
        },
    };

    const items = data.map((i) => {
        const time = moment(i.created_at).fromNow();
        const action = actions[i.action];
        const title = (
            <Group>
                {action.label}
                <Button
                    onClick={() => onClick(i.object.polygon)}
                    size="xs"
                    variant="subtle"
                    p={3}
                    ml={-10}
                    leftIcon={<MapPin size={16} />}
                >
                    Ver no mapa
                </Button>
            </Group>
        );
        return (
            <Timeline.Item
                key={i.id}
                bullet={action.icon}
                title={title}
                color={action.color}
            >
                <Text color="dimmed" size="sm" weight={500}>
                    {i.object.title}
                </Text>
                <Text size="xs" mt={4}></Text>
                <Text size="xs" mt={4}>
                    <Text color="dimmed" size="xs">
                        {i.user.full_name}
                    </Text>
                    {time}
                </Text>
            </Timeline.Item>
        );
    });

    return (
        <ScrollArea sx={{ height: '100%' }}>
            <Timeline active={10} bulletSize={24} lineWidth={4}>
                {items}
            </Timeline>
        </ScrollArea>
    );
}
