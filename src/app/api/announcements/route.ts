import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {};

    console.log("Search parameters:", { search, startDate, endDate });

    if (search) {
      // 검색어 정리 (공백 제거, 특수문자 처리)
      const cleanSearch = search.trim();

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

    if (startDate && endDate) {
      where.regDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // 총 개수 조회
    const totalCount = await db.businessAnnouncement.count({ where });
    console.log("Total count:", totalCount);

    // 데이터 조회
    const announcements = await db.businessAnnouncement.findMany({
      where,
      orderBy: { regDate: "desc" },
      skip,
      take: limit,
    });

    console.log("Found announcements:", announcements.length);
    if (search && announcements.length > 0) {
      console.log(
        "Sample announcement titles:",
        announcements.slice(0, 3).map((a) => a.title),
      );
    }

    return NextResponse.json({
      success: true,
      data: announcements,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
