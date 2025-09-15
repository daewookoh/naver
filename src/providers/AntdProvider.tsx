"use client";

import { message } from "antd";
import { useServerInsertedHTML } from "next/navigation";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { createContext, useContext, useState, type ReactNode } from "react";

const MessageContext = createContext<any>(null);

const AntdProvider = ({ children }: { children: ReactNode }) => {
  const [cache] = useState(() => createCache());
  const [messageApi, contextHolder] = message.useMessage();

  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`
        }}
      />
    );
  });

  return (
    <StyleProvider cache={cache}>
      <MessageContext.Provider value={messageApi}>
        {contextHolder}
        {children}
      </MessageContext.Provider>
    </StyleProvider>
  );
};

export const useGlobalMessage = () => {
  const messageApi = useContext(MessageContext);
  if (!messageApi) {
    throw new Error("useGlobalMessage must be used within a MessageProvider");
  }
  return messageApi;
};

export default AntdProvider;
