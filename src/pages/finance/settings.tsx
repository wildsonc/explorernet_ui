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
            <Divider label="Configurações" />
            <AutoSaveTextInput
                label="Preço IP fixo"
                type="number"
                name="FINANCE_FIX_IP_PRICE"
                sx={{ margin: 10, maxWidth: 150 }}
            />
            <Divider label="Monday" mt={20} />
            <Group>
                <AutoSaveTextInput
                    label="Quadro"
                    type="number"
                    name="FINANCE_MONDAY_BOARD"
                    sx={{ margin: 10, maxWidth: 150 }}
                />
                <AutoSaveTextInput
                    label="Coluna status"
                    name="FINANCE_MONDAY_STATUS"
                    sx={{ margin: 10, maxWidth: 150 }}
                />
                <AutoSaveTextInput
                    label="Coluna assinatura"
                    name="FINANCE_MONDAY_SIGNED"
                    sx={{ margin: 10, maxWidth: 150 }}
                />
            </Group>
            <Divider label="ZapSign templates" mt={20} />
            <AutoSaveTextInput
                label={
                    <Group>
                        Mudança de plano{' '}
                        <Badge color="orange">explorernet</Badge>
                    </Group>
                }
                name="ZAPSIGN_TEMPLATE_MDP_EXP"
                sx={{ margin: 10, maxWidth: 450 }}
            />
            <AutoSaveTextInput
                label={
                    <Group>
                        Mudança de plano <Badge color="pink">internetup</Badge>
                    </Group>
                }
                name="ZAPSIGN_TEMPLATE_MDP_IUP"
                sx={{ margin: 10, maxWidth: 450 }}
            />
            <Divider mt={20} variant="dashed" />
            <AutoSaveTextInput
                label={
                    <Group>
                        Mudança de plano PJ{' '}
                        <Badge color="orange">explorernet</Badge>
                    </Group>
                }
                name="ZAPSIGN_TEMPLATE_MDP_PJ_EXP"
                sx={{ margin: 10, maxWidth: 450 }}
            />
            <AutoSaveTextInput
                label={
                    <Group>
                        Mudança de plano PJ{' '}
                        <Badge color="pink">internetup</Badge>
                    </Group>
                }
                name="ZAPSIGN_TEMPLATE_MDP_PJ_IUP"
                sx={{ margin: 10, maxWidth: 450 }}
            />
            <Divider mt={20} variant="dashed" />
            <AutoSaveTextInput
                label={
                    <Group>
                        Mudança de endereço{' '}
                        <Badge color="orange">explorernet</Badge>
                    </Group>
                }
                name="ZAPSIGN_TEMPLATE_MDE_EXP"
                sx={{ margin: 10, maxWidth: 450 }}
            />
            <AutoSaveTextInput
                label={
                    <Group>
                        Mudança de endereço{' '}
                        <Badge color="pink">internetup</Badge>
                    </Group>
                }
                name="ZAPSIGN_TEMPLATE_MDE_IUP"
                sx={{ margin: 10, maxWidth: 450 }}
            />
        </>
    );
}
