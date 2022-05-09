import { useCallback, useEffect, useState } from 'react';
import {
    Text,
    Group,
    Button,
    createStyles,
    MantineTheme,
    useMantineTheme,
    Select,
    Stepper,
    Box,
    Code,
    Grid,
    Table,
    ScrollArea,
    Paper,
    Modal,
    TextInput,
    Switch,
} from '@mantine/core';
import { Dropzone, DropzoneStatus, MIME_TYPES } from '@mantine/dropzone';
import { FileRejection } from 'react-dropzone';
import {
    CircleCheck,
    CloudUpload,
    DeviceMobile,
    Send,
} from 'tabler-icons-react';
import api from '../../services/api';
import { useForm } from '@mantine/form';
import TemplateCard from '../../components/TemplateCard';
import { showNotification } from '@mantine/notifications';
import { read, utils } from 'xlsx';
import { usePapaParse } from 'react-papaparse';

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
    wrapper: {
        position: 'relative',
        marginBottom: 30,
    },

    dropzone: {
        borderWidth: 1,
        paddingBottom: 50,
        width: 400,
    },

    icon: {
        color:
            theme.colorScheme === 'dark'
                ? theme.colors.dark[3]
                : theme.colors.gray[4],
    },
}));

function getActiveColor(status: DropzoneStatus, theme: MantineTheme) {
    return status.accepted
        ? theme.colors[theme.primaryColor][6]
        : status.rejected
        ? theme.colors.red[6]
        : theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.black;
}

