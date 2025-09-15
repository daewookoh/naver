import { HomeContentModule } from "~/components/Modules/HomeContentModule/HomeContentModule";
import { Layout, Button } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { NamuNaverLoginButton } from "~/components/Components/NamuNaverLoginButton/NamuNaverLoginButton";
import { useSession } from "next-auth/react";

type Props = {
  homeContentModuleProps: React.ComponentProps<typeof HomeContentModule>;
};

export const HomeTemplate = (props: Props) => {
  const { data: session } = useSession();

  return (
    <Layout style={{ height: "100%" }}>
      {/* 1. Header Modules */}
      <Header
        style={{
          padding: "0 20px",
          height: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "white", fontSize: "20px" }}>My App</h1>
        <NamuNaverLoginButton />
      </Header>

      {/* 2. Content Modules */}
      <Content
        style={{
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        {session ? (
          <Button type="primary">카페 글 자동등록</Button>
        ) : (
          <HomeContentModule {...props.homeContentModuleProps} />
        )}
      </Content>

      {/* 3. Footer Modules */}
      {/* <Footer style={{ padding: 0, minHeight: 50 }}>
       </Footer> */}

      {/* 4. Modal Modules */}
    </Layout>
  );
};
