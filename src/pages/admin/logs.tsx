import { Tabs, Text, ScrollArea } from "@mantine/core";
import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { BrandDocker } from "tabler-icons-react";
import api from "../../services/api";

interface Props {
  id: string;
  name: string;
  node: string;
  status: string;
  state: string;
}

const Logs = () => {
  const [logs, setLogs] = useState({});
  const { data, refetch } = useQuery<Props[]>(
    "docker",
    async () => {
      const response = await api.get(`api/containers`);
      return response.data;
    },
    {
      staleTime: 1000 * 60,
    }
  );
  if (!data) return <></>;

  const getLogs = async (id: string, node: string) => {
    const { data } = await api.get(`api/container/logs?id=${id}&node=${node}`);
    // useMemo(()=> setLogs(data), [id])
    return data;
  };

  const tabs = data.map((e) => {
    const log = getLogs(e.id, e.node).then((res) => res);
    console.log(log);
    // setInterval(async () => getLogs(e.id, e.node), 30000);
    return (
      <Tabs.Tab key={e.id} label={e.name} icon={<BrandDocker size={18} />}>
        <ScrollArea sx={{ width: "100%", height: 700 }}>
          <Text size="xs" sx={{ whiteSpace: "pre-line" }}>
            te
          </Text>
        </ScrollArea>
      </Tabs.Tab>
    );
  });

  return <Tabs>{tabs}</Tabs>;
};

export default Logs;
