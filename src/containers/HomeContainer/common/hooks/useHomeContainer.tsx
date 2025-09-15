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

  const generateRandomKoreanString = () => {
    const list = [
      "과기부 정책자금",
      "행안부 정책자금",
      "새로운 기회의 프로젝트",
      "대한민국 정책자금",
      "중소기업 정책자금",
      "소상공인 정책자금",
      "청년창업 정책자금",
      "지역균형 정책자금",
      "혁신성장 정책자금",
      "수출기업 정책자금",
      "기술개발 정책자금",
      "환경개선 정책자금",
      "문화예술 정책자금",
      "농림축산 정책자금",
      "해양수산 정책자금",
      "복지증진 정책자금",
      "스마트시티 정책자금",
      "디지털전환 정책자금",
      "탄소중립 정책자금",
      "미래산업 정책자금",
      "새로운 사업 기회",
      "혁신적인 아이디어",
      "미래를 위한 투자",
      "성공적인 비즈니스",
      "글로벌 시장 진출",
      "디지털 혁신 프로젝트",
      "지속 가능한 성장",
      "동반 성장의 기회",
      "창의적인 도전",
      "기술 융합 프로젝트",
    ];

    return list[Math.floor(Math.random() * list.length)];
  };

  const handleAutoPost = () => {
    const randomTitle = generateRandomKoreanString();
    const randomContent = "https://www.naver.com";
    autoPostMutation.mutate({
      title: randomTitle ?? "랜덤 타이틀",
      content: randomContent,
    });
  };

  return { handleAutoPost, isLoading: autoPostMutation.isPending };
};

export default useHomeContainer;
