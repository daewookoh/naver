"use client";

import { message, type UploadFile } from "antd";
import { useEffect, useState } from "react";
import { uploadFile } from "~/utils/upload";

export const useNamuImageUpload = (fieldName: string) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = async (options: any) => {
    const { onSuccess, onError, file } = options;

    try {
      const response = await uploadFile(file);
      onSuccess?.(file);
      setFileList([
        {
          uid: "-1",
          name: fieldName,
          status: "done",
          url: response.fileUrl
        }
      ]);
      setImageUrl(response.fileUrl);
    } catch (error) {
      onError?.(error as Error);
      message.error(`${fieldName} upload failed`);
    }
  };

  useEffect(() => {
    if (!imageUrl) return;

    if (!imageUrl.startsWith("https://")) {
      message.warning("imageUrl should start with https://");
      setImageUrl("");
      return;
    }

    setFileList([
      {
        uid: "-1",
        name: fieldName,
        status: "done",
        url: imageUrl
      }
    ]);
  }, [imageUrl]);

  return { imageUrl, setImageUrl, handleUpload, fileList, setFileList };
};
