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
import { useEffect, useState, memo } from "react";
import ReactMarkdown from "react-markdown";
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

function AutoSaveMarkdownTextarea(props: Props) {
  const [value, setValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const { classes } = useStyles();

  useEffect(() => {
    const getValue = async () => {
      const response = await api.get(`api/key?name=${props.name}`);
      setValue(response.data.value);
      setCurrentValue(response.data.value);
    };
    getValue();
  }, []);
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
      });
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
              <Text size="sm" weight={500} mb={4}>
                Preview
              </Text>
            </Group>
          )}
          <ReactMarkdown
            children={currentValue.replaceAll("*", "**").replaceAll("-", "\\-")}
            className={classes.markdown}
          />
        </Box>
      )}
    </Group>
  );
}

export default memo(AutoSaveMarkdownTextarea);
