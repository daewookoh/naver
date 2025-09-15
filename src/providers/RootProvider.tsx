"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Provider as JotaiProvider } from "jotai";
import { TRPCReactProvider } from "~/trpc/react";
import AntdProvider from "~/providers/AntdProvider";

const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AntdProvider>
      <JotaiProvider>
        <TRPCReactProvider>
          <SessionProvider>{children}</SessionProvider>
        </TRPCReactProvider>
      </JotaiProvider>
    </AntdProvider>
  );
};

export default RootProvider;
