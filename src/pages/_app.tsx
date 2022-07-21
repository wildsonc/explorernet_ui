import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import SuperTokensReact from "supertokens-auth-react";
import Session from "supertokens-node/recipe/session";
import SessionReact from "supertokens-auth-react/recipe/session";
import * as SuperTokensConfig from "../config/frontendConfig";
import ThirdPartyEmailPassword, {
  redirectToAuth,
} from "supertokens-auth-react/recipe/thirdpartyemailpassword";
import supertokensNode from "supertokens-node";
import { backendConfig } from "../config/backendConfig";
import {
  ColorSchemeProvider,
  MantineProvider,
  ColorScheme,
  AppShell,
  Header,
  Burger,
  useMantineTheme,
  Group,
  ActionIcon,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { getCookie, setCookies } from "cookies-next";
import { NavbarNested } from "../components/NavbarNested";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { queryClient } from "../services/queryClient";
import { useViewportSize } from "@mantine/hooks";
import { MoonStars, Sun } from "tabler-icons-react";
import Logo, { LogoDark } from "../components/Logo";
import { Hydrate } from "react-query";

if (typeof window !== "undefined") {
  SuperTokensReact.init(SuperTokensConfig.frontendConfig());
}

function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();
  const { height, width } = useViewportSize();

  const router = useRouter();

  useEffect(() => {
    const color = getCookie("color-scheme");
    //@ts-ignore
    setColorScheme(color || "dark");
  }, []);

  useEffect(() => {
    async function doRefresh() {
      if (pageProps.fromSupertokens === "needs-refresh") {
        if (await SessionReact.attemptRefreshingSession()) {
          location.reload();
        } else {
          // user has been logged out
          redirectToAuth();
        }
      }
    }
    doRefresh();
  }, [pageProps.fromSupertokens]);

  if (pageProps.fromSupertokens === "needs-refresh") {
    return null;
  }

  const dark = colorScheme === "dark";

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    // when color scheme is updated save it to cookie
    setCookies("color-scheme", nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Explorernet</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme,
          }}
        >
          <ModalsProvider labels={{ confirm: "Enviar", cancel: "Cancelar" }}>
            <NotificationsProvider position="top-right">
              {router.pathname.startsWith("/auth") && (
                <Component {...pageProps} />
              )}
              {!router.pathname.startsWith("/auth") && (
                <ThirdPartyEmailPasswordAuthNoSSR>
                  <AppShell
                    fixed
                    navbarOffsetBreakpoint="sm"
                    navbar={
                      <NavbarNested opened={opened} setOpened={setOpened} />
                    }
                    header={
                      width < 769 ? (
                        <Header
                          height={70}
                          p="md"
                          sx={
                            opened
                              ? {
                                  backgroundColor: dark
                                    ? theme.colors.dark[6]
                                    : theme.white,
                                }
                              : undefined
                          }
                        >
                          <Group position="apart">
                            {dark ? (
                              <LogoDark width={80} />
                            ) : (
                              <Logo width={80} />
                            )}
                            <Group mr={-20}>
                              <ActionIcon
                                size="lg"
                                sx={(theme) => ({
                                  backgroundColor: dark
                                    ? theme.colors.dark[6]
                                    : theme.colors.gray[0],
                                  color: dark
                                    ? theme.colors.yellow[4]
                                    : theme.colors.blue[6],
                                })}
                                color={dark ? "yellow" : "blue"}
                                onClick={() => toggleColorScheme()}
                                title="Alterar tema"
                              >
                                {dark ? (
                                  <Sun size={18} />
                                ) : (
                                  <MoonStars size={18} />
                                )}
                              </ActionIcon>
                              <Burger
                                opened={opened}
                                onClick={() => setOpened((o) => !o)}
                                size="sm"
                                color={theme.colors.gray[6]}
                                mr="xl"
                              />
                            </Group>
                          </Group>
                        </Header>
                      ) : undefined
                    }
                  >
                    <Hydrate state={pageProps.dehydratedState}>
                      <Component {...pageProps} />
                    </Hydrate>
                  </AppShell>
                </ThirdPartyEmailPasswordAuthNoSSR>
              )}
            </NotificationsProvider>
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

const ThirdPartyEmailPasswordAuthNoSSR = dynamic(
  new Promise((res) =>
    res(ThirdPartyEmailPassword.ThirdPartyEmailPasswordAuth)
  ) as any,
  { ssr: false }
);

export async function getServerSideProps(context: any) {
  supertokensNode.init(backendConfig());
  let session;

  try {
    session = await Session.getSession(context.req, context.res);
  } catch (err: any) {
    if (err.type === Session.Error.TRY_REFRESH_TOKEN) {
      return { props: { fromSupertokens: "needs-refresh" } };
      // or return {fromSupertokens: 'needs-refresh'} in case of getInitialProps
    } else if (err.type === Session.Error.UNAUTHORISED) {
      return { props: {} };
      // or return {} in case of getInitialProps
    } else {
      throw err;
    }
  }

  return {
    props: { userId: session!.getUserId() },
  };
  // or return {userId: session.getUserId()} in case of getInitialProps
}
