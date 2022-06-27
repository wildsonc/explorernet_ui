import React, { useState } from "react";
import Link from "next/link";
import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  Text,
  UnstyledButton,
  Badge,
} from "@mantine/core";
import {
  Icon as TablerIcon,
  ChevronLeft,
  ChevronRight,
} from "tabler-icons-react";
import { useStyles } from "./styles";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import hasPermission from "../../services/utils/hasPermission";
import { useRouter } from "next/router";

interface LinksGroupProps {
  icon: TablerIcon;
  label: string;
  initiallyOpened?: boolean;
  links?: {
    label: string;
    link: string;
    role: string;
    badge?: string;
    badgeColor?: string;
  }[];
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
}: LinksGroupProps) {
  let { accessTokenPayload } = useSessionContext();
  const { classes, theme } = useStyles();
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const router = useRouter();

  const ChevronIcon = theme.dir === "ltr" ? ChevronRight : ChevronLeft;

  let roles = accessTokenPayload.roles;

  const items = (hasLinks ? links : []).map((link) => {
    if (hasPermission(link.role, roles)) {
      return (
        <Link href={link.link} passHref key={link.label}>
          <Text<"a">
            component="a"
            className={
              router.pathname == link.link ? classes.current : classes.link
            }
          >
            {link.label}
            {link.badge ? (
              <Badge ml={2} p={3} size="xs" color={link.badgeColor}>
                {link.badge}
              </Badge>
            ) : (
              ""
            )}
          </Text>
        </Link>
      );
    }
  });

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.control}
      >
        <Group position="apart" spacing={0}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ThemeIcon variant="light" size={30}>
              <Icon size={18} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <ChevronIcon
              className={classes.chevron}
              size={14}
              style={{
                transform: opened
                  ? `rotate(${theme.dir === "rtl" ? -90 : 90}deg)`
                  : "none",
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
interface ActionLinkProps {
  icon: TablerIcon;
  label: string;
  onClick: () => void;
}

export function ActionLink({ icon: Icon, label, onClick }: ActionLinkProps) {
  const { classes, theme } = useStyles();

  return (
    <>
      <UnstyledButton onClick={onClick} className={classes.control}>
        <Group position="apart" spacing={0}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ThemeIcon variant="light" size={30}>
              <Icon size={18} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
        </Group>
      </UnstyledButton>
    </>
  );
}
