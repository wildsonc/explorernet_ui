import {
    Modal,
    Title,
    Stepper,
    Center,
    Container,
    Textarea,
    Group,
    Button,
    TextInput,
    Checkbox,
    Stack,
    NativeSelect,
} from '@mantine/core';
import { useState, useMemo, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { ExtendedFeature, geoContains } from 'd3-geo';
import { NewSection } from 'tabler-icons-react';
import api from '../../services/api';

export default function AreaControl({ polygon, dataMap, refetch }: any) {
    const [selectedPoints, setSelectedPoints] = useState<ExtendedFeature[]>([]);
    const [active, setActive] = useState(0);
    const [opened, setOpened] = useState(false);

    const form = useForm({
        initialValues: {
            title: '',
            description: '',
            telegram: false,
            whatsapp: true,
            sms: false,
            custumers: selectedPoints,
            polygon: polygon,
        },
    });
    type FormValues = typeof form.values;

    const handleSubmit = async (values: FormValues) => {
        let data = { ...values, polygon: values.polygon[0] };
        data.polygon.properties = {
            custumers: values.custumers.length,
        };
        await api.post('api/noc/notification', data);
        setOpened(false);
        refetch();
    };

    useMemo(() => {
        if (dataMap && polygon) {
            setSelectedPoints(insidePolygon(Object.values(polygon), dataMap));
        }
    }, [dataMap, polygon]);

    useEffect(() => {
        form.setFieldValue('custumers', selectedPoints);
        if (polygon) {
            form.setFieldValue('polygon', Object.values(polygon));
        }
    }, [polygon]);

    const nextStep = () =>
        setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () =>
        setActive((current) => (current > 0 ? current - 1 : current));

    return (
        <>
            {polygon && selectedPoints?.length && (
                <Stack
                    sx={{
                        backgroundColor: 'white',
                        color: 'black',
                        borderRadius: 5,
                        padding: '5px 10px',
                        boxShadow: '0 0 0 2px rgb(0 0 0 / 10%)',
                        textAlign: 'center',
                        position: 'absolute',
                        top: 10,
                        left: '50%',
                        transform: 'translate(-50%, 0)',
                        zIndex: 10,
                    }}
                >
                    <span>
                        {' '}
                        <strong>Selecionados:</strong> {selectedPoints.length}
                    </span>
                    <Button
                        onClick={() => setOpened(true)}
                        leftIcon={<NewSection />}
                    >
                        Nova área
                    </Button>
                </Stack>
            )}
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title={<Title order={3}>Criar nova área</Title>}
                size="xl"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stepper
                        active={active}
                        onStepClick={setActive}
                        breakpoint="sm"
                    >
                        <Stepper.Step
                            label="Confirmar"
                            description={`${selectedPoints.length} selecionados`}
                        >
                            <Center
                                style={{ padding: 10, textAlign: 'center' }}
                            >
                                <div>
                                    <p>
                                        <strong>Confirmar seleção?</strong>
                                    </p>
                                    <p>
                                        {selectedPoints.length} clientes
                                        selecionados
                                    </p>
                                </div>
                            </Center>
                        </Stepper.Step>
                        <Stepper.Step
                            label="Informações"
                            description="Descrição do problema"
                        >
                            <Center>
                                <Container sx={{ width: 350 }}>
                                    <TextInput
                                        mt="md"
                                        required
                                        label="Título"
                                        {...form.getInputProps('title')}
                                    />
                                    <Textarea
                                        mt="md"
                                        label="Descrição"
                                        required
                                        {...form.getInputProps('description')}
                                    />
                                </Container>
                            </Center>
                        </Stepper.Step>
                        <Stepper.Step
                            label="Notificação"
                            description="Escolha os canais"
                        >
                            <Center>
                                <Container>
                                    <Checkbox
                                        mt="md"
                                        label="Telegram (Interno)"
                                        {...form.getInputProps('telegram', {
                                            type: 'checkbox',
                                        })}
                                    />
                                    <Checkbox
                                        mt="md"
                                        label="Whatsapp"
                                        {...form.getInputProps('whatsapp', {
                                            type: 'checkbox',
                                        })}
                                    />
                                </Container>
                            </Center>
                        </Stepper.Step>
                        <Stepper.Completed>
                            <Center>
                                <Button
                                    size="lg"
                                    color="green"
                                    variant="outline"
                                    type="submit"
                                >
                                    Criar
                                </Button>
                            </Center>
                        </Stepper.Completed>
                    </Stepper>

                    <Group position="center" mt="xl">
                        {active > 0 && (
                            <Button variant="default" onClick={prevStep}>
                                Voltar
                            </Button>
                        )}
                        {active < 3 && (
                            <Button onClick={nextStep}>Próximo</Button>
                        )}
                    </Group>
                </form>
            </Modal>
        </>
    );
}

function insidePolygon(polygon: any, dataRaw: any) {
    for (const p of polygon) {
        const coord = p.geometry.coordinates;
        var newData = dataRaw.features.filter((e: any) => {
            if (isClockwise(coord[0])) {
                return geoContains(p, e.geometry.coordinates);
            } else {
                return !geoContains(p, e.geometry.coordinates);
            }
        });
        newData = newData.map((e: any) => e.properties);
        const custumers = newData.map((e: any) => e.username);
        console.log(custumers);
        return newData;
    }

    return dataRaw;
}

function isClockwise(vertices: any) {
    var area = 0;
    for (var i = 0; i < vertices.length; i++) {
        let j = (i + 1) % vertices.length;
        area += vertices[i][0] * vertices[j][1];
        area -= vertices[j][0] * vertices[i][1];
    }
    return area / 2 < 0;
}
