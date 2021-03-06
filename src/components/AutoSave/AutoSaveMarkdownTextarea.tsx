import {
  ActionIcon,
  Box,
  createStyles,
  Group,
  Textarea,
  TextareaProps,
  Text,
  Center,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import { useQuery } from "react-query";
import { ArrowBack, Check, DeviceFloppy, Eye } from "tabler-icons-react";
import api from "../../services/api";

const useStyles = createStyles((theme) => ({
  markdown: {
    whiteSpace: "pre-wrap",
    margin: "-16px 0",
  },
}));

interface Props extends TextareaProps {
  showpreview?: string;
  showpreviewtitle?: string;
}

interface KeyProps {
  key: string;
  value: string;
}

function AutoSaveMarkdownTextarea(props: Props) {
  const [value, setValue] = useState("Carregando...");
  const [currentValue, setCurrentValue] = useState("Carregando...");
  const { classes } = useStyles();

  const { data, refetch } = useQuery<KeyProps, Error>(
    `KEY_${props.name}`,
    async () => {
      const response = await api.get(`api/key?name=${props.name}`);
      return response.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  if (data) {
    if (value == "Carregando...") setValue(data.value);
    if (currentValue == "Carregando...") setCurrentValue(data.value);
  }

  const showPreview =
    props.showpreview == undefined
      ? true
      : props.showpreview == "false"
      ? false
      : props.showpreview;

  const showPreviewTitle =
    props.showpreviewtitle == undefined
      ? true
      : props.showpreviewtitle == "false"
      ? false
      : props.showpreviewtitle;

  const update = () => {
    api
      .post("api/key", { key: props.name, value: currentValue })
      .then((response) => {
        showNotification({
          title: "Sucesso",
          message: "Mensagem atualizada!",
          color: "green",
          icon: <Check />,
        });
      })
      .then((res) => refetch());
  };

  return (
    <Group grow>
      <Textarea
        {...props}
        autosize
        value={currentValue}
        variant="default"
        onChange={(event) => setCurrentValue(event.currentTarget.value)}
        rightSectionWidth={70}
        rightSection={
          <>
            <ActionIcon
              onClick={() => {
                setCurrentValue(value);
              }}
            >
              <ArrowBack />
            </ActionIcon>
            <ActionIcon onClick={update} variant="hover" color="blue">
              <DeviceFloppy />
            </ActionIcon>
          </>
        }
      />
      {showPreview && (
        <Box>
          {showPreviewTitle && (
            <Group mb={-12}>
              <Center mr={-10}>
                <Eye size={16} />
              </Center>
              <Text size="sm" weight={500} mb={4} color="dimmed">
                Preview
              </Text>
            </Group>
          )}
          <ReactMarkdown className={classes.markdown}>
            {currentValue
              .replaceAll("*", "**")
              .replaceAll("-", "\\-")
              .replaceAll(/\n/gi, "\n &nbsp;")}
          </ReactMarkdown>
        </Box>
      )}
    </Group>
  );
}

export default memo(AutoSaveMarkdownTextarea);
