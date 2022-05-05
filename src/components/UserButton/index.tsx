import React from "react";
import { signOut } from "supertokens-auth-react/recipe/thirdpartyemailpassword";
import {
  Menu,
  Group,
  Text,
  Avatar,
  Divider,
  useMantineTheme,
  createStyles,
  Box,
  Kbd,
} from "@mantine/core";
import { Logout, Settings, Bell, Search } from "tabler-icons-react";
import { openSpotlight } from "@mantine/spotlight";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  user: {
    display: "block",
    width: "100%",
    padding: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.gray[0],
    },
  },
}));

interface UserButtonProps {
  name: string;
  email: string;
  icon?: React.ReactNode;
}

export function UserButton({ name, email, icon, ...others }: UserButtonProps) {
  const { classes } = useStyles();
  const [opened, handlers] = useDisclosure(false);
  const theme = useMantineTheme();
  const os = useOs();
  const router = useRouter();

  const mod = os == "macos" ? "⌘" : "Ctrl";

  async function onLogout() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <Box className={classes.user} {...others}>
      <Group onClick={() => handlers.toggle()}>
        <Avatar radius="xl">{name.slice(0, 1)}</Avatar>

        <div style={{ flex: 1 }}>
          <Text size="sm" weight={500}>
            {name}
          </Text>

          <Text color="dimmed" size="xs">
            {email.split("@")[0]}
          </Text>
        </div>

        <Menu
          withArrow
          size={200}
          position="right"
          placement="end"
          transition="rotate-left"
          transitionDuration={100}
          transitionTimingFunction="ease"
          opened={opened}
          onOpen={handlers.open}
          onClose={handlers.close}
        >
          <Menu.Item
            icon={<Bell size={14} color={theme.colors.yellow[6]} />}
            onClick={() => router.push("/user/notifications")}
          >
            Notificações
          </Menu.Item>

          <Menu.Item icon={<Search size={14} />} onClick={openSpotlight}>
            <Group position="apart">
              <span>Buscar </span>
              <span>
                <Kbd>{mod} + B</Kbd>
              </span>
            </Group>
          </Menu.Item>
          <Divider />
          <Menu.Label>Conta</Menu.Label>
          <Menu.Item
            onClick={() => router.push("/user/settings")}
            icon={<Settings size={14} />}
          >
            Configurações
          </Menu.Item>
          <Menu.Item icon={<Logout size={14} />} onClick={onLogout}>
            Sair
          </Menu.Item>
        </Menu>
      </Group>
    </Box>
  );
}
