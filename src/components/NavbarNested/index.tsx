import {
    ActionIcon,
    Group,
    Navbar,
    ScrollArea,
    useMantineColorScheme,
} from '@mantine/core';
import { SpotlightAction, SpotlightProvider } from '@mantine/spotlight';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { Home, MoonStars, Search, Sun } from 'tabler-icons-react';
import api from '../../services/api';
import hasPermission from '../../services/utils/hasPermission';
import Logo, { LogoDark } from '../Logo';
import { ActionLink, LinksGroup } from '../NavbarLinksGroup';
import { UserButton } from '../UserButton';
import { useStyles } from './styles';
import { listItems } from './listItems';

export function NavbarNested() {
    let { accessTokenPayload } = useSessionContext();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const { classes } = useStyles();
    const router = useRouter();
    const [opened, setOpened] = useState(false);

    useEffect(() => {
        api.post('api/auth/update/roles').then((res) => {
            if (res.data.need_refresh) {
                location.reload();
            }
        });
    }, []);

    const dark = colorScheme === 'dark';

    const roles = accessTokenPayload.roles;
    const user = accessTokenPayload.user;

    console.log(user);

    const actions: SpotlightAction[] = [];
    listItems.map((i) => {
        return i.links.map((e) => {
            if (hasPermission(e.role, roles)) {
                actions.push({
                    title: e.label,
                    description: e.description,
                    onTrigger: () => router.push(e.link),
                });
            }
        });
    });

    const links = listItems.map((item) => {
        if (hasPermission(item.role, roles)) {
            return <LinksGroup {...item} key={item.label} />;
        }
    });

    return (
        <SpotlightProvider
            actions={actions}
            searchIcon={<Search size={18} />}
            searchPlaceholder="Buscar..."
            shortcut={['mod + b', 'mod + k']}
            nothingFoundMessage="Nada encontrado..."
        >
            <Navbar
                height={'100vh'}
                width={{ base: 250 }}
                hiddenBreakpoint="sm"
                hidden={!opened}
                p="md"
                className={classes.navbar}
            >
                <Navbar.Section className={classes.header}>
                    <Group position="apart">
                        {dark ? <LogoDark width={80} /> : <Logo width={80} />}
                        <ActionIcon
                            size="lg"
                            sx={(theme) => ({
                                backgroundColor: dark
                                    ? theme.colors.dark[6]
                                    : theme.colors.gray[0],
                                color: dark
                                    ? theme.colors.yellow[4]
                                    : theme.colors.blue[6],
                            })}
                            color={dark ? 'yellow' : 'blue'}
                            onClick={() => toggleColorScheme()}
                            title="Alterar tema"
                        >
                            {dark ? <Sun size={18} /> : <MoonStars size={18} />}
                        </ActionIcon>
                    </Group>
                </Navbar.Section>

                <Navbar.Section
                    grow
                    className={classes.links}
                    component={ScrollArea}
                >
                    <div className={classes.linksInner}>
                        <ActionLink
                            label="Home"
                            icon={Home}
                            onClick={() => router.push('/')}
                        />
                        {links}
                    </div>
                </Navbar.Section>

                <Navbar.Section className={classes.footer}>
                    <UserButton name={user.first_name} email={user.email} />
                </Navbar.Section>
            </Navbar>
        </SpotlightProvider>
    );
}
