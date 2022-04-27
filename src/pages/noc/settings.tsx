import { Divider, Group, Title } from '@mantine/core';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { BrandTelegram, BrandWhatsapp } from 'tabler-icons-react';
import AutoSaveTextInput from '../../components/AutoSave/AutoSaveTextInput';
import NotAuthorized from '../../components/ErrorPage/NotAuthorized';
import hasPermission from '../../services/utils/hasPermission';

export default function Settings() {
    const { accessTokenPayload } = useSessionContext();

    const roles = accessTokenPayload.roles;

    if (!hasPermission('admin', roles)) {
        return <NotAuthorized />;
    }

    const telegramTitle = (
        <>
            <Group>
                <BrandTelegram style={{ marginRight: -10 }} size={20} />
                <Title order={5}>Telegram</Title>
            </Group>
        </>
    );
    const whatsappTitle = (
        <>
            <Group>
                <BrandWhatsapp style={{ marginRight: -10 }} size={20} />
                <Title order={5}>Whatsapp</Title>
            </Group>
        </>
    );
    return (
        <>
            <Divider size="sm" label={telegramTitle} />
            <AutoSaveTextInput
                label="Token"
                name="NOC_BOT_TOKEN"
                sx={{ margin: 10, maxWidth: 500 }}
            />
            <AutoSaveTextInput
                label="Canal"
                name="NOC_BOT_CHANNEL"
                sx={{ margin: 10, maxWidth: 200 }}
            />
            <Divider size="sm" label={whatsappTitle} sx={{ paddingTop: 10 }} />
            <Group>
                <AutoSaveTextInput
                    label="HSM - Notificação"
                    name="NOC_HSM"
                    sx={{ margin: 10, maxWidth: 300 }}
                />
                <AutoSaveTextInput
                    label="Previsão"
                    name="NOC_HSM_TIME"
                    sx={{ margin: 10, maxWidth: 150 }}
                />
            </Group>
            <Group>
                <AutoSaveTextInput
                    label="HSM - Prorrogação"
                    name="NOC_HSM_EXTEND"
                    sx={{ margin: 10, maxWidth: 300 }}
                />
                <AutoSaveTextInput
                    label="Previsão"
                    name="NOC_HSM_EXTEND_TIME"
                    sx={{ margin: 10, maxWidth: 150 }}
                />
            </Group>
            <AutoSaveTextInput
                label="HSM - Resolvido"
                name="NOC_HSM_RESOLVED"
                sx={{ margin: 10, maxWidth: 300 }}
            />
        </>
    );
}
