import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import hasPermission from "../../services/utils/hasPermission";
import Metabase from "../../components/Metabase";
import api from "../../services/api";

const Documentation = () => {
  const { accessTokenPayload } = useSessionContext();

  const { data } = useQuery<{ url: string }, Error>(
    "metabase-579",
    async () => {
      const response = await api.get(`api/metabase/question/579`);
      return response.data;
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const roles = accessTokenPayload.roles;

  if (!hasPermission("view_route", roles)) {
    return <NotAuthorized />;
  }

  if (!data) return <></>;

  return <Metabase titled link={data.url} />;
};

export default Documentation;
