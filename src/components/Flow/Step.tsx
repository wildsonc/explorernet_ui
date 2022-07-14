import { Textarea, MultiSelect } from "@mantine/core";
import { useFieldArray, Control } from "react-hook-form";
import { Message, HandClick } from "tabler-icons-react";
import { Inputs } from "../../pages/sales/_formData";

interface Props {
  nestIndex: number;
  control: Control<Inputs>;
  register: any;
}

export default ({ nestIndex, control, register }: Props) => {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `steps.${nestIndex}.messages`,
  });

  console.log(fields);

  return (
    <>
      {fields.map((e, i) => {
        return (
          <Textarea
            label={`steps.${nestIndex}.messages.${i}.value`}
            value={e.value}
            autosize
            key={e.id}
            icon={<Message size={16} />}
            {...register(`steps.${nestIndex}.messages.${i}.value`)}
          />
        );
      })}
    </>
  );
};
