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
  Textarea,
  Code,
  ActionIcon,
  Modal,
} from "@mantine/core";
import { useForm, formList } from "@mantine/form";
import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import {
  GripVertical,
  Message,
  HandClick,
  Check,
  Trash,
  Plus,
} from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { showNotification } from "@mantine/notifications";
import { steps } from "../../services/steps";
import { useModals } from "@mantine/modals";

const useStyles = createStyles((theme, _settings, getRef) => ({
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
  const [opened, setOpened] = useState(false);
  const [openedNode, setOpenedNode] = useState(false);
  const [index, setIndex] = useState(0);
  const modals = useModals();
  const form = useForm({
    initialValues: {
      loading: true,
      key: "",
      steps: formList(steps),
    },
  });

  const roles = accessTokenPayload.roles;

  useEffect(() => {
    api.get("api/sales/flow/1").then((res) => {
      const data = res.data["steps"];
      form.setValues({ loading: false, key: "", steps: formList(data) });
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
        _.messages?.map((e, i) => {
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
        _.settings?.map((e, i) => {
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
        _.settings?.map((e, i) => {
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
    optionIndex: number,
    add: boolean = false
  ) => {
    let steps = form.values.steps;
    let newValue = value;

    steps.map((_, index) => {
      if (index == stepIndex) {
        // @ts-ignore
        if (add && _.messages[optionIndex].buttons)
          // @ts-ignore
          newValue = [..._.messages[optionIndex].buttons, ...value];
        // @ts-ignore
        _.messages[optionIndex].buttons = [...new Set(newValue)];
      }
    });
    form.setFieldValue("steps", steps);
  };

  const addQuestion = () => {
    let steps = form.values.steps;
    steps.map((_, i) => {
      if (index == i) {
        _.messages?.push({
          // @ts-ignore
          key: form.values.key,
          value: "",
          type: "custom",
        });
      }
    });
    form.setFieldValue("steps", steps);
    setOpened(false);
    form.setFieldValue("key", "");
  };

  const addButton = (nodeIndex: number, messageIndex: number) => {
    let steps = form.values.steps;
    steps.map((_, index) => {
      if (index == nodeIndex) {
        _.messages?.map((e, i) => {
          if (i == messageIndex) {
            // @ts-ignore
            _.messages[i]["buttons"] = [];
          }
        });
      }
    });
    form.setFieldValue("steps", steps);
  };

  const addNode = () => {
    form.addListItem("steps", {
      func: "__generic_node",
      label: form.values.key,
      active: true,
      messages: [],
      type: "custom",
    });
    setOpenedNode(false);
    form.setFieldValue("key", "");
  };

  const removeNode = (nodeIndex: number) => {
    form.removeListItem("steps", nodeIndex);
  };

  const removeQuestion = (nodeIndex: number, questionIndex: number) => {
    let steps = form.values.steps;
    steps.map((_, index) => {
      if (index == nodeIndex) {
        _.messages = _.messages?.filter((e, i) => i != questionIndex);
      }
    });
    form.setFieldValue("steps", steps);
  };

  const removeButtons = (nodeIndex: number, buttonIndex: number) => {
    let steps = form.values.steps;
    steps.map((_, index) => {
      if (index == nodeIndex) {
        _.messages?.map((e, i) => {
          if (i == buttonIndex) {
            // @ts-ignore
            delete e["buttons"];
          }
        });
      }
    });
    form.setFieldValue("steps", steps);
  };

  const removeButtonsIcon = (nodeIndex: number, index: number) => {
    return (
      <>
        <ActionIcon color="red" onClick={() => removeButtons(nodeIndex, index)}>
          <Trash size={16} />
        </ActionIcon>
      </>
    );
  };

  const actionIcons = (nodeIndex: number, index: number) => {
    return (
      <>
        <ActionIcon color="green" onClick={() => addButton(nodeIndex, index)}>
          <HandClick size={16} />
        </ActionIcon>
        <ActionIcon
          color="red"
          onClick={() => removeQuestion(nodeIndex, index)}
        >
          <Trash size={16} />
        </ActionIcon>
      </>
    );
  };

  const openDeleteModal = (index: number) =>
    modals.openConfirmModal({
      title: "Apagar node",
      centered: true,
      children: <Text>Você tem certeza que desejar apagar?</Text>,
      labels: { confirm: "Apagar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onCancel: () => {},
      onConfirm: () => removeNode(index),
    });

  const fields = form.values.steps.map((_, index: number) => (
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
                  {form.values.steps[index].messages?.map((e: any, i) => (
                    <Box key={`${index}-${i}`}>
                      <Textarea
                        label={
                          e.label ? (
                            <>
                              {e.label} <Code>{e.key}</Code>
                            </>
                          ) : (
                            <Code color="indigo">{e.key}</Code>
                          )
                        }
                        value={e.value}
                        autosize
                        onChange={(e) =>
                          updateMessage(index, i, e.currentTarget.value)
                        }
                        icon={<Message size={16} />}
                        rightSection={
                          e.type == "custom" ? actionIcons(index, i) : undefined
                        }
                        rightSectionWidth={70}
                        disabled={!_.active}
                      />
                      {e.buttons && (
                        <MultiSelect
                          mt={10}
                          creatable
                          searchable
                          disabled={!_.active}
                          getCreateLabel={(query) => `+ Criar ${query}`}
                          onCreate={(query) =>
                            updateButtons(index, [query], i, true)
                          }
                          value={e.buttons || []}
                          data={e.buttons || []}
                          onChange={(value) => updateButtons(index, value, i)}
                          icon={<HandClick size={16} />}
                          rightSection={
                            e.type == "custom"
                              ? removeButtonsIcon(index, i)
                              : undefined
                          }
                        />
                      )}
                    </Box>
                  ))}
                  <Button
                    size="xs"
                    variant="outline"
                    mt={15}
                    onClick={() => {
                      setOpened(true);
                      setIndex(index);
                    }}
                  >
                    +
                  </Button>
                  {form.values.steps[index].settings?.map((e, i) => {
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
                {form.values.steps[index].type != "default" && (
                  <ActionIcon
                    color="red"
                    onClick={() => openDeleteModal(index)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                )}
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
            maxWidth: 600,
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
        sx={{ position: "absolute", top: 20, right: 20 }}
        size="md"
        variant="outline"
        onClick={() => setOpenedNode(true)}
        leftIcon={<Plus size={16} />}
      >
        Node
      </Button>
      <Button
        sx={{ position: "absolute", bottom: 20, right: 20 }}
        size="lg"
        onClick={handleSubmit}
        loading={loading}
      >
        {loading ? "Salvando" : "Salvar"}
      </Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Nova pergunta"
      >
        <TextInput label="Identificador" {...form.getInputProps("key")} />
        <Group mt={20} position="right">
          <Button color="dark" onClick={() => setOpened(false)}>
            Cancelar
          </Button>
          <Button onClick={addQuestion}>Adicionar</Button>
        </Group>
      </Modal>
      <Modal
        opened={openedNode}
        onClose={() => setOpenedNode(false)}
        title="Novo bloco"
      >
        <TextInput label="Nome" {...form.getInputProps("key")} />
        <Group mt={20} position="right">
          <Button color="dark" onClick={() => setOpenedNode(false)}>
            Cancelar
          </Button>
          <Button onClick={addNode}>Adicionar</Button>
        </Group>
      </Modal>
    </>
  );
}
