import { ActionIcon, Anchor, Box, Group, List } from "@mantine/core";
import { Square, SquareCheck } from "tabler-icons-react";

interface Category {
  [key: string]: {
    enabled: boolean;
    color?: string;
  };
}

interface Props {
  categories: Category;
  setCategories: (arg0: any) => void;
}

export default function legend({ categories, setCategories }: Props) {
  const toggleCategory = (k: string) => {
    if (!categories) return null;
    const categoryState = categories[k];
    const newCategories = {
      ...categories,
      [k]: {
        ...categoryState,
        enabled: !categoryState.enabled,
      },
    };

    // if all categories are disabled, enable all -- similar to nvd3
    // if (Object.values(newCategories).every((v) => !v.enabled)) {
    //     /* eslint-disable no-param-reassign */
    //     Object.values(newCategories).forEach((v) => {
    //         v.enabled = true;
    //     });
    // }
    setCategories(newCategories);
  };

  const showSingleCategory = (k: string) => {
    if (!categories) return null;
    const newCategories = categories;
    Object.values(newCategories).forEach((v) => {
      v.enabled = false;
    });
    newCategories[k].enabled = true;
    setCategories(newCategories);
  };

  const legend = Object.entries(categories || {}).map(([k, v]) => {
    const icon = v.enabled ? (
      <SquareCheck color={v.color} />
    ) : (
      <Square color={v.color} />
    );
    return (
      <List.Item key={k} sx={{ listStyleType: "none" }}>
        <Anchor
          href="#"
          onClick={() => toggleCategory(k)}
          onDoubleClick={() => showSingleCategory(k)}
          sx={{
            textDecoration: "none",
            color: "black",
            "&:hover": { textDecoration: "none" },
          }}
        >
          <Group>
            <ActionIcon
              sx={{ marginRight: -10 }}
              color="dark"
              variant="transparent"
            >
              {icon}
            </ActionIcon>{" "}
            <strong>{k}</strong>
          </Group>
        </Anchor>
      </List.Item>
    );
  });

  return (
    categories && (
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 5,
          padding: 5,
          boxShadow: "0 0 0 2px rgb(0 0 0 / 10%)",
          position: "absolute",
          top: 10,
          right: 10,
        }}
      >
        <List>{legend}</List>
      </Box>
    )
  );
}
