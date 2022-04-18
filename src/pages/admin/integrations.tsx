import {
  Card,
  createStyles,
  Group,
  SimpleGrid,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import React from "react";
import { Box, BrandTelegram, BrandWhatsapp, Mail } from "tabler-icons-react";
import AutoSaveTextInput from "../../components/AutoSave/AutoSaveTextInput";
import _3CXIcon from "../../components/Icons/3CXIcon";
import _7AZIcon from "../../components/Icons/7AZIcon";
import AnlixIcon from "../../components/Icons/AnlixIcon";
import MetabaseIcon from "../../components/Icons/MetabaseIcon";
import MondayIcon from "../../components/Icons/MondayIcon";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import hasPermission from "../../services/utils/hasPermission";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    width: 600,
  },

  title: {
    fontFamily: theme.fontFamily,
    fontWeight: 700,
  },

  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: theme.radius.md,
    height: 90,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: `${theme.shadows.md} !important`,
      transform: "scale(1.05)",
    },
  },
}));

export default function ActionsGrid() {
  const { classes, theme } = useStyles();
  const modals = useModals();

  const { accessTokenPayload } = useSessionContext();

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  const openModal = (title: string, children?: React.ReactNode) =>
    modals.openModal({
      title: title,
      children,
    });

  const mockdata = [
    {
      title: "Metabase",
      icon: MetabaseIcon,
      color: "violet",
      children: (
        <>
          <AutoSaveTextInput label="Site URL" name="METABASE_SITE_URL" />
          <AutoSaveTextInput label="Secret Key" name="METABASE_SECRET_KEY" />
        </>
      ),
    },
    {
      title: "Flashman",
      icon: AnlixIcon,
      color: "indigo",
      children: (
        <>
          <AutoSaveTextInput label="Site URL" name="FLASHMAN_SITE_URL" />
          <AutoSaveTextInput label="Usuário" name="FLASHMAN_USERNAME" />
          <AutoSaveTextInput label="Senha" name="FLASHMAN_PASSWORD" />
        </>
      ),
    },
    {
      title: "Monday",
      icon: MondayIcon,
      color: "blue",
      children: (
        <>
          <AutoSaveTextInput label="API KEY" name="MONDAY_API_KEY" />
        </>
      ),
    },
    {
      title: "Telegram",
      icon: BrandTelegram,
      color: "blue",
      children: (
        <>
          <AutoSaveTextInput label="BOT TOKEN" name="TELEGRAM_BOT_TOKEN" />
          <AutoSaveTextInput label="Username" name="TELEGRAM_BOT_USERNAME" />
        </>
      ),
    },
    {
      title: "Whatsapp",
      icon: BrandWhatsapp,
      color: "green",
      children: (
        <>
          <AutoSaveTextInput label="API KEY" name="WHATSAPP_API_KEY" />
          <AutoSaveTextInput label="Namespace" name="WHATSAPP_NAMESPACE" />
        </>
      ),
    },
    {
      title: "SMTP",
      icon: Mail,
      color: "red",
      children: (
        <>
          <AutoSaveTextInput
            description="O nome que aparecerá como rementente."
            label="Nome"
            name="SMTP_NAME"
          />
          <AutoSaveTextInput
            description="O endereço do servidor SMTP que lida com seus e-mails."
            label="Servidor"
            name="SMTP_HOST"
          />
          <AutoSaveTextInput
            description="A porta que seu servidor SMTP usa para envio de e-mails."
            label="Porta"
            name="SMTP_PORT"
          />
          <AutoSaveTextInput label="Usuário SMTP" name="SMTP_USER" />
          <AutoSaveTextInput label="Senha SMTP" name="SMTP_PASSWORD" />
          <AutoSaveTextInput
            description="Endereço de e-mail que você deseja usar como remetente."
            label="Remetente"
            name="SMTP_SENDER"
          />
        </>
      ),
    },
    {
      title: "3CX",
      icon: _3CXIcon,
      color: "cyan",
      children: (
        <>
          <AutoSaveTextInput label="Usuário" name="3CX_USER" />
          <AutoSaveTextInput label="Senha" name="3CX_PASSWORD" />
        </>
      ),
    },
    {
      title: "7AZ",
      icon: _7AZIcon,
      color: "green",
      children: (
        <>
          <AutoSaveTextInput label="Token" name="7AZ_TOKEN" />
        </>
      ),
    },
    {
      title: "MK API",
      icon: Box,
      color: "cyan",
      children: (
        <>
          <AutoSaveTextInput label="Site URL" name="MK_API_URL" />
          <AutoSaveTextInput label="Token" name="MK_API_TOKEN" />
        </>
      ),
    },
  ];

  const items = mockdata.map((item) => (
    <UnstyledButton
      key={item.title}
      className={classes.item}
      onClick={() => openModal(item.title, item.children)}
    >
      <item.icon color={theme.colors[item.color][6]} size={32} />
      <Text size="xs" mt={7}>
        {item.title}
      </Text>
    </UnstyledButton>
  ));

  return (
    <Group position="center" sx={{ width: "100%" }}>
      <Card withBorder radius="md" className={classes.card}>
        <Group position="apart">
          <Text className={classes.title}>Integrações</Text>
        </Group>
        <SimpleGrid cols={3} mt="md">
          {items}
        </SimpleGrid>
      </Card>
    </Group>
  );
}