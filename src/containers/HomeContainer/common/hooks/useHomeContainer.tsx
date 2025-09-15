import { api } from "~/trpc/react";
import { notification } from "antd";

const useHomeContainer = () => {
  const autoPostMutation = api.post.autoPost.useMutation({
    onSuccess: () => {
      notification.success({ message: "게시글이 성공적으로 등록되었습니다." });
    },
    onError: (error) => {
      notification.error({ message: `에러가 발생했습니다: ${error.message}` });
    },
  });

  const generateRandomKoreanString = (length: number) => {
    let result = "";
    const minCode = 0xac00; // '가'
    const maxCode = 0xd7a3; // '힣'
    for (let i = 0; i < length; i++) {
      const randomCode =
        Math.floor(Math.random() * (maxCode - minCode + 1)) + minCode;
      result += String.fromCharCode(randomCode);
    }
    return result;
  };

  const handleAutoPost = () => {
    const randomTitle = generateRandomKoreanString(5);
    const randomContent = generateRandomKoreanString(5);
    autoPostMutation.mutate({ title: randomTitle, content: randomContent });
  };

  return { handleAutoPost, isLoading: autoPostMutation.isPending };
};

export default useHomeContainer;
