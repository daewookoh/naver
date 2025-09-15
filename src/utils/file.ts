import { message, type UploadFile } from "antd";
import { uploadFormData } from "./upload";
import { MAX_FILE_SIZE } from "./constants";
import { FileType } from "@prisma/client";

export const isOverMaxFileSize = (file: UploadFile) => {
  if (file.size && file.size > MAX_FILE_SIZE) {
    void message.error("Only files smaller than 50MB can be uploaded.");
    return true;
  }

  return false;
};

export const getThumbnailUrlFromVideoFile = async (src: string) => {
  const blob = await new Promise<string>((resolve, reject) => {
    // 비디오 요소 생성
    const video = document.createElement("video");
    video.src = src;
    video.load();

    video.addEventListener("loadeddata", () => {
      // 비디오의 메타데이터가 로드되면 실행
      video.currentTime = 0.1; // 썸네일을 생성할 시간 지정 (0.1초)
    });

    video.addEventListener("seeked", () => {
      // 지정한 시간으로 이동이 완료되면 실행
      try {
        // canvas 요소 생성
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // canvas에 비디오의 현재 프레임을 그림
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob as any);
          } else {
            reject(new Error("Canvas to Blob 변환 실패"));
          }
        }, "image/webp");
      } catch (error) {
        reject(new Error(error as string));
      }
    });
  });

  const formData = new FormData();
  formData.append("file", blob as any, "videoThumbnail");
  const uploadedData = await uploadFormData(formData);

  return uploadedData.fileUrl;
};

export const convertImageToWebP = (imageUrl: string, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas to Blob conversion failed"));
          }
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => {
      reject(new Error("Image loading failed"));
    };
    img.crossOrigin = "Anonymous"; // This is important for CORS if the image is not from the same origin
    img.src = imageUrl;
  });
};

export const getFileType = (type?: string) => {
  if (type?.toLowerCase().startsWith("image")) {
    return FileType.IMAGE;
  }

  if (type?.toLowerCase().startsWith("audio")) {
    return FileType.AUDIO;
  }

  if (type?.toLowerCase().startsWith("video")) {
    return FileType.VIDEO;
  }

  return FileType.OTHER;
};
