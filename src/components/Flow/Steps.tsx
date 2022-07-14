import {
  Accordion,
  AccordionProps,
  Box,
  Center,
  createStyles,
  Grid,
  Group,
  Switch,
  Text,
} from "@mantine/core";
import { Draggable } from "react-beautiful-dnd";
import {
  Control,
  useFieldArray,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { GripVertical } from "tabler-icons-react";
import { Inputs } from "../../pages/sales/_formData";
import Step from "./Step";

interface Props {
  control: Control<Inputs>;
  register: any;
  setValue: UseFormSetValue<Inputs>;
  getValues: UseFormGetValues<Inputs>;
}

const useStyles = createStyles((theme, _params, getRef) => ({
  icon: { ref: getRef("icon") },

  control: {
    ref: getRef("control"),
    border: 0,
    opacity: 0.8,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,

    "&:hover": {
      backgroundColor: "transparent",
    },
  },

  item: {
    borderBottom: 0,
    overflow: "hidden",
    transition: `box-shadow 150ms ${theme.transitionTimingFunction}`,
    border: "1px solid transparent",
    borderRadius: theme.radius.sm,
  },

  itemOpened: {
    [`& .${getRef("control")}`]: {
      opacity: 1,
    },

    [`& .${getRef("icon")}`]: {
      transform: "rotate(45deg)",
    },
  },

  content: {
    paddingLeft: 0,
  },
}));

function StyledAccordion(props: AccordionProps) {
  const { classes } = useStyles();
  return <Accordion classNames={classes} {...props} />;
}

export default function Steps({
  control,
  register,
  setValue,
  getValues,
}: Props) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "steps",
  });

  return (
    <>
      {fields.map((item, index) => {
        return (
          <Draggable key={index} index={index} draggableId={index.toString()}>
            {(provided) => (
              <Box
                ref={provided.innerRef}
                mt="xs"
                {...provided.draggableProps}
                sx={(theme) => ({
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[8]
                      : theme.colors.gray[1],
                  textAlign: "center",
                  padding: theme.spacing.xs,
                  borderRadius: theme.radius.md,

                  "&:hover": {
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[6]
                        : theme.colors.gray[3],
                  },
                })}
              >
                <Grid
                  grow
                  align="center"
                  gutter="xs"
                  justify="space-between"
                  {...provided.dragHandleProps}
                >
                  <Grid.Col span={1}>
                    <Center>
                      <GripVertical size={16} style={{ padding: 0 }} />
                    </Center>
                  </Grid.Col>
                  <Grid.Col span={9}>
                    <StyledAccordion>
                      <Accordion.Item
                        label={
                          <Text color={item.active ? "" : "dimmed"}>
                            {item.label}
                          </Text>
                        }
                      >
                        <Step nestIndex={index} {...{ control, register }} />
                      </Accordion.Item>
                    </StyledAccordion>
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <Group position="right">
                      <Switch {...register(`steps.${index}.active`)} />
                    </Group>
                  </Grid.Col>
                </Grid>
              </Box>
            )}
          </Draggable>
        );
      })}
    </>
  );
}
