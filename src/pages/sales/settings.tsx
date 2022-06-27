import {
  Center,
  Divider,
  Group,
  Text,
  Select,
  Box,
  TextInput,
  Button,
  TabsProps,
  Tabs,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import {
  BrandGoogleDrive,
  BrandTelegram,
  FileInvoice,
  Settings,
} from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";

interface Drive {
  id: string;
  name: string;
}

function StyledTabs(props: TabsProps) {
  return (
    <Tabs
      variant="unstyled"
      styles={(theme) => ({
        tabControl: {
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
          color:
            theme.colorScheme === "dark"
              ? theme.colors.dark[0]
              : theme.colors.gray[9],
          border: `1px solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[4]
          }`,
          fontSize: theme.fontSizes.md,
          fontWeight: 500,

          "&:not(:first-of-type)": {
            borderLeft: 0,
          },

          "&:first-of-type": {
            borderTopLeftRadius: theme.radius.md,
            borderBottomLeftRadius: theme.radius.md,
          },

          "&:last-of-type": {
            borderTopRightRadius: theme.radius.md,
            borderBottomRightRadius: theme.radius.md,
          },
        },

        tabActive: {
          backgroundColor: theme.colors.blue[8],
          borderColor: theme.colors.blue[7],
          color: theme.white,
        },
      })}
      {...props}
    />
  );
}

export default function Bot() {
  const { accessTokenPayload } = useSessionContext();
  const [drives, setDrives] = useState<Drive[]>([]);
  const form = useForm({
    initialValues: {
      folder: "",
    },
  });

  useEffect(() => {
    api
      .get<Drive[]>("/api/integrations/drive")
      .then((res) => setDrives(res.data));
  }, []);

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }
  return (
    <>
      <StyledTabs>
        <Tabs.Tab label="Drive" icon={<BrandGoogleDrive size={16} />}>
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
        </Tabs.Tab>
        <Tabs.Tab label="Contrato" icon={<FileInvoice size={16} />}>
          <TextInput label="UNICO Template" sx={{ maxWidth: 300 }} />
          <TextInput label="Template PF" sx={{ maxWidth: 300 }} />
          <TextInput label="Template PJ" sx={{ maxWidth: 300 }} />
        </Tabs.Tab>
        <Tabs.Tab label="Telegram" icon={<BrandTelegram size={16} />}>
          <TextInput label="Token" sx={{ maxWidth: 500 }} />
        </Tabs.Tab>
      </StyledTabs>

      <Button
        sx={{ position: "absolute", bottom: 20, right: "50%" }}
        size="lg"
        onClick={() => console.log(form.values)}
      >
        Salvar
      </Button>
    </>
  );
}
