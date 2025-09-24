import { redirect } from "next/navigation";

export default function RootPage() {
  // 루트 페이지에서 /home으로 리다이렉트
  redirect("/home");
}
