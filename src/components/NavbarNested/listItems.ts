import {
  World,
  Settings,
  BrandWhatsapp,
  Circle2,
  Headset,
  Coin,
  UserCheck,
  Ad2,
  BuildingStore,
  Route,
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
        label: "Mudança de plano ",
        badge: "beta",
        badgeColor: "orange",
        link: "/finance/access_plan_unico",
        role: "admin",
        description: "Financeiro → Mudança de plano (UNICO)",
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
  // {
  //   label: "Retenção",
  //   icon: UserCheck,
  //   role: "view_retention",
  //   links: [
  //     {
  //       label: "Cancelamento",
  //       link: "/retention/cancel",
  //       role: "view_retention",
  //       description: "Retenção → Cancelamento",
  //     },
  //     {
  //       label: "Configurações",
  //       link: "/retention/settings",
  //       role: "admin",
  //       description: "Retenção → Configurações",
  //     },
  //   ],
  // },
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
    label: "Rotas",
    icon: Route,
    role: "view_route",
    links: [
      {
        label: "Enviar mensagem",
        link: "/route/message",
        role: "view_route",
        description: "Rotas → Enviar mensagem",
      },
      {
        label: "Histórico",
        link: "/route/history",
        role: "view_route",
        description: "Rotas → Histórico",
      },
    ],
  },
  {
    label: "Comercial",
    icon: BuildingStore,
    role: "view_sales",
    links: [
      {
        label: "Flow",
        link: "/sales/flow",
        role: "admin",
        description: "Comercial → Flow",
      },
      {
        label: "Vendedores",
        link: "/sales/sellers",
        role: "admin",
        description: "Comercial → Vendedores",
      },
      {
        label: "Planos",
        link: "/sales/products",
        role: "admin",
        description: "Comercial → Planos",
      },
      {
        label: "Franquias",
        link: "/sales/franchise",
        role: "admin",
        description: "Comercial → Franquias",
      },
      {
        label: "Configuração",
        link: "/sales/settings",
        role: "admin",
        description: "Comercial → Configuração",
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
      {
        label: "Atualizar OLT",
        link: "/leveltwo/update-olt",
        role: "view_support2",
        description: "NVL2 → Atualizar OLT",
      },
      {
        label: "OLTs",
        link: "/leveltwo/olt",
        role: "admin",
        description: "NVL2 → OLTs",
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
      {
        label: "Blacklist",
        link: "/whatsapp/blacklist",
        role: "admin",
        description: "Whatsapp → Blacklist",
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
        label: "Cidades",
        link: "/admin/cities",
        role: "admin",
        description: "Admin → Cidades",
      },
      {
        label: "Integrações",
        link: "/admin/integrations",
        role: "admin",
        description: "Admin → Integrações",
      },
      {
        label: "Rotinas",
        link: "/admin/periodics",
        role: "admin",
        description: "Admin → Rotinas",
      },
    ],
  },
];
