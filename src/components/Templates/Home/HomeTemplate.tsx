import { HomeContentModule } from "~/components/Modules/HomeContentModule/HomeContentModule";
import { Layout, Button, DatePicker } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { Content, Header } from "antd/es/layout/layout";
import { NamuNaverLoginButton } from "~/components/Components/NamuNaverLoginButton/NamuNaverLoginButton";
import { useSession } from "next-auth/react";
import { useState } from "react";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  homeContentModuleProps: React.ComponentProps<typeof HomeContentModule>;
  autoPostButton: React.ComponentProps<typeof Button>;
};

export const HomeTemplate = (props: Props) => {
  const { data: session } = useSession();
  const [searchStartDate, setSearchStartDate] = useState<dayjs.Dayjs | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("1421000");
  const [isCollecting, setIsCollecting] = useState(false);
  const queryClient = useQueryClient();

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
        <h1 style={{ color: "white", fontSize: "20px" }}>정부지원 공고수집</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {session && (
            <>
              <DatePicker
                placeholder="수집시작일자"
                value={searchStartDate}
                onChange={(date) => setSearchStartDate(date)}
                disabledDate={(current) => {
                  const thirtyDaysAgo = dayjs().subtract(30, "day");
                  return (
                    (current && current > dayjs().endOf("day")) ||
                    (current && current < thirtyDaysAgo)
                  );
                }}
                style={{ width: 140 }}
              />
              <Button
                type="primary"
                style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
                onClick={async () => {
                  if (searchStartDate) {
                    setIsCollecting(true);
                    const startDate = searchStartDate.format("YYYY-MM-DD");
                    try {
                      const response = await fetch(
                        `/api/govData?startDate=${startDate}&departmentKey=${activeTab}`,
                      );
                      const result = await response.json();
                      if (result.success) {
                        console.log("Data collection completed:", result);
                        // 성공 시 announcements 쿼리 무효화하여 최신 데이터 가져오기
                        queryClient.invalidateQueries({
                          queryKey: ["announcements"],
                        });
                      } else {
                        console.error("Data collection failed:", result.error);
                      }
                    } catch (error) {
                      console.error("Error during data collection:", error);
                    } finally {
                      setIsCollecting(false);
                    }
                  } else {
                    // 기존 autoPostButton 로직 사용
                    props.autoPostButton.onClick?.(undefined as any);
                  }
                }}
                loading={isCollecting || props.autoPostButton.loading}
              >
                {isCollecting || props.autoPostButton.loading
                  ? "수집 중..."
                  : "수집하기"}
              </Button>
            </>
          )}
          <NamuNaverLoginButton />
        </div>
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
        <HomeContentModule
          {...props.homeContentModuleProps}
          searchStartDate={searchStartDate?.format("YYYY-MM-DD")}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefetch={() => {
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
          }}
        />
      </Content>

      {/* 3. Footer Modules */}
      {/* <Footer style={{ padding: 0, minHeight: 50 }}>
       </Footer> */}

      {/* 4. Modal Modules */}
    </Layout>
  );
};
