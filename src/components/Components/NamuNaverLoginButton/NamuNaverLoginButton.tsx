import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "antd";
import NamuSvg from "~/components/Components/NamuSvg/NamuSvg";

export const NamuNaverLoginButton = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button onClick={() => signOut()}>
        Logout
      </Button>
    );
  }
  return (
    <Button
      icon={<NamuSvg iconName="naver" />}
      onClick={() => signIn("naver")}
    >
      Login with Naver
    </Button>
  );
};
