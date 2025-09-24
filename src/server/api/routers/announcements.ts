import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const announcementsRouter = createTRPCRouter({
  getAnnouncements: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(30),
        search: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      // 검색 조건 구성
      const where: any = {};

      console.log("Search parameters:", { 
        search: input.search, 
        startDate: input.startDate, 
        endDate: input.endDate 
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
      if (input.search && announcements.length > 0) {
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
});
