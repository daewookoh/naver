"use client";

import { useState, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

interface Announcement {
  id: number;
  itemId: string;
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

interface ApiResponse {
  success: boolean;
  data: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export const useHomeContainer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [isAutoPosting, setIsAutoPosting] = useState(false);

  const fetchAnnouncements = async ({
    pageParam = 1,
  }): Promise<ApiResponse> => {
    // TRPC는 직접 호출이 아닌 useQuery를 사용해야 함
    // 임시로 기존 API 호출 방식으로 되돌림
    const params = new URLSearchParams({
      page: pageParam.toString(),
      limit: "30",
    });

    if (searchTerm) {
      const cleanSearchTerm = searchTerm.trim();
      if (cleanSearchTerm) {
        params.append("search", cleanSearchTerm);
        console.log("Search term:", cleanSearchTerm);
      }
    }

    if (dateRange[0] && dateRange[1]) {
      params.append("startDate", dateRange[0].format("YYYY-MM-DD"));
      params.append("endDate", dateRange[1].format("YYYY-MM-DD"));
    }

    const url = `/api/announcements?${params.toString()}`;
    console.log("Fetching URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch announcements");
    }
    const result = await response.json();
    console.log("API Response:", result);
    return result;
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["announcements", searchTerm, dateRange],
    queryFn: fetchAnnouncements,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  const announcements = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.pagination?.total || 0;

  const onClear = useCallback(() => {
    setSearchTerm("");
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
    handleAutoPost,
    isAutoPosting,
  };
};
