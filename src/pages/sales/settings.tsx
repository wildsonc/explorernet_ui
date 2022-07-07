import {
  Box,
  Button,
  Center,
  SegmentedControl,
  Select,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import {
  BrandGoogleDrive,
  BrandTelegram,
  FileInvoice,
} from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";

interface Drive {
  id: string;
  name: string;
}

export default function Bot() {
  const { accessTokenPayload } = useSessionContext();
  const [drives, setDrives] = useState<Drive[]>([]);
  const [selected, setSelected] = useState("drive");
  const form = useForm({
    initialValues: {
      folder: "",
    },
  });

  useEffect(() => {
    api
      .get<Drive[]>("/api/integrations/drive")
      .then((res) => setDrives(res.data));
  }, []);

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }
  return (
    <>
      <SegmentedControl
        value={selected}
        onChange={setSelected}
        data={[
          {
            value: "drive",
            label: (
              <Center>
                <BrandGoogleDrive size={16} />
                <Box ml={10}>Drive</Box>
              </Center>
            ),
          },
          {
            value: "contract",
            label: (
              <Center>
                <FileInvoice size={16} />
                <Box ml={10}>Contrato</Box>
              </Center>
            ),
          },
          {
            value: "bot",
            label: (
              <Center>
                <BrandTelegram size={16} />
                <Box ml={10}>Telegram</Box>
              </Center>
            ),
          },
        ]}
      />

      {selected == "drive" && (
        <Box mt={10}>
          <Select
            label="Pasta de destino"
            placeholder="Escolha uma"
            data={drives.map((e) => {
              return {
                value: e.id,
                label: e.name,
              };
            })}
            sx={{ maxWidth: 300 }}
            {...form.getInputProps("folder")}
          />
        </Box>
      )}
      {selected == "contract" && (
        <Box mt={10}>
          <TextInput label="UNICO Template" sx={{ maxWidth: 300 }} />
          <TextInput label="Template PF" sx={{ maxWidth: 300 }} />
          <TextInput label="Template PJ" sx={{ maxWidth: 300 }} />
        </Box>
      )}
      {selected == "bot" && (
        <Box mt={10}>
          <TextInput label="Token" sx={{ maxWidth: 500 }} />
        </Box>
      )}

      <Button
        sx={{ position: "absolute", bottom: 20, right: "50%" }}
        size="lg"
        onClick={() => console.log(form.values)}
      >
        Salvar
      </Button>
    </>
  );
}
