export const steps = [
  {
    func: "contact_origin",
    label: "Meio de contato",
    type: "custom",
    active: true,
    messages: [
      {
        key: "meio_de_contato",
        type: "default",
        value: "Meio de contato?",
        buttons: ["URA", "Whatsapp", "Funil"],
      },
    ],
  },
  {
    func: "spc",
    label: "Consultar documento",
    type: "default",
    active: true,
    messages: [
      { key: "documento", type: "default", value: "Digite o *CPF/CNPJ*" },
      { key: "nome", type: "default", value: "Qual o nome do cliente?" },
      { key: "mãe", type: "default", value: "Qual o nome da mãe?" },
      {
        key: "system",
        type: "system_1",
        label: "Nenhuma pendência",
        value: "✅ *Nenhuma* pendência encontrada",
      },
      {
        key: "ignore_spc",
        type: "system_2",
        label: "Com pendência",
        value:
          "💰 Existem pendências para esse cliente no valor de *R$ {SPC_TOTAL}*\n\nAinda deseja realizar o cadastro?",
        buttons: ["True@Sim", "False@Não"],
      },
    ],
    settings: [
      { type: "switch", label: "Permitir consulta de CNPJ", value: true },
    ],
  },
  {
    func: "company",
    label: "Empresa",
    type: "custom",
    active: true,
    messages: [
      {
        key: "empresa",
        type: "default",
        value: "Empresa?",
        buttons: ["Explorernet", "Internetup"],
      },
    ],
  },
  {
    func: "address",
    label: "Endereço",
    type: "default",
    active: true,
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
    ],
  },
  {
    func: "viability",
    label: "Viabilidade",
    type: "default",
    active: false,
    messages: [
      {
        key: "location",
        type: "default",
        value: "Envie a localização do cliente",
      },
    ],
    settings: [{ type: "number", label: "Raio", value: 300 }],
  },
  {
    func: "product",
    label: "Planos",
    type: "default",
    active: true,
    messages: [
      { key: "plano", type: "default", value: "Escolha o plano" },
      {
        key: "ip_fixo",
        type: "default",
        value: "IP fixo?",
        buttons: ["True@Sim", "False@Não"],
      },
    ],
    settings: [{ type: "number", label: "Valor IP fixo", value: 99.9 }],
  },
  {
    func: "payment",
    label: "Taxa",
    type: "default",

    active: true,
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
    func: "due_date",
    label: "Data do vencimento",
    type: "custom",
    active: true,
    messages: [
      {
        key: "vencimento",
        type: "default",
        value: "Data do vencimento:",
        buttons: ["5", "10", "15", "20", "25"],
      },
    ],
  },
  {
    func: "contact",
    label: "Contato",
    type: "default",
    active: false,
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
    ],
    settings: [
      {
        type: "switch",
        label: "Validar apenas o primeiro número",
        value: true,
      },
    ],
  },
  {
    func: "address_proof",
    label: "Comprovante",
    type: "default",
    active: true,
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
  {
    func: "observation",
    label: "Observação",
    type: "custom",
    active: true,
    messages: [{ key: "observações", type: "default", value: "Observações?" }],
  },
];
