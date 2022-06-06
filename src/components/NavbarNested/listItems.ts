import {
  World,
  Settings,
  BrandWhatsapp,
  Circle2,
  Headset,
  Coin,
  UserCheck,
  Ad2,
} from "tabler-icons-react";

export const listItems = [
  {
    label: "Suporte",
    icon: Headset,
    role: "view_support",
    links: [
      {
        label: "Mapa",
        link: "/support/map",
        role: "view_support",
        description: "Suporte → Mapa",
      },
    ],
  },
  {
    label: "Financeiro",
    icon: Coin,
    role: "view_finance",
    links: [
      {
        label: "Negociação",
        link: "/finance/negotiation",
        role: "view_finance",
        description: "Financeiro → Negociação",
      },
      {
        label: "Mudança de plano",
        link: "/finance/access_plan",
        role: "view_finance",
        description: "Financeiro → Mudança de plano",
      },
      {
        label: "Mudança de endereço",
        link: "/finance/address",
        role: "view_finance",
        description: "Financeiro → Mudança de endereço",
      },
      {
        label: "Configurações",
        link: "/finance/settings",
        role: "admin",
        description: "Financeiro → Configurações",
      },
    ],
  },
  {
    label: "Retenção",
    icon: UserCheck,
    role: "view_retention",
    links: [
      {
        label: "Cancelamento",
        link: "/retention/cancel",
        role: "view_retention",
        description: "Retenção → Cancelamento",
      },
      {
        label: "Configurações",
        link: "/retention/settings",
        role: "admin",
        description: "Retenção → Configurações",
      },
    ],
  },
  {
    label: "Marketing",
    icon: Ad2,
    role: "view_marketing",
    links: [
      {
        label: "Envio em lote",
        link: "/marketing/message",
        role: "view_marketing",
        description: "Marketing → Envio em lote",
      },
      {
        label: "Mapa",
        link: "/marketing/map",
        role: "view_marketing",
        description: "Marketing → Mapa",
      },
    ],
  },
  {
    label: "Nível 2",
    icon: Circle2,
    role: "view_support2",
    links: [
      {
        label: "Registrar caixa",
        link: "/leveltwo/map",
        role: "view_support2",
        description: "NVL2 → Registrar caixa",
      },
      {
        label: "Documentação",
        link: "/leveltwo/documentation",
        role: "view_support2",
        description: "NVL2 → Documentação",
      },
    ],
  },
  {
    label: "NOC",
    icon: World,
    role: "view_noc",
    links: [
      {
        label: "Mapa",
        link: "/noc/map",
        role: "view_noc",
        description: "NOC → Mapa",
      },
      {
        label: "Screenshot",
        link: "/noc/bot-screenshot",
        role: "admin",
        description: "NOC → Bot screenshot",
      },
      {
        label: "Configurações",
        link: "/noc/settings",
        role: "admin",
        description: "NOC → Configurações",
      },
    ],
  },
  {
    label: "Whatsapp",
    icon: BrandWhatsapp,
    role: "admin",
    links: [
      {
        label: "Dashboard",
        link: "/whatsapp/dashboard",
        role: "admin",
        description: "Whatsapp → Painel",
      },

      {
        label: "Resultados",
        link: "/whatsapp/results",
        role: "admin",
        description: "Whatsapp → Resultados",
      },
      {
        label: "Rotinas",
        link: "/whatsapp/tasks",
        role: "admin",
        description: "Whatsapp → Rotinas",
      },
      {
        label: "Consultas",
        link: "/whatsapp/query",
        role: "admin",
        description: "Whatsapp → Consultas",
      },
      {
        label: "Empresas",
        link: "/whatsapp/company",
        role: "admin",
        description: "Whatsapp → Empresas",
      },
    ],
  },
  {
    label: "Admin",
    icon: Settings,
    role: "admin",
    links: [
      {
        label: "Usuários",
        link: "/admin/users",
        role: "admin",
        description: "Admin → Usuários",
      },
      {
        label: "Banco de dados",
        link: "/admin/databases",
        role: "admin",
        description: "Admin → Banco de dados",
      },
      {
        label: "Integrações",
        link: "/admin/integrations",
        role: "admin",
        description: "Admin → Integrações",
      },
      {
        label: "Rotinas",
        link: "/admin/routines",
        role: "admin",
        description: "Admin → Rotinas",
      },
    ],
  },
];
