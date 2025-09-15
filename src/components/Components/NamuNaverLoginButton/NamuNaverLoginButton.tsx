import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "antd";

export const NamuNaverLoginButton = () => {
  const { data: session } = useSession();

  if (session) {
    return <Button onClick={() => signOut()}>Logout</Button>;
  }
  return <Button onClick={() => signIn("naver")}>Login with Naver</Button>;
};
