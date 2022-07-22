import { Button, Center, NumberInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Database } from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";

interface OltProps {
  id: number;
  name: string;
  ip: string;
  olt_type: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  value: string;
  label: string;
}

const UpdateOlt = () => {
  let { accessTokenPayload } = useSessionContext();
  const [olts, setOlts] = useState<Props[]>();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      ip: "",
      slot: 12,
      pon: 8,
    },
    validate: {
      ip: (value) => (value == "" ? "Escolha uma OLT" : null),
    },
  });

  const { data } = useQuery<OltProps[], Error>(
    "olts",
    async () => {
      const res = await api.get(`api/leveltwo/olt`);
      return res.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  if (!olts && data) setOlts(data.map((e) => ({ label: e.name, value: e.ip })));

  const roles = accessTokenPayload.roles;

  const handleSubmit = (values: typeof form.values) => {
    let olt_type = data?.filter((e) => e.ip == values.ip)[0].olt_type;
    api.post("api/leveltwo/update-olt", { ...values, olt_type }).then((res) =>
      showNotification({
        title: (
          <>{res.data.cache ? <Database size={14} /> : null} Atualizando</>
        ),
        message: <>Aguarde 1 minuto</>,
        color: "green",
        autoClose: 1000 * 10,
      })
    );
  };

  if (!hasPermission("view_support2", roles)) {
    return <NotAuthorized />;
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Center>
        <div>
          <Select
            label="OLT"
            data={olts || []}
            searchable
            required
            {...form.getInputProps("ip")}
            sx={{ width: 300 }}
          />
          <NumberInput label="Slot" required {...form.getInputProps("slot")} />
          <NumberInput label="Pon" required {...form.getInputProps("pon")} />
          <Center mt={20}>
            <Button loading={loading} type="submit">
              Atualizar
            </Button>
          </Center>
        </div>
      </Center>
    </form>
  );
};

export default UpdateOlt;
