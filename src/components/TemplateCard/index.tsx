import { Card, Text, Button, useMantineTheme, Center } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import { FileZip, Movie, Photo, Video } from "tabler-icons-react";

interface TemplateProps {
  name: string;
  components: [
    {
      example: {
        body_text: [string[]];
        header_text: string[];
      };
      buttons?: [{ text: string }];
      text: string;
      type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
      format?: "DOCUMENT" | "IMAGE" | "TEXT" | "VIDEO";
    }
  ];
}

interface Props {
  selected?: TemplateProps;
  templates?: TemplateProps[];
}

const TemplateCard = ({ templates, selected }: Props) => {
  const theme = useMantineTheme();
  const secondaryColor =
    theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[7];

  if (!templates) return <></>;
  if (!selected) return <></>;

  const image = selected.components.filter(
    (e) => e.type == "HEADER" && e.format == "IMAGE"
  )[0];
  const title = selected.components.filter(
    (e) => e.type == "HEADER" && e.format == "TEXT"
  )[0];
  const document = selected.components.filter(
    (e) => e.type == "HEADER" && e.format == "DOCUMENT"
  )[0];
  const video = selected.components.filter(
    (e) => e.type == "HEADER" && e.format == "VIDEO"
  )[0];
  const body = selected.components.filter((e) => e.type == "BODY")[0];
  const footer = selected.components.filter((e) => e.type == "FOOTER")[0];
  const buttons = selected.components.filter((e) => e.type == "BUTTONS")[0];

  const buttonItems = buttons?.buttons?.map((e) => (
    <Button
      key={e.text}
      variant="light"
      color="gray"
      fullWidth
      style={{ marginTop: 5 }}
    >
      {e.text}
    </Button>
  ));

  return (
    <Card shadow="sm" p="sm" my="sm">
      {(image || document || video) && (
        <Card.Section
          sx={{
            height: 100,
          }}
        >
          <Center
            sx={(theme) => ({
              height: "100%",
              background: theme.colors.dark[3],
            })}
          >
            {image ? (
              <Photo size={78} />
            ) : document ? (
              <FileZip size={78} />
            ) : (
              <Movie size={78} />
            )}
          </Center>
        </Card.Section>
      )}

      {title && <Text weight={500}>{title.text}</Text>}

      <Text size="md" style={{ color: secondaryColor, lineHeight: 1.2 }}>
        <ReactMarkdown>{body.text.replaceAll("*", "**")}</ReactMarkdown>
      </Text>
      {footer && (
        <Text size="xs" color="dimmed">
          {footer.text}
        </Text>
      )}

      {buttons && buttonItems}
    </Card>
  );
};

export default TemplateCard;
