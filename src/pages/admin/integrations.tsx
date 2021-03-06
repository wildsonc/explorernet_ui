import {
  Card,
  createStyles,
  Group,
  SimpleGrid,
  Text,
  UnstyledButton,
  Badge,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import React from "react";
import { BrandTelegram, World, Mail, Box } from "tabler-icons-react";
import AutoSaveTextInput from "../../components/AutoSave/AutoSaveTextInput";
import _3CXIcon from "../../components/Icons/3CXIcon";
import _7AZIcon from "../../components/Icons/7AZIcon";
import MetabaseIcon from "../../components/Icons/MetabaseIcon";
import MondayIcon from "../../components/Icons/MondayIcon";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import hasPermission from "../../services/utils/hasPermission";
import ZapSignIcon from "../../components/Icons/ZapSignIcon";
import TemplateIcon from "../../components/Icons/ApiTemplateIcon";
import UnicoIcon from "../../components/Icons/UnicoIcon";
import SpcIcon from "../../components/Icons/SpcIcon";
import GoogleMapsIcon from "../../components/Icons/GoogleMapsIcon";
import FlowbixIcon from "../../components/Icons/FlowbixIcon";
import AutoSaveSwitch from "../../components/AutoSave/AutoSaveSwitch";

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
      title: <strong>{title}</strong>,
      overlayOpacity: 0.55,
      overlayBlur: 3,
      children,
    });

  const mockdata = [
    {
      title: "Metabase",
      icon: MetabaseIcon,
      color: "violet",
      children: (
        <>
          <AutoSaveTextInput label="URL" name="METABASE_SITE_URL" />
          <AutoSaveTextInput label="Secret Key" name="METABASE_SECRET_KEY" />
        </>
      ),
    },
    {
      title: "ZapSign",
      icon: ZapSignIcon,
      color: "indigo",
      children: (
        <>
          <AutoSaveTextInput label="API" name="ZAPSIGN_API_KEY" mb={10} />
          <AutoSaveTextInput label="Email" name="ZAPSIGN_EMAIL" mb={10} />
          <Badge color="orange" my={10}>
            explorernet
          </Badge>
          <AutoSaveTextInput label="Slogan" name="ZAPSIGN_SLOGAN_EXP" />
          <AutoSaveTextInput label="Cor" name="ZAPSIGN_COLOR_EXP" />
          <AutoSaveTextInput label="Logo" name="ZAPSIGN_LOGO_EXP" />
          <AutoSaveTextInput
            label="Telefone"
            name="ZAPSIGN_PHONE_EXP"
            mb={10}
          />
          <Badge color="pink" my={10}>
            internetup
          </Badge>
          <AutoSaveTextInput label="Slogan" name="ZAPSIGN_SLOGAN_IUP" />
          <AutoSaveTextInput label="Cor" name="ZAPSIGN_COLOR_IUP" />
          <AutoSaveTextInput label="Logo" name="ZAPSIGN_LOGO_IUP" />
          <AutoSaveTextInput label="Telefone" name="ZAPSIGN_PHONE_IUP" />
        </>
      ),
    },
    // {
    //   title: "Flashman",
    //   icon: AnlixIcon,
    //   color: "indigo",
    //   children: (
    //     <>
    //       <AutoSaveTextInput label="Site URL" name="FLASHMAN_SITE_URL" />
    //       <AutoSaveTextInput label="Usu??rio" name="FLASHMAN_USERNAME" />
    //       <AutoSaveTextInput label="Senha" name="FLASHMAN_PASSWORD" />
    //     </>
    //   ),
    // },
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
      color: "cyan",
      children: (
        <>
          <AutoSaveTextInput label="BOT TOKEN" name="TELEGRAM_BOT_TOKEN" />
          <AutoSaveTextInput label="Username" name="TELEGRAM_BOT_USERNAME" />
        </>
      ),
    },
    {
      title: "SPC Brasil",
      icon: SpcIcon,
      mt: -10,
      color: "green",
      children: (
        <>
          <AutoSaveTextInput label="Token" name="SPC_TOKEN" />
          <AutoSaveTextInput label="Token Homologa????o" name="SPC_TOKEN_HML" />
          <AutoSaveTextInput
            label="Tempo no hist??rico (Dias)"
            name="SPC_DAYS"
            type="number"
          />
          <AutoSaveSwitch label="Homologa????o" name="SPC_HOMOLOGATION" my={10} />
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
            description="O nome que aparecer?? como rementente."
            label="Nome"
            name="SMTP_NAME"
          />
          <AutoSaveTextInput
            description="O endere??o do servidor SMTP que lida com seus e-mails."
            label="Servidor"
            name="SMTP_HOST"
          />
          <AutoSaveTextInput
            description="A porta que seu servidor SMTP usa para envio de e-mails."
            label="Porta"
            name="SMTP_PORT"
          />
          <AutoSaveTextInput label="Usu??rio SMTP" name="SMTP_USER" />
          <AutoSaveTextInput label="Senha SMTP" name="SMTP_PASSWORD" />
          <AutoSaveTextInput
            description="Endere??o de e-mail que voc?? deseja usar como remetente."
            label="Remetente"
            name="SMTP_SENDER"
          />
        </>
      ),
    },
    {
      title: "Unico | Check",
      icon: UnicoIcon,
      color: "blue",
      children: (
        <>
          <AutoSaveTextInput label="Conta" name="UNICO_ACCOUNT" />
          <AutoSaveTextInput label="Tenant ID" name="UNICO_TENANT" />
          <AutoSaveTextInput label="API KEY" name="UNICO_API_KEY" />
          <AutoSaveTextInput label="Auth URL" name="UNICO_AUTH_URL" />
          <AutoSaveTextInput label="API URL" name="UNICO_API_URL" />
          <AutoSaveTextInput
            label="Template WhatsApp"
            name="UNICO_TEMPLATE_WHATSAPP"
          />
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
      title: "APITemplate.io",
      icon: TemplateIcon,
      color: "cyan",
      children: (
        <>
          <AutoSaveTextInput label="API Key" name="APITEMPLATE_KEY" />
          <AutoSaveTextInput label="Endpoint" name="APITEMPLATE_URL" />
        </>
      ),
    },
    {
      title: "GeoGrid",
      icon: World,
      color: "cyan",
      children: (
        <>
          <AutoSaveTextInput label="Token" name="GEOGRID_TOKEN" />
          <AutoSaveTextInput label="URL" name="GEOGRID_URL" />
        </>
      ),
    },
    {
      title: "Geocoding",
      icon: GoogleMapsIcon,
      color: "cyan",
      children: (
        <>
          <AutoSaveTextInput label="Geocoding API" name="GEOCODING_API" />
        </>
      ),
    },
    {
      title: "MK",
      icon: Box,
      color: "blue",
      children: (
        <>
          <AutoSaveTextInput label="URL" name="MK_API_URL" />
          <AutoSaveTextInput label="Token" name="MK_API_TOKEN" />
          <AutoSaveTextInput label="Password" name="MK_API_PASSWORD" />
        </>
      ),
    },
    {
      title: "Flowbix",
      icon: FlowbixIcon,
      color: "blue",
      children: (
        <>
          <AutoSaveTextInput label="URL" name="FLOWBIX_URL" />
          <AutoSaveTextInput label="Token" name="FLOWBIX_TOKEN" />
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
      <Group direction="column" align="center">
        <item.icon color={theme.colors[item.color][6]} size={32} />
        <Text size="xs">{item.title}</Text>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Group position="center" sx={{ width: "100%" }}>
      <Card withBorder radius="md" className={classes.card}>
        <Group position="apart">
          <Text className={classes.title}>Integra????es</Text>
        </Group>
        <SimpleGrid cols={3} mt="md">
          {items}
        </SimpleGrid>
      </Card>
    </Group>
  );
}
