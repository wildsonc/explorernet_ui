import {
    Button,
    Group,
    Stepper,
    Switch,
    TextInput,
    Title,
    Text,
    Modal,
    Code,
    Stack,
    UnstyledButton,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { BrandTelegram, Fingerprint, Refresh } from 'tabler-icons-react';
import { showNotification } from '@mantine/notifications';
import api from '../../services/api';

interface Props {
    telegram_active: boolean;
    need_start: boolean;
    username?: string;
}

const Notifications = () => {
    const [active, setActive] = useState(0);
    const [opened, setOpened] = useState(false);
    const [telegram, setTelegram] = useState(false);
    const [data, setData] = useState<Props>();
    const [code, setCode] = useState('');

    useEffect(() => {
        api.get('api/notification').then((res) => {
            setData(res.data);
            setTelegram(res.data.telegram_active);
        });
    }, []);

    if (!data) return <></>;

    const nextStep = () =>
        setActive((current) => (current < 2 ? current + 1 : current));
    const prevStep = () =>
        setActive((current) => (current > 0 ? current - 1 : current));

    const sendCode = () => {
        api.put('api/notification', { code }).then(() => nextStep());
    };

    const Test = () => {
        api.post('api/notification')
            .then((res) => {
                showNotification({
                    title: 'Sucesso',
                    message: 'Mensagem enviada',
                    color: 'green',
                });
            })
            .catch((res) => {
                showNotification({
                    title: 'Erro',
                    message: res.response.data.description,
                    color: 'red',
                });
            });
    };

    const steps = (
        <>
            <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                <Stepper.Step label="Primeiro passo" description="/start">
                    <Group position="center">
                        Inicie uma conversa com o bot enviando
                        <Code color="blue" ml={-10}>
                            /start
                        </Code>
                    </Group>
                    <Group position="center" mt={10}>
                        <Button
                            variant="outline"
                            leftIcon={<BrandTelegram />}
                            component="a"
                            target="_blank"
                            href={`https://t.me/${data.username}`}
                        >
                            Enviar mensagem
                        </Button>
                    </Group>
                </Stepper.Step>
                <Stepper.Step label="Segundo passo" description="Código">
                    <Group position="center">
                        <TextInput
                            label="Digite o código fornecido pelo bot"
                            description="O código contém apenas números."
                            icon={<Fingerprint />}
                            value={code}
                            onChange={(e) => setCode(e.currentTarget.value)}
                        />
                    </Group>
                </Stepper.Step>
                <Stepper.Completed>
                    <Stack align="center">
                        <div>Clique no botão abaixo para testar a conexão</div>
                        <Button variant="outline" onClick={Test}>
                            Testar
                        </Button>
                    </Stack>
                </Stepper.Completed>
            </Stepper>

            <Group position="center" mt="xl">
                {active > 0 && (
                    <Button variant="default" onClick={prevStep}>
                        Voltar
                    </Button>
                )}
                {active == 0 && <Button onClick={nextStep}>Próximo</Button>}
                {active == 1 && (
                    <Button
                        onClick={sendCode}
                        disabled={code.length > 6 ? false : true}
                    >
                        Próximo
                    </Button>
                )}
                {active == 2 && (
                    <Button
                        color="green"
                        onClick={() => {
                            setTelegram(true);
                            setOpened(false);
                        }}
                    >
                        Finalizar
                    </Button>
                )}
            </Group>
        </>
    );

    const toggleTelegram = () => {
        if (data.need_start) {
            setOpened(true);
        }
        api.put('api/notification', { active: !telegram }).then(() =>
            setTelegram(!telegram)
        );
    };

    return (
        <>
            <Title order={2}>Notificações</Title>
            <Group>
                <Switch
                    label="Telegram"
                    mt={20}
                    checked={telegram}
                    onChange={toggleTelegram}
                />
                {!data.need_start && (
                    <Button
                        variant="subtle"
                        color="dimmed"
                        mt={20}
                        size="xs"
                        leftIcon={<Refresh />}
                        onClick={() => setOpened(true)}
                    >
                        Reconectar
                    </Button>
                )}
            </Group>
            <Modal
                title="Configurar notificação"
                size="md"
                opened={opened}
                onClose={() => setOpened(false)}
            >
                {steps}
            </Modal>
        </>
    );
};

export default Notifications;
