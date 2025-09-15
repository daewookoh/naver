import { type FormInstance, Form, Input } from "antd";
import { type ReactNode } from "react";

type Props = {
  form: FormInstance;
  name: string;
  label: string | ReactNode;
  required: boolean;
};

export const NamuFormNumber = (props: Props) => {
  return (
    <Form.Item
      label={props.label}
      name={props.name}
      rules={[{ required: props.required, message: "입력이 필요합니다" }]}
    >
      <Input
        type="number"
        onChange={(e) => {
          const value = e.target.value;
          const numberValue = Number(value);

          if (!isNaN(numberValue)) {
            props.form.setFieldsValue({ [props.name]: numberValue });
          }
        }}
      />
    </Form.Item>
  );
};
