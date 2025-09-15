import { type FormInstance, Form, Radio } from "antd";

type Props = {
  form: FormInstance;
  name: string;
  label: string;
  required: boolean;
};

export const NamuFormBoolean = (props: Props) => {
  return (
    <Form.Item
      label={props.label}
      name={props.name}
      rules={[{ required: props.required, message: "입력이 필요합니다" }]}
    >
      <Radio.Group
        onChange={(e) => {
          console.log(e.target.value);
          props.form.setFieldsValue({
            [props.name]: e.target.value
          });
        }}
      >
        <Radio value={true}>true</Radio>
        <Radio value={false}>false</Radio>
      </Radio.Group>
    </Form.Item>
  );
};
