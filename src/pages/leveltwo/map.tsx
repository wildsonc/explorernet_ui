import Tooltip from '../../components/Map/Tooltip';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import NotAuthorized from '../../components/ErrorPage/NotAuthorized';
import hasPermission from '../../services/utils/hasPermission';
import {
    Source,
    FullscreenControl,
    NavigationControl,
    Map,
    Layer,
    MapRef,
    CircleLayer,
} from 'react-map-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Loader,
    useMantineColorScheme,
    Notification,
    Autocomplete,
    TextInput,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Button,
    Group,
    NumberInput,
    ActionIcon,
    Drawer,
    Title,
} from '@mantine/core';
import { useQuery } from 'react-query';
import { ExtendedFeature } from 'd3-geo';
import api from '../../services/api';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, X, History } from 'tabler-icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import DrawerContent from '../../components/Support2/DrawerContent';

interface ITooltip {
    x: number;
    y: number;
    feature: {
        properties: {
            name: string;
            free: number;
            status: string;
        };
    };
}

interface City {
    value: number;
    label: string;
}

function Docs() {
    const { colorScheme } = useMantineColorScheme();
    const [hoverInfo, setHoverInfo] = useState<ITooltip>();
    const [cto, setCto] = useState('');
    const [coordinate, setCoordinate] = useState('');
    const [cities, setCities] = useState<string[]>();
    const [debouncedCto] = useDebouncedValue(cto, 200);
    const [drawerOpened, setDrawerOpened] = useState(false);
    const form = useForm({
        initialValues: {
            name: '',
            location: '',
            signal: -0,
            city: '',
            free: 0,
            capacity: '',
        },
        validate: {
            name: (value) => (value.length < 3 ? 'Mínimo 3 caracteres' : null),
            signal: (value) => (value > 0 ? 'Sinal inválido' : null),
            free: (value) =>
                value >= 0 && value <= 16 ? null : 'Quantidade inválida',
            location: (value) => {
                const [lat, lon] = value.split(',');
                const longitude = parseFloat(lon);
                const latitude = parseFloat(lat);
                if (longitude > -46 || longitude < -51 || isNaN(longitude))
                    return 'Longitude inválida';
                if (latitude > -14 || latitude < -19 || isNaN(latitude))
                    return 'Latitude inválida';
                return null;
            },
        },
    });

    let { accessTokenPayload } = useSessionContext();

    useEffect(() => {
        api.get<City[]>('api/leveltwo/city').then((res) =>
            setCities(res.data.map((e) => e.label))
        );
    }, []);

    const mapRef = useRef<MapRef>();

    const dark = colorScheme === 'dark';

    const { isLoading, isError, isFetching, data, error, refetch } = useQuery<
        ExtendedFeature[],
        Error
    >(
        'cto-map-data',
        async () => {
            const response = await api.get(`api/leveltwo/cto`);
            return response.data;
        },
        {
            staleTime: 1000 * 60 * 5, // 5 minutes
        }
    );

    const onHover = useCallback((event) => {
        if (event.features[0].layer.id == 'point') {
            const {
                features,
                point: { x, y },
            } = event;
            const hoveredFeature = features && features[0];

            setHoverInfo(hoveredFeature && { feature: hoveredFeature, x, y });
        }
    }, []);

    const pointLayer: CircleLayer = {
        id: 'point',
        type: 'circle',
        paint: {
            'circle-radius': {
                base: 1.75,
                stops: [
                    [12, 2],
                    [22, 180],
                ],
            },
            'circle-color': [
                'match',
                ['get', 'status'],
                'OK',
                'green',
                'ALERTA',
                'yellow',
                'CHEIA',
                'red',
                /* other */ '#ccc',
            ],
        },
    };

    const Fly = (coordinates: [number, number]) => {
        mapRef.current?.flyTo({
            center: coordinates,
            zoom: 20,
            essential: true,
        });
    };

    const dataMap = useMemo(() => {
        return data;
    }, [data]);

    const SearchCto = useMemo(() => {
        if (debouncedCto && data) {
            //@ts-ignore
            let ctos = data.features.filter((e) =>
                e.properties.name
                    .toLowerCase()
                    .includes(debouncedCto.toLowerCase())
            );
            ctos = ctos.slice(0, 5);
            const result: any = [];
            ctos.map((e: any) => {
                const obj = {
                    value: e.properties.name,
                    coordinates: e.geometry.coordinates,
                };
                result.push(obj);
            });
            return result;
        }
    }, [debouncedCto, data]);

    const roles = accessTokenPayload.roles;

    if (!hasPermission('view_support2', roles)) {
        return <NotAuthorized />;
    }

    const handleSubmit = (values: typeof form.values) => {
        const [lat, lon] = values.location.split(',');
        const longitude = parseFloat(lon);
        const latitude = parseFloat(lat);
        const name = values.name.toLocaleUpperCase();
        const payload = {
            ...values,
            name,
            longitude,
            latitude,
        };
        console.log(payload);
        api.post('api/leveltwo/cto', payload).then((res) => {
            if (res.status == 200) {
                showNotification({
                    title: 'Caixa atualizada!',
                    message: name,
                });
            } else if (res.status == 201) {
                showNotification({
                    title: 'Caixa criada!',
                    message: name,
                    color: 'green',
                });
            }
            refetch();
            Fly([longitude, latitude]);
        });
    };

    return (
        <Map
            preserveDrawingBuffer
            // @ts-ignore
            ref={mapRef}
            onMouseMove={onHover}
            interactiveLayerIds={['point']}
            onMouseLeave={() => setHoverInfo(undefined)}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            mapStyle={
                dark
                    ? 'mapbox://styles/mapbox/dark-v10'
                    : 'mapbox://styles/mapbox/streets-v11'
            }
            style={{
                width: '100%',
                height: '100%',
                borderRadius: 5,
            }}
            initialViewState={{
                longitude: -48.97148,
                latitude: -16.32878,
                zoom: 12,
            }}
        >
            {data && (
                //  @ts-ignore-next-line
                <Source id="map-data" type="geojson" data={dataMap}>
                    <Layer {...pointLayer} />
                </Source>
            )}
            <Paper
                shadow="xs"
                p="md"
                withBorder
                sx={{ position: 'absolute', top: 10, left: 10, width: 350 }}
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label="Nome da caixa"
                        placeholder="CD5-123"
                        required
                        {...form.getInputProps('name')}
                    />
                    <TextInput
                        label="Localização"
                        placeholder="-16.3255, -48.7855"
                        required
                        {...form.getInputProps('location')}
                    />
                    <TextInput
                        label="Sinal"
                        placeholder="-21.34"
                        required
                        type="number"
                        {...form.getInputProps('signal')}
                    />
                    <NumberInput
                        label="Portas livres"
                        placeholder="3"
                        min={0}
                        max={16}
                        required
                        {...form.getInputProps('free')}
                    />
                    <Select
                        label="Cidade"
                        data={cities ? cities : ['Carregando...']}
                        placeholder="Escolha a cidade"
                        nothingFound="Nenhuma encontrada"
                        searchable
                        required
                        filter={(value, item) => {
                            if (!item.label) return true;
                            return item.label
                                .normalize('NFD')
                                .replace(/[\u0300-\u036f]/g, '')
                                .toLowerCase()
                                .includes(
                                    value
                                        .normalize('NFD')
                                        .replace(/[\u0300-\u036f]/g, '')
                                        .toLocaleLowerCase()
                                );
                        }}
                        {...form.getInputProps('city')}
                    />
                    <RadioGroup
                        label="Modelo"
                        required
                        {...form.getInputProps('capacity')}
                    >
                        <Radio value="8" label="1x8" />
                        <Radio value="16" label="1x16" />
                    </RadioGroup>
                    <Group position="center" mt={10}>
                        <Button
                            onClick={() => form.reset()}
                            variant="outline"
                            color="gray"
                        >
                            Limpar
                        </Button>
                        <Button type="submit">Enviar</Button>
                    </Group>
                </form>
            </Paper>
            <FullscreenControl position="top-right" />
            <NavigationControl position="top-right" />
            <Autocomplete
                icon={<Search size={14} />}
                onChange={setCoordinate}
                value={coordinate}
                data={[coordinate]}
                onItemSubmit={(e) => {
                    const c = e.value.split(',');
                    try {
                        const lat = Number(c[0]);
                        const lon = Number(c[1]);
                        Fly([lon, lat]);
                    } catch {
                        showNotification({
                            title: 'Localização inválida',
                            message: 'Exemplo: -16.31809,-48.96837',
                            color: 'red',
                        });
                    }
                }}
                placeholder="Coordenadas"
                sx={{
                    position: 'absolute',
                    top: 10,
                    right: 270,
                    borderRadius: 5,
                    minWidth: 200,
                }}
            />
            <Autocomplete
                onChange={setCto}
                value={cto}
                data={SearchCto ? SearchCto : []}
                onItemSubmit={(e) => Fly(e.coordinates)}
                icon={<Search size={14} />}
                placeholder="CTO"
                sx={{
                    position: 'absolute',
                    top: 10,
                    right: 50,
                    borderRadius: 5,
                    minWidth: 200,
                }}
            />
            <ActionIcon
                sx={{
                    position: 'absolute',
                    bottom: 30,
                    right: 15,
                }}
                size="xl"
                radius="xl"
                variant="filled"
                color="white"
                onClick={() => setDrawerOpened(true)}
            >
                <History />
            </ActionIcon>
            {hoverInfo && (
                <Tooltip x={hoverInfo.x} y={hoverInfo.y}>
                    <div>{hoverInfo.feature.properties.name}</div>
                    <div>Livres: {hoverInfo.feature.properties.free}</div>
                </Tooltip>
            )}
            {isError && (
                <Notification
                    icon={<X size={18} />}
                    color="red"
                    sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        zIndex: 10,
                    }}
                >
                    {error.message}
                </Notification>
            )}
            {(isLoading || isFetching) && (
                <Loader
                    size="lg"
                    sx={{
                        position: 'absolute',
                        zIndex: 10,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(50%, -50%)',
                    }}
                />
            )}
            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                position="right"
                overlayOpacity={0.4}
                title={<Title>Histórico</Title>}
                padding="xl"
                size="md"
            >
                <DrawerContent mapRef={mapRef.current} />
            </Drawer>
        </Map>
    );
}

export default Docs;
