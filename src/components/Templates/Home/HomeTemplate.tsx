import { HomeContentModule } from "~/components/Modules/HomeContentModule/HomeContentModule";
import { Layout, Button, DatePicker } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { NamuNaverLoginButton } from "~/components/Components/NamuNaverLoginButton/NamuNaverLoginButton";
import { useSession } from "next-auth/react";
import { useState } from "react";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import { getAllDepartments } from "~/utils/departments";

type Props = {
  homeContentModuleProps: React.ComponentProps<typeof HomeContentModule>;
  autoPostButton: React.ComponentProps<typeof Button>;
};

export const HomeTemplate = (props: Props) => {
  const { data: session } = useSession();
  const [searchStartDate, setSearchStartDate] = useState<dayjs.Dayjs | null>(
    dayjs(), // 오늘 날짜로 기본 설정
  );
  const [activeTab, setActiveTab] = useState("1421000"); // 중소벤처기업부
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectingProgress, setCollectingProgress] = useState("");
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
                    setCollectingProgress("");
                    const startDate = searchStartDate.format("YYYY-MM-DD");

                    try {
                      // 모든 부서에 대해 순차적으로 수집
                      const departments = getAllDepartments();
                      let totalSaved = 0;
                      let processedDates: string[] = [];

                      for (let i = 0; i < departments.length; i++) {
                        const dept = departments[i];
                        if (!dept) continue;

                        setCollectingProgress(
                          `${dept.fullName} 수집 중... (${i + 1}/${departments.length})`,
                        );

                        try {
                          const response = await fetch(
                            `/api/govData?startDate=${startDate}&departmentKey=${dept.key}`,
                          );
                          const result = await response.json();

                          if (result.success) {
                            console.log(`${dept.fullName} 수집 완료:`, result);
                            totalSaved += result.totalSaved || 0;
                            if (result.processedDates) {
                              processedDates = [
                                ...processedDates,
                                ...result.processedDates,
                              ];
                            }
                          } else {
                            console.error(
                              `${dept.fullName} 수집 실패:`,
                              result.error,
                            );
                          }
                        } catch (error) {
                          console.error(
                            `${dept.fullName} 수집 중 오류:`,
                            error,
                          );
                        }
                      }

                      setCollectingProgress(
                        `수집 완료! 총 ${totalSaved}건 저장됨`,
                      );

                      // 성공 시 announcements 쿼리 무효화하여 최신 데이터 가져오기
                      queryClient.invalidateQueries({
                        queryKey: ["announcements"],
                      });

                      // 2초 후 진행 상황 메시지 초기화
                      setTimeout(() => {
                        setCollectingProgress("");
                      }, 2000);
                    } catch (error) {
                      console.error("Error during data collection:", error);
                      setCollectingProgress("수집 중 오류가 발생했습니다.");
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
              {collectingProgress && (
                <div
                  style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    color: "#1890ff",
                    fontWeight: "bold",
                  }}
                >
                  {collectingProgress}
                </div>
              )}
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
          onTabChange={(key) => {
            setActiveTab(key);
            // 탭 변경은 HomeContentModule에서 처리하므로 여기서는 상태만 업데이트
          }}
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
