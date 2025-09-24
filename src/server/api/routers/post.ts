import { z } from "zod";
import axios from "axios";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  autoPost: protectedProcedure
    .input(
      z.object({ title: z.string(), content: z.string(), viewUrl: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the user's Naver OAuth account
      const naverAccount = await ctx.db.account.findFirst({
        where: {
          userId: ctx.session.user.id,
          provider: "naver",
        },
      });

      if (!naverAccount?.access_token) {
        throw new Error(
          "No Naver OAuth access token found. Please log in with Naver first.",
        );
      }

      // 토큰 만료 시간 확인
      if (
        naverAccount.expires_at &&
        naverAccount.expires_at < Date.now() / 1000
      ) {
        throw new Error(
          "Naver OAuth token has expired. Please log in again with Naver.",
        );
      }

      const cafeId = "28254417"; // Provided Cafe ID
      const menuId = "283"; // Provided Menu ID
      const apiUrl = `https://openapi.naver.com/v1/cafe/${cafeId}/menu/${menuId}/articles`;

      try {
        // 네이버 API에 원본 한글 데이터를 그대로 전송
        // URL 인코딩하지 않고 원본 텍스트를 사용
        console.log("Naver API Request Data:", {
          url: apiUrl,
          title: input.title,
          content: input.content.substring(0, 100) + "...",
          token: naverAccount.access_token ? "Present" : "Missing",
        });

        //   const content = `
        //   <div>
        //     <div>${encodeURIComponent(input.content)}</div>
        //     ${input.viewUrl ? `<p><strong>${encodeURIComponent("원문 링크")}:</strong> <a href="${input.viewUrl}" target="_blank">${input.viewUrl}</a></p>` : ""}
        //   </div>
        // `;

        const params = new URLSearchParams();
        params.append("subject", encodeURIComponent(input.title)); // 원본 제목 그대로
        params.append("content", input.viewUrl); // 원본 내용 그대로

        const response = await axios.post(apiUrl, params.toString(), {
          headers: {
            Authorization: `Bearer ${naverAccount.access_token}`,
          },
        });

        return response.data;
      } catch (error) {
        console.error("Failed to create Naver Cafe post:", error);

        if (axios.isAxiosError(error) && error.response) {
          console.error("Naver API Error Response Data:", error.response.data);
          console.error("Naver API Error Status:", error.response.status);
          console.error("Naver API Error Headers:", error.response.headers);

          // 다양한 HTTP 상태 코드에 대한 처리
          switch (error.response.status) {
            case 401:
              throw new Error(
                "Naver OAuth token has expired or is invalid. Please log in again with Naver.",
              );
            case 403:
              throw new Error(
                "Access denied. Please check if you have permission to post in this cafe.",
              );
            case 404:
              throw new Error(
                "Cafe or menu not found. Please check the cafe ID and menu ID.",
              );
            case 500:
              throw new Error(
                "Naver server error. The service may be temporarily unavailable. Please try again later.",
              );
            default:
              // 네이버 API의 구체적인 오류 메시지가 있는 경우 사용
              const errorData = error.response.data;
              if (errorData?.message?.error?.msg) {
                throw new Error(
                  `Naver API Error: ${errorData.message.error.msg}`,
                );
              }
              throw new Error(
                `Failed to create Naver Cafe post: ${JSON.stringify(errorData)}`,
              );
          }
        }

        throw new Error(
          "Failed to create Naver Cafe post due to an unexpected error.",
        );
      }
    }),
});
