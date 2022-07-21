import { ActionIcon, TextInput, TextInputProps } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { ArrowBack, Check } from "tabler-icons-react";
import api from "../../services/api";

interface KeyProps {
  key: string;
  value: string;
}

export default function AutoSaveTextInput(props: TextInputProps) {
  const [value, setValue] = useState("Carregando...");
  const [currentValue, setCurrentValue] = useState("Carregando...");
  const [newValue] = useDebouncedValue(value, 1000);

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

  if (data) {
    if (value == "Carregando...") setValue(data.value);
    if (currentValue == "Carregando...") setCurrentValue(data.value);
  }

  const update = (value: any) => {
    api
      .post("api/key", { key: props.name, value })
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

  useEffect(() => {
    if (value && currentValue != value) {
      update(value);
    }
  }, [newValue]);

  return (
    <TextInput
      {...props}
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      rightSection={
        <ActionIcon
          onClick={() => {
            setValue(currentValue);
            update(currentValue);
          }}
        >
          <ArrowBack />
        </ActionIcon>
      }
    />
  );
}
