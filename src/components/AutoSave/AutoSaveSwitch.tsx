import { Switch, SwitchProps } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Check } from "tabler-icons-react";
import api from "../../services/api";

interface KeyProps {
  key: string;
  value: string;
}

export default function AutoSaveSwitch(props: SwitchProps) {
  const [value, setValue] = useState(false);
  const { data, refetch } = useQuery<KeyProps, Error>(
    `KEY_${props.name}`,
    async () => {
      const response = await api.get(`api/key?name=${props.name}`);
      return response.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  useEffect(() => {
    const isTrue = data?.value == "true";
    setValue(isTrue);
  }, [data]);

  const update = (value: any) => {
    setValue(value);
    api
      .post("api/key", { key: props.name, value: value + "" })
      .then((response) => {
        showNotification({
          title: "Salvo",
          message: "Campo atualizado com sucesso!",
          color: "green",
          icon: <Check />,
        });
      })
      .then((res) => refetch());
  };

  return (
    <Switch
      {...props}
      checked={value}
      onChange={(event) => update(event.currentTarget.checked)}
    />
  );
}
