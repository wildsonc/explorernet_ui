import {
  Center,
  Group,
  Text,
  Box,
  Switch,
  NumberInput,
  TextInput,
  Button,
  Accordion,
  Grid,
  ScrollArea,
  createStyles,
  AccordionProps,
  MultiSelect,
  Loader,
} from "@mantine/core";
import { useForm, formList } from "@mantine/form";
import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { GripVertical, Message, HandClick, Check } from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { showNotification } from "@mantine/notifications";
import { steps } from "./_steps";

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

export default function Flow() {
  const { accessTokenPayload } = useSessionContext();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      loading: true,
      steps: formList(steps),
    },
  });

  const roles = accessTokenPayload.roles;

  useEffect(() => {
    api.get("api/sales/flow/1").then((res) => {
      const data = res.data["steps"];
      form.setValues({ loading: false, steps: formList(data) });
    });
  }, []);

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  const updateMessage = (
    stepIndex: number,
    optionIndex: number,
    value: string
  ) => {
    let steps = form.values.steps;
    steps.map((_, index) => {
      if (index == stepIndex) {
        _.setting.messages?.map((e, i) => {
          if (i == optionIndex) {
            e.value = value;
          }
        });
      }
    });
    form.setFieldValue("steps", steps);
  };

  const updateCheck = (
    stepIndex: number,
    optionIndex: number,
    value: boolean
  ) => {
    let steps = form.values.steps;
    steps.map((_, index) => {
      if (index == stepIndex) {
        _.setting.params?.map((e, i) => {
          if (i == optionIndex) {
            e.value = value;
          }
        });
      }
    });
    form.setFieldValue("steps", steps);
  };

  const updateNumber = (
    stepIndex: number,
    optionIndex: number,
    value: number | undefined
  ) => {
    let steps = form.values.steps;
    steps.map((_, index) => {
      if (index == stepIndex) {
        _.setting.params?.map((e, i) => {
          if (i == optionIndex) {
            if (value) e.value = value;
          }
        });
      }
    });
    form.setFieldValue("steps", steps);
  };

  const updateButtons = (
    stepIndex: number,
    value: string[],
    add: boolean = false
  ) => {
    let steps = form.values.steps;
    let newValue = value;

    steps.map((_, index) => {
      if (index == stepIndex) {
        if (add && _.setting.buttons)
          newValue = [..._.setting.buttons, ...value];
        _.setting.buttons = [...new Set(newValue)];
      }
    });
    form.setFieldValue("steps", steps);
  };

  const fields = form.values.steps.map((_, index) => (
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
                    <Text
                      color={form.values.steps[index].active ? "" : "dimmed"}
                    >
                      {form.values.steps[index].label}
                    </Text>
                  }
                >
                  {form.values.steps[index].setting &&
                    form.values.steps[index].setting.messages?.map((e, i) => (
                      <TextInput
                        label={e.label}
                        value={e.value}
                        key={`${index}-${i}`}
                        onChange={(e) =>
                          updateMessage(index, i, e.currentTarget.value)
                        }
                        icon={<Message size={16} />}
                        disabled={!_.active}
                      />
                    ))}
                  {form.values.steps[index].setting?.buttons && (
                    <MultiSelect
                      label="Botões"
                      mt={10}
                      key={`${index}`}
                      creatable
                      searchable
                      disabled={!_.active}
                      getCreateLabel={(query) => `+ Criar ${query}`}
                      onCreate={(query) => updateButtons(index, [query], true)}
                      value={form.values.steps[index].setting.buttons || []}
                      data={form.values.steps[index].setting.buttons || []}
                      onChange={(value) => updateButtons(index, value)}
                      icon={<HandClick size={16} />}
                    />
                  )}
                  {form.values.steps[index].setting &&
                    form.values.steps[index].setting.params?.map((e, i) => {
                      if (e.type == "switch") {
                        return (
                          <Switch
                            label={e.label}
                            key={`${index}-${i}`}
                            disabled={!_.active}
                            mt={20}
                            // @ts-ignore
                            checked={e.value}
                            onChange={(event) =>
                              updateCheck(index, i, event.currentTarget.checked)
                            }
                          />
                        );
                      } else if (e.type == "number") {
                        return (
                          <NumberInput
                            mt={20}
                            label={e.label}
                            disabled={!_.active}
                            key={`${index}-${i}`}
                            precision={2}
                            // @ts-ignore
                            value={e.value}
                            onChange={(v) => updateNumber(index, i, v)}
                          />
                        );
                      }
                    })}
                </Accordion.Item>
              </StyledAccordion>
            </Grid.Col>
            <Grid.Col span={1}>
              <Group position="right">
                <Switch
                  {...form.getListInputProps("steps", index, "active", {
                    type: "checkbox",
                  })}
                />
              </Group>
            </Grid.Col>
          </Grid>
        </Box>
      )}
    </Draggable>
  ));

  const handleSubmit = () => {
    setLoading(true);
    api.put("api/sales/flow/1", form.values).then((res) => {
      showNotification({
        color: "teal",
        title: "Sucesso",
        message: "Alterações aplicadas",
        icon: <Check />,
      });
      setLoading(false);
    });
  };

  if (form.values.loading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Center>
        <ScrollArea
          sx={{
            height: "calc(100vh - 40px)",
            minWidth: 600,
            maxWidth: 800,
            "@media (max-width: 800px)": {
              minWidth: "calc(100vw - 20px)",
            },
          }}
          offsetScrollbars
        >
          <DragDropContext
            onDragEnd={({ destination, source }) =>
              form.reorderListItem("steps", {
                from: source.index,
                // @ts-ignore
                to: destination.index,
              })
            }
          >
            <Droppable droppableId="dnd-list" direction="vertical">
              {(provided) => (
                <Box {...provided.droppableProps} ref={provided.innerRef}>
                  {fields}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
      </Center>
      <Button
        sx={{ position: "absolute", bottom: 20, right: 20 }}
        size="lg"
        onClick={handleSubmit}
        loading={loading}
      >
        {loading ? "Salvando" : "Salvar"}
      </Button>
    </>
  );
}
