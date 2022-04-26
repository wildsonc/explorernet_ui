import {
    ActionIcon,
    Button,
    createStyles,
    Grid,
    Group,
    Modal,
    Paper,
    ScrollArea,
    Select,
    Text,
    TextInput,
    useMantineColorScheme,
    useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { getPrismTheme } from '@mantine/prism';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Highlight, { defaultProps } from 'prism-react-renderer';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import Editor from 'react-simple-code-editor';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import {
    Building,
    Database,
    DeviceMobile,
    DeviceMobileMessage,
    PlayerPlay,
    Send,
    ArrowBack,
} from 'tabler-icons-react';
import { DynamicTable } from '../../../components/DynamicTable';
import NotAuthorized from '../../../components/ErrorPage/NotAuthorized';
import TemplateCard from '../../../components/TemplateCard';
import TemplateValidator from '../../../components/TemplateValidator';
import api from '../../../services/api';
import hasPermission from '../../../services/utils/hasPermission';

interface Props {
    id: number;
    name: string;
    template: string;
    database: number;
    code: string;
    updated_at: string;
}

interface DatabaseProps {
    id: number;
    name: string;
}

interface TemplateProps {
    name: string;
    components: [
        {
            example: {
                body_text: [string[]];
                header_text: string[];
            };
            buttons?: [{ text: string }];
            text: string;
            type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
            format?: 'DOCUMENT' | 'IMAGE' | 'TEXT';
        }
    ];
}

const useStyles = createStyles((theme) => ({
    root: {
        position: 'relative',
    },

    input: {
        height: 'auto',
        paddingTop: 18,
    },

    label: {
        position: 'absolute',
        pointerEvents: 'none',
        fontSize: theme.fontSizes.xs,
        paddingLeft: theme.spacing.sm,
        paddingTop: theme.spacing.sm / 2,
        zIndex: 1,
    },

    icon: {
        position: 'absolute',
        pointerEvents: 'none',
        paddingTop: theme.spacing.md,
        zIndex: 1,
    },
}));

function Query() {
    const { accessTokenPayload } = useSessionContext();
    const { colorScheme } = useMantineColorScheme();
    const mantineTheme = useMantineTheme();
    const { classes } = useStyles();
    const [query, setQuery] = useState(``);
    const [queryResult, setQueryResult] = useState('');
    const [databases, setDatabases] = useState();
    const [companies, setCompanies] = useState();
    const [valid, setValid] = useState(false);
    const [openTest, setOpenTest] = useState(false);
    const [openSave, setOpenSave] = useState(false);
    const [template, setTemplate] = useState<TemplateProps[]>();
    const form = useForm({
        initialValues: {
            database: 0,
            code: '',
            template: '',
            company: '',
            test_phone: '62995055757',
            name: 'teste',
        },
    });
    const router = useRouter();
    const { data, refetch } = useQuery<Props[], Error>('query', async () => {
        const response = await api.get(`api/whatsapp/query`);
        return response.data;
    });
    const { id } = router.query;
    const current_values = data?.filter((e) => String(e.id) == id)[0];

    useEffect(() => {
        if (current_values) {
            setQuery(current_values.code);
            form.setFieldValue('database', current_values.database);
            form.setFieldValue('template', current_values.template);
            form.setFieldValue('name', current_values.name);
        }
    }, [current_values]);

    useEffect(() => {
        const get = async () => {
            await api.get('api/database').then((res) => {
                setDatabases(
                    res.data.map((e: DatabaseProps) => ({
                        value: e.id,
                        label: e.name,
                    }))
                );
            });
            await api.get('api/whatsapp/dialog').then((res) => {
                setCompanies(
                    res.data.map((e: DatabaseProps) => ({
                        value: e.id,
                        label: e.name,
                    }))
                );
                form.setFieldValue('company', res.data[0].id);
            });
        };
        get();
    }, []);

    useEffect(() => {
        if (!form.values.company) return;
        api.get(`api/whatsapp/templates/${form.values.company}`).then((res) =>
            setTemplate(res.data)
        );
    }, [form.values.company]);

    useMemo(() => {
        form.setFieldValue('code', query);
    }, [query]);

    if (!current_values) return <></>;

    const roles = accessTokenPayload.roles;
    if (!hasPermission('admin', roles)) {
        return <NotAuthorized />;
    }

    const theme = getPrismTheme(mantineTheme, colorScheme);

    const templateSelected = template?.filter(
        (e) => e.name == form.values.template
    )[0];

    const highlight = (code: string) => (
        <Highlight {...defaultProps} theme={theme} code={code} language="sql">
            {({ tokens, getLineProps, getTokenProps }) => (
                <>
                    {tokens.map((line, i) => (
                        <div {...getLineProps({ line, key: i })} key={i}>
                            {line.map((token, key) => (
                                <span
                                    {...getTokenProps({ token, key })}
                                    key={key}
                                />
                            ))}
                        </div>
                    ))}
                </>
            )}
        </Highlight>
    );

    const run = async () => {
        const res = await api.post('api/whatsapp/run', form.values);
        if (res.data.status == 'Erro') {
            return showNotification({
                title: 'Erro',
                message: res.data.message,
                color: 'red',
            });
        } else {
            setQueryResult(res.data);
        }
    };

    const save = async () => {
        await api.put(`api/whatsapp/query/${id}`, form.values);
        router.push('/whatsapp/query');
    };

    const test = async () => {
        if (!queryResult) return null;
        setOpenTest(false);
        const res = await api.post('api/whatsapp/message', {
            //@ts-ignore
            ...queryResult[0],
            template: form.values.template,
            phone: form.values.test_phone,
        });
        if (res.data.status == 'error') {
            return showNotification({
                title: 'Erro',
                message: res.data.message.errors[0].details,
                color: 'red',
            });
        } else {
            return showNotification({
                title: 'Mesagem enviada!',
                message: res.data.message.messages[0].id,
                color: 'green',
            });
        }
    };

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <Grid>
                <Grid.Col lg={8} md={12}>
                    <ScrollArea
                        sx={{ height: 500, position: 'relative' }}
                        type="always"
                    >
                        <Editor
                            value={query}
                            onValueChange={setQuery}
                            highlight={highlight}
                            padding={12}
                            style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 400,
                                fontSize: 13,
                                borderRadius: 4,
                                minHeight: 500,
                                ...theme.plain,
                            }}
                        />
                        <Paper
                            sx={{ position: 'absolute', top: 10, right: 10 }}
                        >
                            <TemplateValidator
                                template={templateSelected}
                                query={queryResult}
                                setValid={setValid}
                            />
                        </Paper>
                    </ScrollArea>
                    <Group mt={20} position="apart">
                        <Group>
                            <Select
                                style={{ zIndex: 2 }}
                                data={databases ? databases : ['']}
                                placeholder="Selecione..."
                                label="Banco de dados"
                                classNames={classes}
                                icon={<Database size={16} />}
                                {...form.getInputProps('database')}
                            />
                            <Button
                                leftIcon={<PlayerPlay />}
                                size="lg"
                                color="green"
                                onClick={run}
                                disabled={form.values.database ? false : true}
                            >
                                Run
                            </Button>
                        </Group>
                        <Group>
                            <Button
                                size="lg"
                                onClick={() => setOpenTest(true)}
                                disabled={!valid}
                                color="orange"
                                variant="outline"
                            >
                                Testar
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => setOpenSave(true)}
                                disabled={!valid}
                            >
                                Salvar
                            </Button>
                        </Group>
                    </Group>
                </Grid.Col>
                <Grid.Col lg={4} md={12}>
                    <Select
                        style={{ zIndex: 2 }}
                        data={companies ? companies : ['']}
                        placeholder="Selecione..."
                        label="Empresa"
                        classNames={classes}
                        icon={<Building size={16} />}
                        {...form.getInputProps('company')}
                    />
                    <Select
                        mt={10}
                        style={{ zIndex: 2 }}
                        data={
                            template
                                ? template.map((e) => {
                                      return e.name;
                                  })
                                : ['']
                        }
                        placeholder="Selecione..."
                        label="Template"
                        classNames={classes}
                        searchable
                        icon={<DeviceMobileMessage size={16} />}
                        {...form.getInputProps('template')}
                    />
                    {template && (
                        <TemplateCard
                            templates={template}
                            selected={templateSelected}
                        />
                    )}
                </Grid.Col>
            </Grid>
            {queryResult && (
                <ScrollArea
                    mt={20}
                    sx={(theme) => ({
                        height: 180,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderStyle: 'solid',
                        borderColor: theme.colors.dark[4],
                    })}
                >
                    <DynamicTable elements={queryResult} />
                </ScrollArea>
            )}
            <Modal
                opened={openTest}
                onClose={() => setOpenTest(false)}
                title="Enviar mensagem teste"
            >
                <Text color="dimmed">
                    Será usado os parâmetros da primeira linha da consulta.
                </Text>
                <TextInput
                    label="Número"
                    type="number"
                    mt={20}
                    icon={<DeviceMobile size={18} />}
                    {...form.getInputProps('test_phone')}
                />
                <Group position="center" mt={20}>
                    <Button
                        leftIcon={<Send size={18} />}
                        onClick={() => test()}
                    >
                        Enviar
                    </Button>
                </Group>
            </Modal>
            <ActionIcon
                sx={{ position: 'absolute', bottom: 20, right: 30 }}
                radius="xl"
                size="xl"
                color="blue"
                variant="filled"
                onClick={() => router.back()}
            >
                <ArrowBack />
            </ActionIcon>
            <Modal
                opened={openSave}
                onClose={() => setOpenSave(false)}
                title="Salvar"
            >
                <TextInput label="Nome" {...form.getInputProps('name')} />
                <Group position="center" mt={20}>
                    <Button size="md" onClick={save}>
                        Salvar
                    </Button>
                </Group>
            </Modal>
        </>
    );
}

export default Query;
