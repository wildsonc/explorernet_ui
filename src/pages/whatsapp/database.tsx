import { useSessionContext } from "supertokens-auth-react/recipe/session";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import hasPermission from "../../services/utils/hasPermission";

function Database() {
  const { accessTokenPayload } = useSessionContext();

  const roles = accessTokenPayload.roles;

  if (!hasPermission("admin", roles)) {
    return <NotAuthorized />;
  }
  return <div>Database</div>;
}

export default Database;
