import type { Metadata } from "next";
import { isServerDateLocked } from "@/lib/dateLock";
import ClientHome from "@/components/ClientHome";

// Ensure real server time is evaluated on every request
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const isLocked = isServerDateLocked();
  if (isLocked) {
    return {
      title: "Not yet. 👀",
      description: "Something is waiting... Come back on 28 October.",
      openGraph: {
        title: "Not yet. 👀",
        description: "You found the door a little early. Come back on 28 October.",
      },
    };
  }

  return {
    title: "Happy 19th Birthday, Anshika ✨ | Made with ❤️ by Anuj",
    description:
      "A cute, handmade digital birthday scrapbook & interactive card for Anshika's 19th birthday.",
  };
}

export default function Home() {
  const isLocked = isServerDateLocked();
  const serverTime = Date.now();

  return (
    <ClientHome
      initialIsLocked={isLocked}
      initialServerTime={serverTime}
    />
  );
}
