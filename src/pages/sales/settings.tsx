import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Center,
  Code,
  Divider,
  Group,
  SegmentedControl,
  Select,
  Text,
  TextInput,
  MultiSelect,
} from "@mantine/core";
import { formList, useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import {
  ArrowRightCircle,
  Backhoe,
  BrandAndroid,
  BrandGoogleDrive,
  FileInvoice,
  Link,
  Messages,
  Plug,
  Satellite,
  Sitemap,
  Trash,
} from "tabler-icons-react";
import AutoSaveMarkdownTextarea from "../../components/AutoSave/AutoSaveMarkdownTextarea";
import AutoSaveTextInput from "../../components/AutoSave/AutoSaveTextInput";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import { formatDate } from "../../services/utils/formatDate";
import hasPermission from "../../services/utils/hasPermission";

interface DriveProps {
  id: string;
  name: string;
}

interface SettingProps {
  bot_token: string;
  drive_folder: string;
  maintenance: string;
  filename: string;
  mapping: any;
  exclude_summary: string[];
  exclude_edit: string[];
  group_order: string[];
  key_order: string[];
  folders: string[];
}

export default function Bot() {
  const { accessTokenPayload } = useSessionContext();
  const [drives, setDrives] = useState<DriveProps[]>([]);
  const [fields, setFields] = useState([""]);
  const [data, setData] = useState<SettingProps>();
  const [keyData, setKeyData] = useState<string[]>([]);
  const [selected, setSelected] = useState("drive");
  const form = useForm({
    initialValues: {
      folder: "",
      token: "",
      maintenance: "",
      filename: "",
      mapping: formList([{ source: "", destination: "" }]),
      exclude_summary: [""],
      exclude_edit: [""],
      group_order: [""],
      key_order: [""],
    },
  });

  useEffect(() => {
    api.get<SettingProps>("/api/sales/settings").then((res) => {
      setData(res.data);
      setKeyData(res.data.key_order);
      setFields([...res.data.exclude_summary, ...res.data.exclude_edit]);
      form.setValues({
        folder: res.data.drive_folder,
        token: res.data.bot_token,
        filename: res.data.filename,
        maintenance: res.data.maintenance,
        mapping: formList(res.data.mapping),
        exclude_summary: res.data.exclude_summary,
        exclude_edit: res.data.exclude_edit,
        group_order: res.data.group_order,
        key_order: res.data.key_order,
      });
    });
  }, []);

  useEffect(() => {
    api
      .get<DriveProps[]>("/api/integrations/drive")
      .then((res) => setDrives(res.data));
  }, []);

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  moment.locale("pt-br");

  const connectBot = () => {
    api.post("api/sales/telegram", form.values).then((res) => {
      if (res.data === true) {
        return showNotification({
          title: "Sucesso",
          message: "Conectado!",
          color: "green",
        });
      }
      if (!res.data?.ok) {
        return showNotification({
          title: "Erro",
          message: res.data.description,
          color: "red",
        });
      }
    });
  };

  const getMe = () => {
    axios
      .post(
        `https://api.telegram.org/bot${form.values.token}/getMe`,
        form.values
      )
      .then((res) => {
        if (res.data.ok) {
          const r = res.data.result;
          return showNotification({
            title: r.first_name,
            autoClose: 1000 * 10,
            message: (
              <>
                <Text>
                  Inline mode:{" "}
                  <Text
                    component="span"
                    weight={500}
                    color={r.supports_inline_queries ? "green" : "red"}
                  >
                    {r.supports_inline_queries ? "Sim" : "Não"}
                  </Text>
                </Text>
                <Anchor<"a">
                  size="sm"
                  weight={500}
                  target="_blank"
                  href={`https://t.me/${r.username}`}
                >
                  {"@" + r.username}
                </Anchor>
              </>
            ),
          });
        }
      });
  };

  const webhookInfo = () => {
    axios
      .post(
        `https://api.telegram.org/bot${form.values.token}/getWebhookInfo`,
        form.values
      )
      .then((res) => {
        if (res.data.ok) {
          const r = res.data.result;
          return showNotification({
            title: r.first_name,
            autoClose: 1000 * 30,
            message: (
              <>
                <Group>
                  <Messages size={16} />
                  <Text>{r.pending_update_count}</Text>
                </Group>
                <Group noWrap>
                  <Box>
                    <Link size={16} />
                  </Box>
                  <Text lineClamp={1}>{r.url}</Text>
                </Group>
                <Group>
                  <Text weight={500}>IP</Text>
                  <Text>{r.ip_address}</Text>
                </Group>
                {r.last_error_message && (
                  <Text color="red">
                    {formatDate(moment.unix(r.last_error_date).format())}
                    {" - "}
                    {r.last_error_message}
                  </Text>
                )}
              </>
            ),
          });
        }
      });
  };

  const toggleMaintenance = () => {
    const newState = form.values.maintenance == "1" ? "0" : "1";
    form.setFieldValue("maintenance", newState);
    api.post("api/key", { key: "BOT_MAINTENANCE", value: newState });
  };

  const handleSubmitDrive = () => {
    api
      .post("/api/sales/settings", {
        folder: form.values.folder,
        filename: form.values.filename,
      })
      .then((res) => {
        showNotification({
          title: "Salvo com sucesso",
          message: "Configurações salvas",
          color: "green",
        });
      });
  };

  const handleSubmitSync = () => {
    api
      .post("/api/sales/settings", { mapping: form.values.mapping })
      .then((res) => {
        showNotification({
          title: "Salvo com sucesso",
          message: "Mapeamento salvo",
          color: "green",
        });
      });
  };

  const handleSubmitBot = () => {
    api
      .put("/api/sales/flow/1", {
        exclude_edit: form.values.exclude_edit,
        exclude_summary: form.values.exclude_summary,
        key_order: form.values.key_order,
        group_order: form.values.group_order,
      })
      .then((res) => {
        showNotification({
          title: "Salvo com sucesso",
          message: "Atualizado",
          color: "green",
        });
      });
  };

  const mapping = form.values.mapping.map((item, index) => (
    <Group key={index} mt="xs">
      <TextInput
        placeholder="nome_mae"
        required
        sx={{ flex: 1 }}
        {...form.getListInputProps("mapping", index, "source")}
      />
      <ArrowRightCircle size={20} />
      <TextInput
        placeholder="Nome Mãe"
        required
        sx={{ flex: 1 }}
        {...form.getListInputProps("mapping", index, "destination")}
      />
      <ActionIcon
        color="red"
        variant="hover"
        onClick={() => form.removeListItem("mapping", index)}
      >
        <Trash size={16} />
      </ActionIcon>
    </Group>
  ));

  return (
    <>
      <SegmentedControl
        value={selected}
        onChange={setSelected}
        data={[
          {
            value: "drive",
            label: (
              <Center>
                <BrandGoogleDrive size={16} />
                <Box ml={10}>Drive</Box>
              </Center>
            ),
          },
          {
            value: "contract",
            label: (
              <Center>
                <FileInvoice size={16} />
                <Box ml={10}>Contrato</Box>
              </Center>
            ),
          },
          {
            value: "mapping",
            label: (
              <Center>
                <Sitemap size={16} />
                <Box ml={10}>Sync</Box>
              </Center>
            ),
          },
          {
            value: "bot",
            label: (
              <Center>
                <BrandAndroid size={16} />
                <Box ml={10}>Bot</Box>
              </Center>
            ),
          },
          {
            value: "messages",
            label: (
              <Center>
                <Messages size={16} />
                <Box ml={10}>Mensagens</Box>
              </Center>
            ),
          },
        ]}
      />

      {selected == "drive" && (
        <Box mt={10}>
          <Select
            label="Pasta de destino"
            placeholder="Escolha uma"
            data={drives.map((e) => {
              return {
                value: e.id,
                label: e.name,
              };
            })}
            sx={{ maxWidth: 300 }}
            {...form.getInputProps("folder")}
          />
          <TextInput
            label="Nome do arquivo"
            description="Variáveis: NOME, TIPO, DATA, DOCUMENTO"
            sx={{ maxWidth: 400 }}
            mt={10}
            {...form.getInputProps("filename")}
          />
          <Button color="green" mt={20} onClick={handleSubmitDrive}>
            Salvar
          </Button>
        </Box>
      )}
      {selected == "contract" && (
        <Box mt={10}>
          <Divider label="Fluxo UNICO" />
          <AutoSaveTextInput
            label="Explorernet"
            name="UNICO_FLUXO_EXPLORERNET"
            sx={{ maxWidth: 300 }}
          />
          <AutoSaveTextInput
            label="Internetup"
            name="UNICO_FLUXO_INTERNETUP"
            sx={{ maxWidth: 300 }}
          />
          <Divider label="Templates" mt={20} />
          <AutoSaveTextInput
            label="Adesão"
            name="BOT_TEMPLATE_ADESAO"
            sx={{ maxWidth: 300 }}
          />
          <AutoSaveTextInput
            label="Adesão PJ"
            name="BOT_TEMPLATE_ADESAO_PJ"
            sx={{ maxWidth: 300 }}
          />
        </Box>
      )}
      {selected == "mapping" && (
        <Box mt={10} sx={{ maxWidth: 480 }}>
          <Text weight={500} size="xl" mb={10}>
            Mapeamento de colunas
          </Text>
          {mapping.length > 0 ? (
            <Group mb="xs">
              <Text weight={500} size="sm" sx={{ flex: 1 }}>
                Key
              </Text>
              <Text weight={500} size="sm" pr={90}>
                Coluna
              </Text>
            </Group>
          ) : (
            <Text color="dimmed" align="center">
              Nenhum mapeamento
            </Text>
          )}

          {mapping}

          <Group position="center" mt="md">
            <Button
              onClick={() =>
                form.addListItem("mapping", { source: "", destination: "" })
              }
            >
              + Coluna
            </Button>
            <Button color="green" onClick={handleSubmitSync}>
              Salvar
            </Button>
          </Group>
        </Box>
      )}
      {selected == "bot" && (
        <Box mt={10}>
          <TextInput
            label="Token"
            sx={{ maxWidth: 480 }}
            rightSection={
              <ActionIcon onClick={connectBot} variant="filled" color="blue">
                <Plug size={16} />
              </ActionIcon>
            }
            {...form.getInputProps("token")}
          />
          <Group>
            <Button
              leftIcon={<BrandAndroid size={18} />}
              mt={20}
              onClick={getMe}
            >
              GetMe
            </Button>
            <Button
              leftIcon={<Satellite size={18} />}
              mt={20}
              onClick={webhookInfo}
            >
              Webhook
            </Button>
            <Button
              leftIcon={<Backhoe size={18} />}
              mt={20}
              onClick={toggleMaintenance}
              color={form.values.maintenance == "1" ? "yellow" : "green"}
            >
              {form.values.maintenance == "1"
                ? "Parar manutenção"
                : "Manutenção"}
            </Button>
          </Group>
          <Divider mt={20} label="Resumo" />
          <MultiSelect
            label="Ocultar campos e edição"
            data={fields}
            sx={{ maxWidth: 480 }}
            mt={10}
            {...form.getInputProps("exclude_summary")}
            searchable
            creatable
            getCreateLabel={(query) => `+ ${query}`}
            onCreate={(query) => setFields((current) => [...current, query])}
          />
          <MultiSelect
            label="Ocultar edição"
            data={fields}
            sx={{ maxWidth: 480 }}
            mt={10}
            {...form.getInputProps("exclude_edit")}
            searchable
            creatable
            getCreateLabel={(query) => `+ ${query}`}
            onCreate={(query) => setFields((current) => [...current, query])}
          />
          <Divider mt={20} label="Ordenação" />
          <MultiSelect
            label="Grupo"
            data={data?.folders || []}
            sx={{ maxWidth: 480 }}
            mt={10}
            {...form.getInputProps("group_order")}
            searchable
          />
          <MultiSelect
            label="Item"
            data={keyData}
            sx={{ maxWidth: 480 }}
            mt={10}
            {...form.getInputProps("key_order")}
            searchable
            creatable
            getCreateLabel={(query) => `+ ${query}`}
            onCreate={(query) => setKeyData((current) => [...current, query])}
          />
          <Button mt={20} onClick={handleSubmitBot}>
            Salvar
          </Button>
        </Box>
      )}
      {selected == "messages" && (
        <Box mt={10}>
          <AutoSaveMarkdownTextarea
            label={
              <Group spacing="xs">
                <Code color="indigo">/start</Code>
                <Code color="indigo">/help</Code>
              </Group>
            }
            name="BOT_MSG_START"
          />
          <Divider mt={15} />
          <AutoSaveMarkdownTextarea
            label={
              <Group spacing="xs">
                <Code color="indigo">/pausar</Code>
              </Group>
            }
            name="BOT_MSG_CLOSE"
            mt={10}
          />
          <Divider mt={15} />
          <AutoSaveMarkdownTextarea
            label="Finalizado"
            name="BOT_MSG_FINISHED"
            mt={10}
          />
          <Divider mt={15} />
          <AutoSaveMarkdownTextarea
            label="Manutenção"
            name="BOT_MSG_MAINTENANCE"
            mt={10}
          />
          <Divider mt={15} />
          <AutoSaveMarkdownTextarea
            label="Venda duplicada"
            name="BOT_MSG_DUPLICATED"
            mt={10}
          />
        </Box>
      )}
    </>
  );
}
