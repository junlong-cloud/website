"use client";

import dynamic from "next/dynamic";

// ssr:false must be invoked from a Client Component in the App Router — this
// thin wrapper exists purely so page.tsx (a Server Component) can stay simple.
const ClientApp = dynamic(() => import("@/components/timerpro/ClientApp"), { ssr: false });

export function ClientAppLoader() {
  return <ClientApp />;
}
