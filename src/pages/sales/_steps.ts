export const steps = [
  {
    label: "Meio de entrada",
    active: true,
    setting: {
      buttons: ["URA", "Whatsapp"],
      messages: [{ label: "Mensagem", value: "Meio de contato?" }],
    },
  },
  {
    label: "Consultar documento",
    active: true,
    setting: {
      params: [
        {
          id: "cnpj",
          type: "switch",
          label: "Permitir consulta de CNPJ",
          value: true,
        },
      ],
      messages: [
        { label: "Mensagem", value: "Digite o CPF/CNPJ" },
        { label: "Nome", value: "Qual o nome do cliente?" },
        { label: "Mãe", value: "Qual o nome da mãe?" },
      ],
    },
  },
  {
    label: "Endereço",
    active: true,
    setting: {
      messages: [
        { label: "Mensagem", value: "Digite o CEP" },
        { label: "Cidade", value: "Cidade" },
        { label: "Bairro", value: "Bairro" },
        { label: "Logradouro", value: "Logradouro" },
        { label: "Complemento", value: "Complemento" },
      ],
    },
  },
  {
    label: "Viabilidade",
    active: true,
    setting: {
      params: [{ id: "raio", type: "number", label: "Raio", value: 300 }],
      messages: [
        { label: "Mensagem", value: "Envie a localização do cliente" },
      ],
    },
  },
  {
    label: "Planos",
    active: true,
    setting: {
      params: [
        { id: "ip", type: "number", label: "Valor IP fixo", value: 99.9 },
      ],
      messages: [{ label: "Mensagem", value: "Escolha o plano" }],
    },
  },
  {
    label: "Contato",
    active: true,
    setting: {
      params: [
        {
          id: "ip",
          type: "switch",
          label: "Validar whatsapp do segundo número",
          value: true,
        },
      ],
      messages: [
        {
          label: "Mensagem",
          value: "Digite o telefone de contato do cliente com DDD",
        },
        {
          label: "Segundo número",
          value: "Informe mais um número para contato",
        },
      ],
    },
  },
  {
    label: "Taxa",
    active: true,
    setting: {
      params: [
        {
          id: "value",
          type: "number",
          label: "Valor máximo de pendências para isenção",
          value: 250,
        },
      ],
      buttons: ["Isento", "À vista"],
      messages: [{ label: "Mensagem", value: "Taxa:" }],
    },
  },
  {
    label: "Data do vencimento",
    active: true,
    setting: {
      buttons: ["5", "10", "15", "20", "25"],
      messages: [{ label: "Mensagem", value: "Data do vencimento:" }],
    },
  },
  {
    label: "Comprovante",
    active: true,
    setting: {
      params: [
        {
          id: "comprovante",
          type: "switch",
          label: "Permitir foto com compressão",
          value: false,
        },
      ],
      messages: [
        { label: "Mensagem", value: "Envie foto do comprovante de endereço" },
      ],
    },
  },
  {
    label: "Observação",
    active: true,
    setting: { messages: [{ label: "Mensagem", value: "Observações?" }] },
  },
];
