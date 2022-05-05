import { Badge, Divider, Group } from '@mantine/core';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import AutoSaveTextInput from '../../components/AutoSave/AutoSaveTextInput';
import NotAuthorized from '../../components/ErrorPage/NotAuthorized';
import hasPermission from '../../services/utils/hasPermission';

export default function Settings() {
    const { accessTokenPayload } = useSessionContext();

    const roles = accessTokenPayload.roles;

    if (!hasPermission('admin', roles)) {
        return <NotAuthorized />;
    }

    return (
        <>
            <Divider label="ZapSign templates" />

            <AutoSaveTextInput
                label={
                    <Group>
                        Cancelamento <Badge color="orange">explorernet</Badge>
                    </Group>
                }
                name="ZAPSIGN_TEMPLATE_CANCEL_EXP"
                sx={{ margin: 10, maxWidth: 450 }}
            />
            <AutoSaveTextInput
                label={
                    <Group>
                        Cancelamento <Badge color="pink">internetup</Badge>
                    </Group>
                }
                name="ZAPSIGN_TEMPLATE_CANCEL_IUP"
                sx={{ margin: 10, maxWidth: 450 }}
            />
        </>
    );
}
