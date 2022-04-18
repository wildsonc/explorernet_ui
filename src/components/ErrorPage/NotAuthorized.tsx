import React from "react";
import {
  createStyles,
  Container,
  Title,
  Text,
  Button,
  Group,
} from "@mantine/core";
import { ShieldLock } from "tabler-icons-react";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 120,
    paddingBottom: 120,
    height: "100%",
    borderRadius: 5,
    backgroundColor: theme.colors.red[5],
  },

  inner: {
    position: "relative",
  },

  image: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 0,
    opacity: 0.3,
  },

  content: {
    paddingTop: 220,
    position: "relative",
    zIndex: 1,

    [theme.fn.smallerThan("sm")]: {
      paddingTop: 120,
    },
  },

  title: {
    fontFamily: theme.fontFamily,
    textAlign: "center",
    fontWeight: 900,
    fontSize: 38,
    color: theme.white,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 32,
    },
  },

  description: {
    maxWidth: 460,
    margin: "auto",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl * 1.5,
    fontWeight: 500,
    color: theme.white,
  },
}));

export default function NotAuthorized() {
  const { classes } = useStyles();
  const router = useRouter();

  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.inner}>
          <ShieldLock size={500} className={classes.image} color="red" />
          <div className={classes.content}>
            <Title className={classes.title}>Acesso negado</Title>
            <Text size="lg" align="center" className={classes.description}>
              Você não possuí permissão para visualizar esta página.
            </Text>
            <Group position="center">
              <Button
                size="md"
                variant="white"
                color="red"
                onClick={() => router.push("/")}
              >
                Ir para Home
              </Button>
            </Group>
          </div>
        </div>
      </Container>
    </div>
  );
}
