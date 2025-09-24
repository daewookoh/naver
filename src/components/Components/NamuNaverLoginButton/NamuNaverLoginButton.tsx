import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "antd";

export const NamuNaverLoginButton = () => {
  const { data: session } = useSession();

  const handleLogin = () => {
    signIn("naver", {
      callbackUrl: "/",
    });
  };

  const handleLogout = () => {
    signOut({
      callbackUrl: "/",
    });
  };

  if (session) {
    return <Button onClick={handleLogout}>Logout</Button>;
  }
  return <Button onClick={handleLogin}>Login with Naver</Button>;
};
