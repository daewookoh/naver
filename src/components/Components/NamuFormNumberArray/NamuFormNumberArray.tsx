import React from "react";
import { Form, Input, Button, Space, type FormInstance } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

type Props = {
  form: FormInstance;
  name: string;
  label: string;
};

export const NamuFormNumberArray = (props: Props) => {
  const validateNumberArray = async (_: any, value: string[]) => {
    return new Promise<void>((resolve) => {
      if (value && value.length > 0) {
        const numberArray = value.map((str) => Number(str));
        if (numberArray.some((value) => isNaN(value))) {
          alert(`${props.name} : 데이터를 입력해 주세요`);
        } else {
          props.form.setFieldsValue({ [props.name]: numberArray });
          resolve();
        }
      } else {
        props.form.setFieldsValue({ [props.name]: [] });
        resolve();
      }
    });
  };

  return (
    <Form.Item
      label={props.label}
      name={props.name}
      rules={[
        {
          validator: validateNumberArray
        }
      ]}
    >
      <Form.List name={props.name}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: "flex" }}>
                <Form.Item
                  {...restField}
                  name={[name]}
                  style={{ marginBottom: 2 }}
                >
                  <Input type="number" placeholder="숫자 입력" />
                </Form.Item>
                <MinusCircleOutlined
                  onClick={() => {
                    remove(name);
                  }}
                />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  add();
                }}
                icon={<PlusOutlined />}
                size="small"
              ></Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form.Item>
  );
};
