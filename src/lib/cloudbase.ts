import cloudbase from "@cloudbase/js-sdk";

const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;

/**
 * Singleton CloudBase app/auth/db. Only ever initialized client-side (this file
 * is only imported from "use client" hooks/components) so `window` is always present.
 * region must be ap-shanghai for phone-code (OTP) login to work.
 *
 * `cloudbase.init()` rejects an empty env string synchronously, which would crash
 * the whole app before NEXT_PUBLIC_CLOUDBASE_ENV_ID is ever set. Falling back to a
 * placeholder keeps init from throwing; any real API call (getSession/signInWithOtp/
 * db reads) will fail instead, which useAuth/useCloudDocState already handle.
 */
const app = cloudbase.init({ env: ENV_ID || "not-configured", region: "ap-shanghai" });
const auth = app.auth();
const db = app.database();

export { app, auth, db, ENV_ID };
