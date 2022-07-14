import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Center,
  Group,
  SegmentedControl,
  Select,
  TextInput,
  Text,
  Code,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import {
  Backhoe,
  BrandAndroid,
  BrandGoogleDrive,
  BrandTelegram,
  FileInvoice,
  Link,
  Messages,
  Plug,
  Satellite,
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
}

export default function Bot() {
  const { accessTokenPayload } = useSessionContext();
  const [drives, setDrives] = useState<DriveProps[]>([]);
  const [selected, setSelected] = useState("drive");
  const form = useForm({
    initialValues: {
      folder: "",
      token: "",
      maintenance: "",
    },
  });

  useEffect(() => {
    api.get<SettingProps>("/api/sales/settings").then((res) =>
      form.setValues({
        folder: res.data.drive_folder,
        token: res.data.bot_token,
        maintenance: res.data.maintenance,
      })
    );
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
        console.log(res.data);
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
                <Box ml={10}>Mensagens Predefinidas</Box>
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
        </Box>
      )}
      {selected == "contract" && (
        <Box mt={10}>
          <TextInput label="UNICO Template" sx={{ maxWidth: 300 }} />
          <TextInput label="Template PF" sx={{ maxWidth: 300 }} />
          <TextInput label="Template PJ" sx={{ maxWidth: 300 }} />
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
