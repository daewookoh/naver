"use client";

import { HomeTemplate } from "~/components/Templates/Home/HomeTemplate";
import { useHomeContainer } from "./common/hooks/useHomeContainer";

export const HomeContainer = () => {
  const { handleAutoPost, isLoading } = useHomeContainer();

  const homeTemplateProps: React.ComponentProps<typeof HomeTemplate> = {
    homeContentModuleProps: {
      searchStartDate: undefined,
      onSearch: (startDate: string) => {
        // 검색 로직 구현
        console.log("Search started from:", startDate);
      },
    },
    autoPostButton: {
      onClick: handleAutoPost,
      loading: isLoading,
    },
  };

  return <HomeTemplate {...homeTemplateProps} />;
};
