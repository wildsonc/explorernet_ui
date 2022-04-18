import { useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { getPrismTheme } from "@mantine/prism";
import Head from "next/head";
import Highlight, { defaultProps } from "prism-react-renderer";
import { useState } from "react";
import Editor from "react-simple-code-editor";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import NotAuthorized from "../../../components/ErrorPage/NotAuthorized";
import hasPermission from "../../../services/utils/hasPermission";

function Query() {
  const { colorScheme } = useMantineColorScheme();
  const mantineTheme = useMantineTheme();
  const [value, setValue] = useState(
    `select phone, company from users \nwhere due_date = current_date`
  );

  const { accessTokenPayload } = useSessionContext();

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  const theme = getPrismTheme(mantineTheme, colorScheme);

  const highlight = (code: string) => (
    <Highlight {...defaultProps} theme={theme} code={code} language="sql">
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })} key={i}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} key={key} />
              ))}
            </div>
          ))}
        </>
      )}
    </Highlight>
  );

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
      <Editor
        value={value}
        onValueChange={setValue}
        highlight={highlight}
        padding={12}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 400,
          fontSize: 13,
          borderRadius: 4,
          maxWidth: 700,
          minHeight: 150,
          ...theme.plain,
        }}
      />
    </>
  );
}

export default Query;
