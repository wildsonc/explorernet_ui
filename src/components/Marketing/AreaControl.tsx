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
  Text,
  ColorInput,
  ActionIcon,
  Select,
  Box,
  Tooltip,
} from "@mantine/core";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "@mantine/form";
import { ExtendedFeature, geoContains } from "d3-geo";
import { Download, NewSection, Paint, Refresh } from "tabler-icons-react";
import api from "../../services/api";
import TemplateCard from "../TemplateCard";
import FileSaver from "file-saver";
import json2csv from "json2csv";

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
      type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
      format?: "DOCUMENT" | "IMAGE" | "TEXT" | "VIDEO";
    }
  ];
}

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

export default function AreaControl({ polygon, dataMap, refetch }: any) {
  const [selectedPoints, setSelectedPoints] = useState<ExtendedFeature[]>([]);
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState(false);
  const [companies, setCompanies] = useState();
  const [template, setTemplate] = useState<TemplateProps[]>();
  const [body, setBody] = useState([""]);
  const [availableFields, setAvailableFields] = useState<string[]>([
    "Primeiro nome",
  ]);
  const form = useForm({
    initialValues: {
      title: "",
      color: "",
      company: "",
      template: "",
      customers: selectedPoints,
      header: "",
      polygon: polygon,
    },
  });
  type FormValues = typeof form.values;

  useEffect(() => {
    api
      .get("api/whatsapp/dialog")
      .then((res) => setCompanies(res.data.map((e: DatabaseProps) => e.name)));
  }, []);

  useEffect(() => {
    if (!form.values.company) return;
    api
      .get(`api/whatsapp/templates/${form.values.company}`)
      .then((res) => setTemplate(res.data));
  }, [form.values.company]);

  const handleSubmit = async (values: FormValues) => {
    let data: any = {
      ...values,
      polygon: {
        ...values.polygon[0],
        properties: { color: values.color, total: values.customers.length },
      },
      query: { body },
    };
    if (templateArgs?.hasImage) data.query.image = values.header;
    if (templateArgs?.hasVideo) data.query.video = values.header;
    if (templateArgs?.hasDocument) data.query.document = values.header;
    if (templateArgs?.hasDocument) data.query.filename = "arquivo";
    await api.post("api/marketing/campaign", data);
    reset();
  };

  const reset = () => {
    form.reset();
    setActive(0);
    setBody([""]);
    setOpened(false);
    refetch();
  };

  useMemo(() => {
    if (dataMap && polygon) {
      setSelectedPoints(insidePolygon(Object.values(polygon), dataMap));
    }
  }, [dataMap, polygon]);

  useEffect(() => {
    form.setFieldValue("customers", selectedPoints);
    if (polygon) {
      form.setFieldValue("polygon", Object.values(polygon));
    }
  }, [polygon]);

  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const handleExport = () => {
    const csv = json2csv.parse(form.values.customers, {
      fields: ["phone", "name", "company", "access_plan"],
      quote: "",
    });
    const blob = new Blob([csv], {
      type: "text/plain;charset=utf-8",
    });
    FileSaver.saveAs(blob, "customers.txt");
  };

  const templateSelected = template?.filter(
    (e) => e.name == form.values.template
  )[0];

  const templateArgs = templateSelected
    ? templateValidator(templateSelected)
    : undefined;

  return (
    <>
      {polygon && selectedPoints?.length && (
        <Stack
          sx={{
            backgroundColor: "white",
            color: "black",
            borderRadius: 5,
            padding: "5px 10px",
            boxShadow: "0 0 0 2px rgb(0 0 0 / 10%)",
            textAlign: "center",
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translate(-50%, 0)",
            zIndex: 10,
          }}
        >
          <Group align="center">
            <Text>
              <Text component="span" weight={700}>
                Selecionados:
              </Text>{" "}
              {selectedPoints.length}
            </Text>
            <Tooltip label="Download" position="right" withArrow>
              <ActionIcon
                variant="hover"
                color="blue"
                mx={-5}
                onClick={handleExport}
              >
                <Download size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Button onClick={() => setOpened(true)} leftIcon={<NewSection />}>
            Nova campanha
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
          <Stepper active={active} onStepClick={setActive} breakpoint="sm">
            <Stepper.Step
              label="Confirmar"
              description={`${selectedPoints.length} selecionados`}
            >
              <Center style={{ padding: 10, textAlign: "center" }}>
                <div>
                  <p>
                    <strong>Confirmar seleção?</strong>
                  </p>
                  <p>{selectedPoints.length} clientes selecionados</p>
                </div>
              </Center>
            </Stepper.Step>
            <Stepper.Step
              label="Informações"
              description="Descrição da campanha"
            >
              <Center>
                <Container sx={{ width: 350 }}>
                  <TextInput
                    mt="md"
                    required
                    label="Título"
                    placeholder="Upsell"
                    description="título da campanha"
                    {...form.getInputProps("title")}
                  />
                  <ColorInput
                    mt="md"
                    label="Cor"
                    placeholder="Escolha uma cor"
                    description="Cor da área selecionada"
                    rightSection={
                      <ActionIcon
                        onClick={() =>
                          form.setFieldValue("color", randomColor())
                        }
                      >
                        <Refresh size={16} />
                      </ActionIcon>
                    }
                    {...form.getInputProps("color")}
                  />
                </Container>
              </Center>
            </Stepper.Step>
            <Stepper.Step label="Template" description="WhatsApp">
              <Group position="center">
                <Select
                  data={companies ? companies : [""]}
                  placeholder="Selecione..."
                  label="Empresa"
                  description="Apenas para seleção do template"
                  {...form.getInputProps("company")}
                />
                <Select
                  data={
                    template
                      ? template.map((e) => {
                          return e.name;
                        })
                      : [""]
                  }
                  placeholder="Selecione..."
                  label="Template"
                  description="Modelo da mensagem"
                  searchable
                  {...form.getInputProps("template")}
                />
                <Group position="center">
                  <Box sx={{ width: 400 }}>
                    {template && (
                      <TemplateCard
                        templates={template}
                        selected={templateSelected}
                      />
                    )}
                  </Box>
                  <Group direction="column">
                    {templateArgs?.hasImage && (
                      <TextInput
                        label="Imagem (URL)"
                        required
                        {...form.getInputProps("header")}
                      />
                    )}
                    {templateArgs?.hasVideo && (
                      <TextInput
                        label="Vídeo (URL)"
                        required
                        {...form.getInputProps("header")}
                      />
                    )}
                    {templateArgs?.hasDocument && (
                      <TextInput
                        label="Documento (URL)"
                        required
                        {...form.getInputProps("header")}
                      />
                    )}
                    {templateArgs?.bodyArgs &&
                      new Array(templateArgs.bodyArgs)
                        .fill(templateArgs.bodyArgs)
                        .map((n, i) => (
                          <Select
                            key={`{{${i + 1}}}`}
                            label={`{{${i + 1}}}`}
                            data={availableFields}
                            value={body[i]}
                            onChange={(value) => {
                              if (!value) return;
                              let newBody = body;
                              for (
                                let i = body.length;
                                i < templateArgs.bodyArgs;
                                i++
                              ) {
                                newBody.push("");
                              }
                              newBody = body.map((v, j) => {
                                if (i == j) {
                                  return value;
                                }
                                return v;
                              });
                              setBody(newBody);
                            }}
                            creatable
                            getCreateLabel={(query) => `+ Criar ${query}`}
                            onCreate={(query) =>
                              setAvailableFields((current) => [
                                ...current,
                                query,
                              ])
                            }
                            searchable
                            required
                          />
                        ))}
                  </Group>
                </Group>
              </Group>
            </Stepper.Step>
            <Stepper.Completed>
              <Center>
                <Button size="lg" color="green" variant="outline" type="submit">
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
            {active == 0 && <Button onClick={nextStep}>Próximo</Button>}
            {active == 1 && (
              <Button onClick={nextStep} disabled={form.values.title == ""}>
                Próximo
              </Button>
            )}
            {active == 2 && (
              <Button onClick={nextStep} disabled={form.values.template == ""}>
                Próximo
              </Button>
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

const templateValidator = (template: TemplateProps) => {
  const image = template.components.filter(
    (e) => e.type == "HEADER" && e.format == "IMAGE"
  )[0];
  const title = template.components.filter(
    (e) => e.type == "HEADER" && e.format == "TEXT"
  )[0];
  const document = template.components.filter(
    (e) => e.type == "HEADER" && e.format == "DOCUMENT"
  )[0];
  const video = template.components.filter(
    (e) => e.type == "HEADER" && e.format == "VIDEO"
  )[0];
  const body = template.components.filter((e) => e.type == "BODY")[0];
  const buttons = template.components.filter((e) => e.type == "BUTTONS")[0];
  const buttonsVars = buttons?.buttons?.filter((e) => "example" in e);

  const bodyArgs = body?.example ? body.example.body_text[0].length : 0;
  const buttonArgs = buttonsVars ? buttonsVars.length : 0;
  const titleArgs = title?.example ? title.example.header_text.length : 0;
  const hasImage = image ? true : false;
  const hasVideo = video ? true : false;
  const hasDocument = document ? true : false;
  const hasFilename = hasDocument ? true : false;
  return {
    bodyArgs,
    buttonArgs,
    titleArgs,
    hasImage,
    hasVideo,
    hasDocument,
    hasFilename,
  };
};
