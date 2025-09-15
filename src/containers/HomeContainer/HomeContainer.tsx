"use client";

import { HomeTemplate } from "~/components/Templates/Home/HomeTemplate";
import useHomeContainer from "./common/hooks/useHomeContainer";

export const HomeContainer = () => {
  const { handleAutoPost, isLoading } = useHomeContainer();

  const homeTemplateProps: React.ComponentProps<typeof HomeTemplate> = {
    homeContentModuleProps: { title: "HomeContentModule" },
    autoPostButton: {
      onClick: handleAutoPost,
      children: "카페 글 자동등록",
      loading: isLoading,
    },
  };

  return <HomeTemplate {...homeTemplateProps} />;
};
