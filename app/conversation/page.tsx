import { redirect } from "next/navigation";
import { isServerDateLocked } from "@/lib/dateLock";

export default function ConversationPage() {
  if (isServerDateLocked()) {
    redirect("/");
  }
  redirect("/conversation/index.html");
}
