import { Timeline, Text, ActionIcon, Group, Button } from '@mantine/core';
import { useQuery } from 'react-query';
import {
    Plus,
    Pencil,
    Check,
    MapPin,
    AlertTriangle,
    Urgent,
} from 'tabler-icons-react';
import api from '../../services/api';
import moment from 'moment';
import 'moment/locale/pt-br';
import bbox from '@turf/bbox';

interface Props {
    id: number;
    title: string;
    description: string;
    polygon: any;
    created_at: string;
}

export default function DrawerActiveContent({ mapRef }: any) {
    const { data } = useQuery<Props[], Error>('noc-notifications', async () => {
        const response = await api.get(`api/noc/notification`);
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

    const items = data.map((i) => {
        const time = moment(i.created_at).fromNow();
        return (
            <Timeline.Item
                key={i.id}
                bullet={<Urgent size={18} />}
                title={i.title}
                color="orange"
            >
                <Text color="dimmed" size="sm" weight={500}>
                    {i.description}
                </Text>
                <Button
                    onClick={() => onClick(i.polygon)}
                    size="xs"
                    variant="subtle"
                    color="yellow"
                    p={3}
                    ml={-10}
                    leftIcon={<MapPin size={16} />}
                >
                    Ver no mapa
                </Button>
                <Text size="xs" mt={4}>
                    {time}
                </Text>
            </Timeline.Item>
        );
    });

    return (
        <Timeline active={10} bulletSize={26} lineWidth={4}>
            {items}
        </Timeline>
    );
}
