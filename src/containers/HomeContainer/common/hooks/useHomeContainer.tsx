"use client";

import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { api } from "~/trpc/react";

interface Announcement {
  id: number;
  itemId: string;
  departmentKey: string;
  title: string;
  dataContents?: string;
  applicationStartDate?: string;
  applicationEndDate?: string;
  writerName?: string;
  writerPosition?: string;
  writerPhone?: string;
  writerEmail?: string;
  viewUrl?: string;
  fileNames: string[];
  fileUrls: string[];
  regDate: string;
  createdAt: string;
  updatedAt: string;
}

export const useHomeContainer = (departmentKey?: string) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [isAutoPosting, setIsAutoPosting] = useState(false);

  // 1.2초 debounce 로직
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // tRPC를 사용한 공고 데이터 조회
  const {
    data: tRPCData,
    isLoading: tRPCLoading,
    isError: tRPCError,
    error: tRPCErrorData,
    refetch: tRPCRefetch,
    isFetching: isSearching,
  } = api.announcements.getAnnouncements.useQuery(
    {
      page: 1,
      limit: 30,
      search: debouncedSearchTerm || undefined,
      startDate: dateRange[0]?.format("YYYY-MM-DD"),
      endDate: dateRange[1]?.format("YYYY-MM-DD"),
      departmentKey: departmentKey,
    },
    {
      enabled: !!departmentKey,
      staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
      gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    },
  );

  const announcements = tRPCData?.data || [];
  const totalCount = tRPCData?.pagination?.total || 0;

  const onClear = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDateRange([null, null]);
  }, []);

  const handleAutoPost = useCallback(async () => {
    setIsAutoPosting(true);
    try {
      const response = await fetch("/api/govData");
      const result = await response.json();

      if (result.success) {
        console.log("Data sync completed:", result);
        // 성공 시 알림 또는 상태 업데이트
      } else {
        console.error("Data sync failed:", result.error);
      }
    } catch (error) {
      console.error("Error during data sync:", error);
    } finally {
      setIsAutoPosting(false);
    }
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    announcements,
    isLoading: tRPCLoading,
    isError: tRPCError,
    error: tRPCErrorData,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: () => {},
    refetch: tRPCRefetch,
    totalCount,
    onClear,
    dateRange,
    setDateRange,
    handleAutoPost,
    isAutoPosting,
    isSearching, // 검색 중 상태 추가
  };
};
