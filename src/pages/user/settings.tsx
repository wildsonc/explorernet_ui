import { Box, Button, Group, TextInput } from "@mantine/core";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { User, Mail, Key } from "tabler-icons-react";

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

const Settings = () => {
  const { accessTokenPayload } = useSessionContext();
  const user: User = accessTokenPayload.user;

  const full_name = `${user.first_name} ${user.last_name}`;

  return (
    <Box sx={{ width: 400 }}>
      <TextInput
        label="Nome completo"
        value={full_name}
        disabled
        icon={<User />}
      />
      <TextInput
        label="Email"
        value={user.email}
        disabled
        mt={5}
        icon={<Mail />}
      />
      <Group mt={20}>
        <Button disabled>Salvar</Button>
        <Button disabled variant="outline" leftIcon={<Key />}>
          Alterar senha
        </Button>
      </Group>
    </Box>
  );
};

export default Settings;
