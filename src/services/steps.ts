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
        conditions: [],
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
      {
        key: "documento",
        type: "default",
        value: "Digite o *CPF/CNPJ*",
        conditions: [{ key: "", op: "", value: "" }],
        buttons: [],
      },
      {
        key: "nome",
        type: "default",
        value: "Qual o nome do cliente?",
        conditions: [{ key: "", op: "", value: "" }],
        buttons: [],
      },
      {
        key: "mãe",
        type: "custom",
        value: "Qual o nome da mãe?",
        conditions: [{ key: "", op: "", value: "" }],
        buttons: [],
      },
      {
        key: "system_1",
        type: "system",
        label: "Nenhuma pendência",
        value: "✅ *Nenhuma* pendência encontrada",
        conditions: [],
        buttons: [],
      },
      {
        key: "ignore_spc",
        type: "system",
        label: "Com pendência",
        value:
          "💰 Existem pendências para esse cliente no valor de *R$ {SPC_TOTAL}*\n\nAinda deseja realizar o cadastro?",
        buttons: ["True@Sim", "False@Não"],
        conditions: [],
      },
      {
        key: "RG/IE",
        type: "custom",
        value: "Digite o RG/IE",
        conditions: [{ key: "", op: "", value: "" }],
        buttons: [],
      },
    ],
    settings: [
      { type: "switch", label: "Permitir consulta de CNPJ", value: true },
    ],
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
        conditions: [],
        buttons: [],
      },
    ],
    settings: [
      {
        type: "number",
        label: "Permitir foto com compressão",
        value: 0,
      },
    ],
  },
];
