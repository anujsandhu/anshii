import { isServerDateLocked } from "@/lib/dateLock";
import ClientHome from "@/components/ClientHome";

// Ensure real server time is evaluated on every request
export const dynamic = "force-dynamic";

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