export default function DropzoneButton() {
    const theme = useMantineTheme();
    const { classes } = useStyles();
    const [active, setActive] = useState(0);
    const [openTest, setOpenTest] = useState(false);
    const [contacts, setContacts] = useState<string[][]>([]);
    const [file, setFile] = useState<File>();
    const [companies, setCompanies] = useState();
    const [template, setTemplate] = useState<TemplateProps[]>();
    const { readString } = usePapaParse();
    const form = useForm({
        initialValues: {
            template: '',
            company: '',
            phone: '62995055757',
            priority: false,
        },
    });

    useEffect(() => {
        api.get('api/whatsapp/dialog').then((res) =>
            setCompanies(res.data.map((e: DatabaseProps) => e.name))
        );
    }, []);

    useEffect(() => {
        if (!form.values.company) return;
        api.get(`api/whatsapp/templates/${form.values.company}`).then((res) =>
            setTemplate(res.data)
        );
    }, [form.values.company]);

    const templateSelected = template?.filter(
        (e) => e.name == form.values.template
    )[0];

    const expectedColumns = () => {
        if (!templateSelected) return '';
        const v = templateValidator(templateSelected);
        let text = 'telefone,empresa';
        if (v.hasDocument) text += ',link_arquivo';
        if (v.hasDocument) text += ',nome_arquivo';
        if (v.hasImage) text += ',link_imagem';
        for (let i = 0; i < v.titleArgs; i++) {
            text += ',titulo_' + (i + 1);
        }
        for (let i = 0; i < v.bodyArgs; i++) {
            text += `,{{${i + 1}}}`;
        }
        for (let i = 0; i < v.buttonArgs; i++) {
            text += ',botao_' + (i + 1);
        }
        return text;
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();
            setFile(file);
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
                const result = reader.result;
                if (typeof result == 'string' && file.type == 'text/csv') {
                    //@ts-ignore
                    setContacts(readString(result).data);
                } else {
                    const workbook = read(result, { type: 'binary' });
                    workbook.SheetNames.forEach(function (sheetName) {
                        // Here is your object
                        var csv = utils.sheet_to_csv(
                            workbook.Sheets[sheetName]
                        );
                        //@ts-ignore
                        const lines = readString(csv).data;
                        setContacts(lines);
                    });
                }
            };
            if (file.type == 'text/csv') {
                reader.readAsText(file);
            } else {
                reader.readAsBinaryString(file);
            }
        });
    }, []);

    const onReject = (e: FileRejection[]) => {
        console.log(e);
    };

    const nextStep = () =>
        setActive((current) => (current < 4 ? current + 1 : current));
    const prevStep = () =>
        setActive((current) => (current > 0 ? current - 1 : current));

    const sendMessages = () => {
        const json = {
            data: contacts,
            template: templateSelected?.name,
            priority: form.values.priority,
        };
        api.post('api/whatsapp/message/batch', json);
        nextStep();
    };

    const test = async () => {
        let contact = contacts[0];
        contact[0] = form.values.phone;
        const json = {
            data: [contact],
            template: templateSelected?.name,
            priority: true,
        };
        setOpenTest(false);
        api.post('api/whatsapp/message/batch', json);
        showNotification({
            message: 'Enviado',
        });
    };

    return (
        <>
            <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                <Stepper.Step
                    label="Empresa"
                    description="Empresa modelo"
                    allowStepSelect={active > 0}
                >
                    <Group position="center" direction="column">
                        <Select
                            style={{ zIndex: 2 }}
                            data={companies ? companies : ['']}
                            placeholder="Selecione..."
                            label="Empresa"
                            {...form.getInputProps('company')}
                        />
                        <Text color="dimmed" size="xs">
                            Empresa apenas para seleção do template, a origem do
                            envio é definida dinâmicamente.
                        </Text>
                    </Group>
                </Stepper.Step>
                <Stepper.Step
                    label="Template"
                    description="Modela da mensagem"
                    allowStepSelect={active > 1}
                >
                    <Group position="center" direction="column">
                        <Select
                            mt={10}
                            style={{ zIndex: 2, width: 300 }}
                            data={
                                template
                                    ? template.map((e) => {
                                          return e.name;
                                      })
                                    : ['']
                            }
                            placeholder="Selecione..."
                            label="Template"
                            searchable
                            {...form.getInputProps('template')}
                        />
                        <Box sx={{ width: 400 }}>
                            {template && (
                                <TemplateCard
                                    templates={template}
                                    selected={templateSelected}
                                />
                            )}
                        </Box>
                    </Group>
                </Stepper.Step>
                <Stepper.Step
                    label="Contatos"
                    description="Upload do arquivo"
                    allowStepSelect={active > 2}
                >
                    <Group position="center" align="start">
                        {file ? (
                            <>
                                <Box sx={{ width: 400 }}>
                                    <Group mt={5} noWrap>
                                        <Button
                                            variant="outline"
                                            mt={10}
                                            color="yellow"
                                            onClick={() => {
                                                setFile(undefined);
                                                setContacts([]);
                                            }}
                                        >
                                            Alterar arquivo
                                        </Button>
                                        <Text
                                            weight={500}
                                            color="blue"
                                            lineClamp={1}
                                            ml={-10}
                                        >
                                            {file.name}
                                        </Text>
                                    </Group>
                                    {template && (
                                        <TemplateCard
                                            templates={template}
                                            selected={templateSelected}
                                        />
                                    )}
                                </Box>
                                <Box ml={20}>
                                    <ScrollArea
                                        sx={{ width: 800 }}
                                        type="always"
                                    >
                                        <Paper withBorder mt={10}>
                                            <Table highlightOnHover>
                                                <thead>
                                                    <tr>
                                                        {expectedColumns()
                                                            .split(',')
                                                            .map((e, i) => {
                                                                let color =
                                                                    'red';
                                                                if (
                                                                    i <
                                                                    contacts[0]
                                                                        ?.length
                                                                ) {
                                                                    color =
                                                                        'green';
                                                                }
                                                                return (
                                                                    <th key={e}>
                                                                        <Text
                                                                            color={
                                                                                color
                                                                            }
                                                                        >
                                                                            {e}
                                                                        </Text>
                                                                    </th>
                                                                );
                                                            })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {contacts
                                                        .slice(0, 10)
                                                        .map((e) => (
                                                            <tr key={e[0]}>
                                                                {e.map(
                                                                    (j, i) => (
                                                                        <td
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            {j}
                                                                        </td>
                                                                    )
                                                                )}
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </Table>
                                        </Paper>
                                    </ScrollArea>
                                </Box>
                            </>
                        ) : (
                            <Group direction="column">
                                <Text weight={500}>
                                    Colunas esperadas{' '}
                                    <Code color="green">
                                        {expectedColumns().split(',').length}
                                    </Code>
                                </Text>
                                <Group>
                                    {expectedColumns()
                                        .split(',')
                                        .map((e, i) => {
                                            let color = 'red';
                                            if (i < contacts[0]?.length) {
                                                color = 'green';
                                            }
                                            return (
                                                <Text
                                                    key={e}
                                                    color={color}
                                                    weight={500}
                                                    mt={-10}
                                                    ml={i != 0 ? -15 : 0}
                                                >
                                                    {i != 0 ? ', ' : ''}
                                                    {e}
                                                </Text>
                                            );
                                        })}
                                </Group>
                                <Dropzone
                                    onDrop={onDrop}
                                    onReject={onReject}
                                    className={classes.dropzone}
                                    radius="md"
                                    multiple={false}
                                    accept={[
                                        MIME_TYPES.csv,
                                        MIME_TYPES.xlsx,
                                        MIME_TYPES.xls,
                                    ]}
                                    maxSize={5 * 1024 ** 2}
                                >
                                    {(status) => (
                                        <div style={{ pointerEvents: 'none' }}>
                                            <Group position="center">
                                                <CloudUpload
                                                    size={50}
                                                    color={getActiveColor(
                                                        status,
                                                        theme
                                                    )}
                                                />
                                            </Group>
                                            <Text
                                                align="center"
                                                weight={700}
                                                size="lg"
                                                mt="xl"
                                                sx={{
                                                    color: getActiveColor(
                                                        status,
                                                        theme
                                                    ),
                                                }}
                                            >
                                                {status.accepted
                                                    ? 'Solte o arquivo aqui'
                                                    : status.rejected
                                                    ? 'Arquivo inválido!'
                                                    : 'Upload csv/xlsx'}
                                            </Text>
                                            <Text color="dimmed" align="center">
                                                Arquivo <i>.csv</i> ou{' '}
                                                <i>.xlsx</i> de no máximo 5mb
                                            </Text>
                                        </div>
                                    )}
                                </Dropzone>
                            </Group>
                        )}
                    </Group>
                </Stepper.Step>
                <Stepper.Step label="Confirmar" allowStepSelect={active > 3}>
                    <Group position="center" direction="column">
                        <Box sx={{ width: 400 }}>
                            {template && (
                                <TemplateCard
                                    templates={template}
                                    selected={templateSelected}
                                />
                            )}
                        </Box>
                        <Text weight={500}>Total: {contacts.length}</Text>
                        <Switch
                            label="Prioridade no envio"
                            {...form.getInputProps('priority', {
                                type: 'checkbox',
                            })}
                        />
                    </Group>
                </Stepper.Step>
                <Stepper.Completed>
                    <Group position="center" direction="column">
                        <CircleCheck color="green" size={120} />
                        <Text weight={500} size="xl">
                            Enviado!
                        </Text>
                    </Group>
                </Stepper.Completed>
            </Stepper>
            {active == 2 &&
                contacts[0]?.length < expectedColumns().split(',').length && (
                    <Text color="red" align="center" mt={10} weight={500}>
                        Quantide de colunas menor que o necessário!
                    </Text>
                )}
            <Group position="center" mt="xl">
                {active > 0 && active < 4 ? (
                    <Button variant="default" onClick={prevStep}>
                        Voltar
                    </Button>
                ) : (
                    <></>
                )}
                {active == 0 ? (
                    <Button onClick={nextStep} disabled={template == undefined}>
                        Próximo
                    </Button>
                ) : active == 1 ? (
                    <Button
                        onClick={nextStep}
                        disabled={templateSelected == undefined}
                    >
                        Próximo
                    </Button>
                ) : active == 2 && file ? (
                    <>
                        <Button
                            variant="outline"
                            color="orange"
                            onClick={() => setOpenTest(true)}
                        >
                            Testar
                        </Button>
                        <Button
                            onClick={nextStep}
                            disabled={
                                contacts[0]?.length <
                                expectedColumns().split(',').length
                            }
                        >
                            Próximo
                        </Button>
                    </>
                ) : active == 3 ? (
                    <Button onClick={sendMessages} color="green">
                        Enviar
                    </Button>
                ) : active == 4 ? (
                    <Button color="green" onClick={() => setActive(0)}>
                        Novo envio
                    </Button>
                ) : (
                    <Button onClick={nextStep}>Próximo</Button>
                )}
            </Group>
            <Modal
                opened={openTest}
                onClose={() => setOpenTest(false)}
                title="Enviar mensagem de teste"
            >
                <Text color="dimmed">
                    Será usado os parâmetros da primeira linha do arquivo.
                </Text>
                <TextInput
                    label="Número"
                    type="number"
                    mt={20}
                    icon={<DeviceMobile size={18} />}
                    {...form.getInputProps('phone')}
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
        </>
    );
}

const templateValidator = (template: TemplateProps) => {
    const image = template.components.filter(
        (e) => e.type == 'HEADER' && e.format == 'IMAGE'
    )[0];
    const title = template.components.filter(
        (e) => e.type == 'HEADER' && e.format == 'TEXT'
    )[0];
    const document = template.components.filter(
        (e) => e.type == 'HEADER' && e.format == 'DOCUMENT'
    )[0];
    const body = template.components.filter((e) => e.type == 'BODY')[0];
    const buttons = template.components.filter((e) => e.type == 'BUTTONS')[0];
    const buttonsVars = buttons?.buttons?.filter((e) => 'example' in e);

    const bodyArgs = body?.example ? body.example.body_text[0].length : 0;
    const buttonArgs = buttonsVars ? buttonsVars.length : 0;
    const titleArgs = title?.example ? title.example.header_text.length : 0;
    const hasImage = image ? true : false;
    const hasDocument = document ? true : false;
    const hasFilename = hasDocument ? true : false;
    return {
        bodyArgs,
        buttonArgs,
        titleArgs,
        hasImage,
        hasDocument,
        hasFilename,
    };
};
