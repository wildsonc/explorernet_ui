import {
    World,
    Settings,
    BrandWhatsapp,
    Circle2,
    Headset,
    Coin,
} from 'tabler-icons-react';

export const listItems = [
    {
        label: 'Suporte',
        icon: Headset,
        role: 'view_support',
        links: [],
    },
    {
        label: 'Financeiro',
        icon: Coin,
        role: 'view_finance',
        links: [],
    },
    {
        label: 'Nível 2',
        icon: Circle2,
        role: 'view_support2',
        links: [
            {
                label: 'Registrar caixa',
                link: '/leveltwo/map',
                role: 'view_support2',
                description: 'NVL2 → Registrar caixa',
            },
            {
                label: 'Documentação',
                link: '/leveltwo/documentation',
                role: 'view_support2',
                description: 'NVL2 → Documentação',
            },
        ],
    },
    {
        label: 'NOC',
        icon: World,
        role: 'view_noc',
        links: [
            {
                label: 'Mapa',
                link: '/noc/map',
                role: 'view_noc',
                description: 'NOC → Mapa',
            },
            // {
            //   label: "Histórico",
            //   link: "/noc/history",
            //   role: "view_noc",
            //   description: "NOC → Histórico de notificações",
            // },
            {
                label: 'Configurações',
                link: '/noc/settings',
                role: 'admin',
                description: 'NOC → Configurações',
            },
        ],
    },
    {
        label: 'Whatsapp',
        icon: BrandWhatsapp,
        role: 'admin',
        links: [
            {
                label: 'Dashboard',
                link: '/whatsapp/dashboard',
                role: 'admin',
                description: 'Whatsapp → Painel',
            },
            {
                label: 'Resultados',
                link: '/whatsapp/results',
                role: 'admin',
                description: 'Whatsapp → Resultados',
            },
            {
                label: 'Rotinas',
                link: '/whatsapp/tasks',
                role: 'admin',
                description: 'Whatsapp → Rotinas',
            },
            {
                label: 'Consultas',
                link: '/whatsapp/query',
                role: 'admin',
                description: 'Whatsapp → Consultas',
            },
            {
                label: 'Empresas',
                link: '/whatsapp/company',
                role: 'admin',
                description: 'Whatsapp → Empresas',
            },
        ],
    },
    {
        label: 'Admin',
        icon: Settings,
        role: 'admin',
        links: [
            {
                label: 'Usuários',
                link: '/admin/users',
                role: 'admin',
                description: 'Admin → Usuários',
            },
            {
                label: 'Banco de dados',
                link: '/admin/databases',
                role: 'admin',
                description: 'Admin → Banco de dados',
            },
            {
                label: 'Integrações',
                link: '/admin/integrations',
                role: 'admin',
                description: 'Admin → Integrações',
            },
            {
                label: 'Logs',
                link: '/admin/logs',
                role: 'admin',
                description: 'Admin → Logs',
            },
        ],
    },
];
