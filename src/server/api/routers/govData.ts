import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  isValidDepartmentKey,
  getDepartmentFullName,
} from "~/utils/departments";

// YYYY-MM-DD 포맷
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addOneDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}

// 외부 API 호출 (startDate, endDate 동일하게)
async function fetchAnnouncements(
  date: string,
  departmentKey: string,
): Promise<any[]> {
  // departmentKey에 따라 API URL 구성
  // 실제 API는 부서별로 다른 엔드포인트가 아닐 수 있음
  // 부서 정보를 파라미터로 전달하는 방식으로 변경
  const apiUrl = `https://apis.data.go.kr/1421000/mssBizService_v2/getbizList_v2?serviceKey=${process.env.NEXT_PUBLIC_DATA_GO_KR_SERVICE_KEY}&pageNo=1&numOfRows=100&startDate=${date}&endDate=${date}&departmentKey=${departmentKey}`;
  console.log("=== API CALL DEBUG ===");
  console.log("Department Key:", departmentKey);
  console.log("API URL:", apiUrl);
  console.log("Date:", date);
  const response = await fetch(apiUrl, {
    headers: {
      Accept: "*/*",
    },
  });
  const responseText = await response.text();
  let parsedData: any;

  // Check if the response is XML
  if (
    responseText.trim().startsWith("<") ||
    response.headers.get("content-type")?.includes("xml")
  ) {
    try {
      // Parse XML response
      const { parseString } = await import("xml2js");
      parsedData = await new Promise((resolve, reject) => {
        parseString(
          responseText,
          { explicitArray: false },
          (err: any, result: any) => {
            if (err) reject(new Error(err));
            else resolve(result);
          },
        );
      });
    } catch (error) {
      console.error("Failed to parse XML response:", error);
      throw new Error("Failed to parse XML response from API");
    }
  } else {
    // Try to parse as JSON
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse API response as JSON:", responseText);
      throw new Error("Invalid JSON response from API");
    }
  }

  // Check if the API returned an error
  if (!response.ok) {
    console.error("API Error:", {
      status: response.status,
      statusText: response.statusText,
      data: parsedData,
    });
    throw new Error(
      `API request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  // Handle empty response
  if (!parsedData?.response?.body?.items?.item) {
    return [];
  }

  // Normalize the response to always return an array
  const responseBody = parsedData.response?.body || {};
  const itemsData = responseBody.items?.item;

  // Ensure we have valid items and filter out any null/undefined
  const items = (
    Array.isArray(itemsData) ? itemsData : itemsData ? [itemsData] : []
  ).filter((item) => item != null);

  console.log("API Response items count:", items.length);
  console.log(
    "Sample items:",
    items.slice(0, 2).map((item) => ({
      itemId: item.itemId,
      title: item.title?.substring(0, 50) + "...",
      departmentKey: departmentKey,
    })),
  );

  return items;
}

// DB upsert (itemId 기준, regDate 포함)
async function upsertAnnouncement(
  item: any,
  regDate: Date,
  departmentKey = "1421000",
  db: any,
) {
  if (!item?.itemId) return null;

  // 주요 필드 추출 (API 응답에 따라 조정)
  const {
    itemId,
    title,
    dataContents,
    applicationStartDate,
    applicationEndDate,
    writerName,
    writerPosition,
    writerPhone,
    writerEmail,
    viewUrl,
    fileNames,
    fileUrls,
    // 다른 가능한 파일 관련 필드명들
    fileName,
    fileUrl,
    fileList,
  } = item;

  // 파일 정보 로깅
  console.log("=== File Info ===");
  console.log("fileName:", fileName);
  console.log("fileUrl:", fileUrl);

  // key_ + API 결과의 id 형태로 itemId 생성
  const formattedItemId = `${departmentKey}_${itemId}`;

  // fileNames와 fileUrls를 string[] 형태로 변환
  // 다양한 필드명에서 파일 정보 추출
  let formattedFileNames: string[] = [];
  let formattedFileUrls: string[] = [];

  // 1. 기본 필드명 확인 (API 응답 구조에 맞게 수정)
  if (fileName && typeof fileName === "string" && fileName.trim()) {
    formattedFileNames = [fileName];
  } else if (fileNames && Array.isArray(fileNames) && fileNames.length > 0) {
    formattedFileNames = fileNames;
  } else if (fileNames && typeof fileNames === "string") {
    formattedFileNames = [fileNames];
  }

  if (fileUrl && typeof fileUrl === "string" && fileUrl.trim()) {
    formattedFileUrls = [fileUrl];
  } else if (fileUrls && Array.isArray(fileUrls) && fileUrls.length > 0) {
    formattedFileUrls = fileUrls;
  } else if (fileUrls && typeof fileUrls === "string") {
    formattedFileUrls = [fileUrls];
  }

  // 2. 추가적인 파일 정보가 있는 경우 처리 (다중 파일 지원)
  if (fileList && Array.isArray(fileList) && fileList.length > 0) {
    const additionalNames = fileList
      .map((f) => f.name || f.fileName || f)
      .filter(Boolean);
    const additionalUrls = fileList
      .map((f) => f.url || f.fileUrl || f)
      .filter(Boolean);
    formattedFileNames = [...formattedFileNames, ...additionalNames];
    formattedFileUrls = [...formattedFileUrls, ...additionalUrls];
  }

  console.log("Formatted fileNames:", formattedFileNames);
  console.log("Formatted fileUrls:", formattedFileUrls);

  try {
    return await db.businessAnnouncement.upsert({
      where: { itemId: formattedItemId },
      update: {
        itemId: formattedItemId,
        departmentKey,
        title,
        dataContents,
        applicationStartDate,
        applicationEndDate,
        writerName,
        writerPosition,
        writerPhone,
        writerEmail,
        viewUrl,
        fileNames: formattedFileNames,
        fileUrls: formattedFileUrls,
        regDate,
        updatedAt: new Date(),
      },
      create: {
        itemId: formattedItemId,
        departmentKey,
        title,
        dataContents,
        applicationStartDate,
        applicationEndDate,
        writerName,
        writerPosition,
        writerPhone,
        writerEmail,
        viewUrl,
        fileNames: formattedFileNames,
        fileUrls: formattedFileUrls,
        regDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (e) {
    console.error("Upsert error", formattedItemId, e);
    return null;
  }
}

export const govDataRouter = createTRPCRouter({
  syncData: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        departmentKey: z.string().default("1421000"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 부서 키 유효성 검증
      if (!isValidDepartmentKey(input.departmentKey)) {
        throw new Error(`Invalid department key: ${input.departmentKey}`);
      }

      console.log(
        `Starting data sync for ${getDepartmentFullName(input.departmentKey)} (${input.departmentKey})`,
      );

      let currentDate: Date;
      let endDate: Date;

      if (input.startDate) {
        // 특정 시작일부터 오늘까지
        currentDate = new Date(input.startDate);
        endDate = new Date();
      } else {
        // 기존 로직: 최신 regDate 조회 후 오늘까지
        const latest = await ctx.db.businessAnnouncement.findFirst({
          orderBy: { regDate: "desc" },
          select: { regDate: true },
        });
        currentDate = latest?.regDate
          ? new Date(latest.regDate)
          : new Date(new Date().getFullYear(), 3, 1);
        endDate = new Date();
      }

      let totalSaved = 0;
      const processedDates: string[] = [];

      // 시작일부터 종료일까지 반복
      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        try {
          // API 호출 - departmentKey 전달
          const items = await fetchAnnouncements(dateStr, input.departmentKey);
          // DB 저장 (upsert) - 선택된 부서 key 사용
          const results = await Promise.all(
            items.map((item) =>
              upsertAnnouncement(
                item,
                currentDate,
                input.departmentKey,
                ctx.db,
              ),
            ),
          );
          const savedCount = results.filter(Boolean).length;
          totalSaved += savedCount;
          processedDates.push(dateStr);
          console.log(`${dateStr}: ${savedCount} saved`);
        } catch (e) {
          console.error(`Error on ${dateStr}:`, e);
        }
        currentDate = addOneDay(currentDate);
      }

      return {
        success: true,
        message: "Data sync completed",
        totalSaved,
        processedDates,
        dateRange: {
          start: processedDates[0] || null,
          end: processedDates[processedDates.length - 1] || null,
        },
      };
    }),
});
