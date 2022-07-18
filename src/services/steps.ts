export const steps = [
  {
    func: "generic_node",
    type: "custom",
    label: "Meio de contato",
    active: false,
    folder: "",
    messages: [
      {
        key: "meio_de_contato",
        type: "custom",
        value: "Meio de contato?",
        buttons: ["URA", "Whatsapp", "Funil"],
      },
    ],
  },
  {
    func: "spc",
    type: "default",
    label: "Consultar documento",
    active: false,
    folder: "",
    messages: [
      { key: "documento", type: "default", value: "Digite o *CPF/CNPJ*" },
      { key: "nome", type: "default", value: "Qual o nome do cliente?" },
      { key: "mãe", type: "custom", value: "Qual o nome da mãe?" },
      {
        key: "system_1",
        type: "system",
        label: "Nenhuma pendência",
        value: "✅ *Nenhuma* pendência encontrada",
      },
      {
        key: "ignore_spc",
        type: "system",
        label: "Com pendência",
        value:
          "💰 Existem pendências para esse cliente no valor de *R$ {SPC_TOTAL}*\n\nAinda deseja realizar o cadastro?",
        buttons: ["True@Sim", "False@Não"],
      },
      { key: "RG/IE", type: "custom", value: "Digite o RG/IE" },
    ],
    settings: [
      { type: "switch", label: "Permitir consulta de CNPJ", value: true },
    ],
  },
  {
    func: "generic_node",
    type: "custom",
    label: "Empresa",
    active: false,
    folder: "",
    messages: [
      {
        key: "empresa",
        type: "custom",
        value: "Empresa?",
        buttons: ["Explorernet", "Internetup"],
      },
    ],
  },
  {
    func: "address",
    type: "default",
    label: "Endereço",
    active: true,
    folder: "",
    messages: [
      { key: "cep", type: "default", value: "Digite o CEP" },
      { key: "cidade", type: "default", value: "Cidade" },
      { key: "bairro", type: "default", value: "Bairro" },
      { key: "logradouro", type: "default", value: "Logradouro" },
      {
        key: "estado",
        type: "default",
        value: "UF",
        buttons: ["GO", "DF"],
      },
      { key: "complemento", type: "default", value: "Complemento" },
      {
        key: "número",
        type: "custom",
        value: "Número",
        buttons: ["S/N"],
      },
    ],
  },
  {
    func: "viability",
    type: "default",
    label: "Viabilidade",
    active: false,
    folder: "",
    messages: [
      {
        key: "system_1",
        type: "system",
        label: "Com viabilidade",
        value: "No local {CIDADE}, {LOGRADOURO}, possuímos viabilidade",
      },
      {
        key: "viabilidade",
        type: "system",
        label: "Sem viabilidade",
        value: "Não possuímos viabilidade ainda nesse local",
        buttons: ["Continuar", "Enviar coordenadas", "Finalizar"],
      },
      {
        key: "system_3",
        type: "system",
        label: "Info",
        value: "Informe as observações relacionadas a essa venda:",
      },
    ],
    settings: [{ type: "number", label: "Raio", value: 300 }],
  },
  {
    func: "product",
    type: "default",
    label: "Planos",
    active: true,
    folder: "",
    messages: [
      { key: "plano", type: "default", value: "Escolha o plano" },
      {
        key: "ip_fixo",
        type: "custom",
        value: "IP fixo?",
        buttons: ["True@Sim", "False@Não"],
      },
    ],
    settings: [{ type: "number", label: "Valor IP fixo", value: 99.9 }],
  },
  {
    func: "payment",
    type: "default",
    label: "Taxa",
    active: false,
    folder: "",
    messages: [
      {
        key: "taxa",
        type: "default",
        value: "Taxa:",
        buttons: ["Isento", "À vista"],
      },
    ],
    settings: [
      {
        type: "number",
        label: "Valor máximo de pendências para isenção",
        value: 250,
      },
    ],
  },
  {
    func: "generic_node",
    type: "custom",
    label: "Data do vencimento",
    active: false,
    folder: "",
    messages: [
      {
        key: "vencimento",
        type: "custom",
        value: "Data do vencimento:",
        buttons: ["5", "10", "15", "20", "25"],
      },
    ],
  },
  {
    func: "contact",
    type: "default",
    label: "Contato",
    active: false,
    folder: "",
    messages: [
      {
        key: "telefone",
        type: "default",
        value: "Digite o telefone de contato do cliente com DDD",
      },
      {
        key: "telefone_2",
        type: "custom",
        value: "Informe mais um número para contato",
      },
      {
        key: "system_1",
        type: "system",
        label: "Telefone inválido",
        value: "❌ Telefone *inválido*",
      },
      {
        key: "system_2",
        type: "system",
        label: "Sem WhatsApp",
        value: "📲 O telefone deve possuir *Whatsapp*",
      },
    ],
    settings: [
      {
        type: "switch",
        label: "Validar apenas o primeiro número",
        value: false,
      },
    ],
  },
  {
    func: "generic_node",
    type: "custom",
    label: "Observação",
    active: false,
    folder: "",
    messages: [{ key: "observações", type: "custom", value: "Observações?" }],
  },
  {
    func: "address_proof",
    type: "default",
    label: "Comprovante",
    active: false,
    folder: "",
    messages: [
      {
        key: "address_proof",
        type: "default",
        value: "Envie foto do comprovante de endereço",
      },
    ],
    settings: [
      {
        type: "switch",
        label: "Permitir foto com compressão",
        value: false,
      },
    ],
  },
];
