import { useQuery } from "react-query";
import Metabase from "../../components/Metabase";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import hasPermission from "../../services/utils/hasPermission";
import api from "../../services/api";

const Results = () => {
  const { accessTokenPayload } = useSessionContext();

  const { data } = useQuery<{ url: string }, Error>(
    "question-507",
    async () => {
      const response = await api.get(`api/metabase/question/507`);
      return response.data;
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }

  if (!data) return <></>;

  return <Metabase titled link={data.url} />;
};
export default Results;
