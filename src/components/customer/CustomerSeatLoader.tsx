"use client";

import dynamic from "next/dynamic";

// Same reasoning as ClientAppLoader: the CloudBase browser SDK pulls in
// Node-only packages during server prerendering, so this page must be
// client-only (ssr:false), which next/dynamic only allows from a Client Component.
const CustomerSeatView = dynamic(
  () => import("@/components/customer/CustomerSeatView").then((m) => m.CustomerSeatView),
  { ssr: false }
);

export function CustomerSeatLoader({ shopUid, seatId }: { shopUid: string; seatId: string }) {
  return <CustomerSeatView shopUid={shopUid} seatId={seatId} />;
}
