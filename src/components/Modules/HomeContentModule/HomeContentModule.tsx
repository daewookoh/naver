"use client";

import { SearchOutlined } from "@ant-design/icons";
import { DatePicker, Empty, Input, Spin, Typography, Tabs } from "antd";
import { useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useHomeContainer } from "~/containers/HomeContainer/common/hooks/useHomeContainer";
import { api } from "~/trpc/react";

type Props = {
  searchStartDate?: string;
  onSearch?: (startDate: string) => void;
  activeTab?: string;
  onTabChange?: (tabKey: string) => void;
  onRefetch?: () => void;
};

export const HomeContentModule = (props: Props) => {
  const [activeTab, setActiveTab] = useState(props.activeTab || "1421000");
  const [postingItems, setPostingItems] = useState<Set<string>>(new Set());
  const { data: session } = useSession();

  const {
    searchTerm,
    setSearchTerm,
    announcements,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    totalCount,
    onClear,
    dateRange,
    setDateRange,
  } = useHomeContainer();

  const autoPostMutation = api.naverPost.autoPost.useMutation();

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight * 1.1;

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  const handleCafeRegistration = async (item: any) => {
    const itemId = String(item.id);

    // 해당 아이템을 posting 상태로 설정
    setPostingItems((prev) => new Set(prev).add(itemId));

    try {
      // 네이버 카페 등록을 위한 데이터 준비
      const title = item.title;
      const content = `
        <div>
          <div>${item.dataContents || item.title}</div>
          <p><strong>원문 링크:</strong> <a href="${item.viewUrl || ""}" target="_blank">${item.viewUrl || ""}</a></p>
        </div>
      `;

      // TRPC autoPost mutation 사용
      const result = await autoPostMutation.mutateAsync({
        title,
        content,
      });

      alert("카페 등록이 완료되었습니다.");
      console.log("카페 등록 성공:", result);
    } catch (error) {
      console.error("카페 등록 오류:", error);

      let errorMessage = "알 수 없는 오류";
      if (error instanceof Error) {
        if (error.message.includes("Naver OAuth token has expired")) {
          errorMessage = "네이버 로그인이 만료되었습니다. 다시 로그인해주세요.";
        } else if (
          error.message.includes("No Naver OAuth access token found")
        ) {
          errorMessage = "네이버 로그인이 필요합니다. 로그인해주세요.";
        } else {
          errorMessage = error.message;
        }
      }

      alert("카페 등록에 실패했습니다: " + errorMessage);
    } finally {
      // 해당 아이템을 posting 상태에서 제거
      setPostingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // refetch 함수를 부모 컴포넌트로 전달
  useEffect(() => {
    if (props.onRefetch) {
      props.onRefetch();
    }
  }, [refetch, props.onRefetch]);

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center text-red-500">
          <h3 className="mb-2 text-lg font-semibold">
            데이터를 불러오는 중 오류가 발생했습니다.
          </h3>
          <p className="mb-4">
            {error?.message || "알 수 없는 오류가 발생했습니다."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !announcements.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" tip="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] p-4">
      {/* <Title level={2} className="mb-6">
        정부 사업 공고
      </Title> */}

      {/* 탭 영역 */}
      <div className="mb-6">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            props.onTabChange?.(key);
          }}
          items={[
            {
              key: "1421000",
              label: "중소벤처기업부",
            },
          ]}
          className="w-full"
        />
      </div>

      {/* 검색 바 */}
      <div className="mb-6 rounded-lg bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="text-sm whitespace-nowrap text-gray-600">
            전체: <b>{totalCount}</b>건
          </div>
          <Input
            placeholder="공고명을 검색하세요"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onPressEnter={() => refetch()}
            allowClear
            onClear={() => {
              onClear();
            }}
            className="flex-1"
          />
          <DatePicker
            picker="month"
            placeholder="신청시작일"
            value={dateRange[0]}
            onChange={(date) => setDateRange([date, date])}
            format="YYYY-MM"
            className="w-40"
          />
        </div>
      </div>

      {/* 공고 목록 */}
      <div
        className="mt-6 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 220px)" }}
        onScroll={handleScroll}
      >
        {announcements.length === 0 && !isLoading ? (
          <Empty
            description="검색 결과가 없습니다."
            className="flex flex-col items-center justify-center py-12"
          />
        ) : (
          <div className="relative">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-2">번호</th>
                  <th className="p-2">제목</th>
                  <th className="p-2">첨부파일</th>
                  <th className="p-2">등록일</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-2 text-center">{totalCount - idx}</td>
                    <td className="h-[100px] p-2">
                      <div className="text-lg font-semibold">{item.title}</div>
                      <div className="mt-1 text-[16px] text-gray-500">
                        담당부서: {item.writerPosition || "-"} | 공고번호:{" "}
                        {item.itemId || "-"} | 신청기간:{" "}
                        {item.applicationStartDate
                          ? item.applicationStartDate.slice(0, 10)
                          : ""}{" "}
                        ~{" "}
                        {item.applicationEndDate
                          ? item.applicationEndDate.slice(0, 10)
                          : ""}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      {item.fileUrls?.length > 0 ? (
                        <a
                          href={item.fileUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span role="img" aria-label="첨부">
                            📎
                          </span>
                        </a>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <div className="mb-2">
                        {item.regDate?.slice(0, 10) || "-"}
                      </div>
                      {session ? (
                        <button
                          onClick={() => handleCafeRegistration(item)}
                          disabled={postingItems.has(String(item.id))}
                          className="rounded bg-green-500 px-3 py-1 text-xs text-white shadow-sm transition-colors hover:bg-green-600 disabled:opacity-50"
                          style={{
                            backgroundColor: "#52c41a",
                            borderColor: "#52c41a",
                            minWidth: "60px",
                          }}
                        >
                          {postingItems.has(String(item.id))
                            ? "등록중..."
                            : "카페등록"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">
                          로그인 필요
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isFetchingNextPage && (
          <div className="mt-6 flex justify-center">
            <Spin tip="로딩 중..." />
          </div>
        )}

        {!hasNextPage && announcements.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            모든 공고를 불러왔습니다.
          </div>
        )}
      </div>
    </div>
  );
};
