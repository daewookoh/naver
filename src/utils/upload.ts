import type { RcFile } from "antd/es/upload";

export const uploadFile = async (file: RcFile | File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  return data;
};

export const uploadFormData = async (formData: FormData) => {
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  return data;
};
