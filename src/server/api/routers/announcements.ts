import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getDepartmentFullName,
  isValidDepartmentKey,
} from "~/utils/departments";

export const announcementsRouter = createTRPCRouter({
  getAnnouncements: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(30),
        search: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        departmentKey: z.string().optional(), // 부서 키 추가
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      // 검색 조건 구성
      const where: any = {};

      console.log("=== ANNOUNCEMENTS API CALL ===");
      console.log("Search parameters:", {
        search: input.search,
        startDate: input.startDate,
        endDate: input.endDate,
        departmentKey: input.departmentKey,
      });
      console.log("Department key validation:", {
        key: input.departmentKey,
        isValid: isValidDepartmentKey(input.departmentKey || ""),
        fullName: input.departmentKey
          ? getDepartmentFullName(input.departmentKey)
          : "N/A",
      });

      if (input.search) {
        // 검색어 정리 (공백 제거, 특수문자 처리)
        const cleanSearch = input.search.trim();

        // 한국어 검색을 위한 다양한 검색 조건
        where.OR = [
          {
            title: {
              contains: cleanSearch,
              mode: "insensitive",
            },
          },
          {
            title: {
              contains: cleanSearch,
            },
          },
          {
            dataContents: {
              contains: cleanSearch,
              mode: "insensitive",
            },
          },
          {
            dataContents: {
              contains: cleanSearch,
            },
          },
        ];
        console.log("Search where clause:", where);
        console.log("Search term:", cleanSearch);
      }

      if (input.startDate && input.endDate) {
        where.regDate = {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        };
      }

      // 부서 키 필터링 추가
      if (input.departmentKey) {
        if (isValidDepartmentKey(input.departmentKey)) {
          where.departmentKey = input.departmentKey;
          console.log("=== DEPARTMENT FILTER APPLIED ===");
          console.log("Department key:", input.departmentKey);
          console.log(
            "Department name:",
            getDepartmentFullName(input.departmentKey),
          );
          console.log("Filter condition:", where.departmentKey);
          console.log("=====================================");
        } else {
          console.warn("Invalid department key:", input.departmentKey);
        }
      } else {
        console.log("=== NO DEPARTMENT FILTER ===");
        console.log("No departmentKey provided, returning all data");
        console.log("=====================================");
      }

      // 최종 where 조건 로깅
      console.log("Final where condition:", JSON.stringify(where, null, 2));

      // 총 개수 조회
      const totalCount = await ctx.db.businessAnnouncement.count({ where });
      console.log("Total count:", totalCount);

      // 데이터 조회
      const announcements = await ctx.db.businessAnnouncement.findMany({
        where,
        orderBy: { regDate: "desc" },
        skip,
        take: input.limit,
      });

      console.log("Found announcements:", announcements.length);
      if (announcements.length > 0) {
        console.log(
          "Sample announcement itemIds:",
          announcements.slice(0, 3).map((a) => a.itemId),
        );
        console.log(
          "Sample announcement titles:",
          announcements.slice(0, 3).map((a) => a.title),
        );
      }

      return {
        success: true,
        data: announcements,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / input.limit),
          hasNextPage: input.page < Math.ceil(totalCount / input.limit),
        },
      };
    }),

  // 데이터베이스에 있는 부서별 데이터 개수 확인
  getDepartmentStats: publicProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db.businessAnnouncement.groupBy({
      by: ["departmentKey"],
      _count: {
        departmentKey: true,
      },
    });

    const departmentStats = stats.map((stat) => ({
      departmentKey: stat.departmentKey,
      count: stat._count.departmentKey,
    }));

    console.log("=== DATABASE STATS ===");
    console.log("Department breakdown:", departmentStats);

    return {
      success: true,
      data: departmentStats,
    };
  }),
});
