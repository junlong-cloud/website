import { ClientAppLoader } from "@/components/timerpro/ClientAppLoader";

// The whole app is a client SPA backed by the CloudBase browser SDK, which
// pulls in Node-only packages (jsonwebtoken/ws/signature-nodejs) that aren't
// installed and aren't meant to run during server prerendering. ClientAppLoader
// loads it with ssr:false, keeping it out of the server bundle entirely.
export default function Page() {
  return <ClientAppLoader />;
}
