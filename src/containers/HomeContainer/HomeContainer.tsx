"use client";
  
import { HomeTemplate } from "~/components/Templates/Home/HomeTemplate";
import useHomeContainer from "./common/hooks/useHomeContainer";

export const HomeContainer = () => {
  // Generate all data and functions in this hook
  const {} = useHomeContainer();

  const homeTemplateProps: React.ComponentProps<typeof HomeTemplate> = {
    homeContentModuleProps: { title: "HomeContentModule" },
  };

  return <HomeTemplate {...homeTemplateProps} />;
};
