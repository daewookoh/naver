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
    .input(z.object({ title: z.string(), content: z.string() }))
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

      const cafeId = "28254417"; // Provided Cafe ID
      const menuId = "283"; // Provided Menu ID
      const apiUrl = `https://openapi.naver.com/v1/cafe/${cafeId}/menu/${menuId}/articles`;

      try {
        // Naver Cafe API typically expects x-www-form-urlencoded for article creation
        const params = new URLSearchParams();
        params.append("subject", input.title); // Naver API uses 'subject' for title
        params.append("content", input.content);

        const response = await axios.post(
          apiUrl,
          params.toString(), // Send the URLSearchParams as a string
          {
            headers: {
              Authorization: `Bearer ${naverAccount.access_token}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );
        return response.data;
      } catch (error) {
        console.error("Failed to create Naver Cafe post:", error);
        if (axios.isAxiosError(error) && error.response) {
          console.error("Naver API Error Response Data:", error.response.data);

          // If token is expired, try to refresh it
          if (error.response.status === 401) {
            throw new Error(
              "Naver OAuth token has expired. Please log in again with Naver.",
            );
          }

          // Provide more specific error message from Naver API if available
          throw new Error(
            `Failed to create Naver Cafe post: ${JSON.stringify(error.response.data)}`,
          );
        }
        throw new Error(
          "Failed to create Naver Cafe post due to an unexpected error.",
        );
      }
    }),
});
