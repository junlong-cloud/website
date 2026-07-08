"use client";

import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/cloudbase";

export interface CloudUser {
  uid: string;
  phone?: string;
}

interface OtpSession {
  verifyOtp: (params: { token: string }) => Promise<{ data?: unknown; error?: { message: string } }>;
}

/** `auth.currentUser` (a synchronous getter) is the reliable source of truth for
 * who's signed in — verifyOtp/getSession's own resolved payloads don't reliably
 * expose `uid` the way their type signatures suggest. */
function currentCloudUser(): CloudUser | null {
  const u = auth.currentUser as { uid?: string; phone_number?: string } | null;
  return u?.uid ? { uid: u.uid, phone: u.phone_number } : null;
}

/**
 * Phone-code (OTP) login backed by CloudBase auth. `sendCode` requests the SMS
 * code; `verifyCode` completes sign-in with the code the user typed in.
 */
export function useAuth() {
  const [user, setUser] = useState<CloudUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [otpSession, setOtpSession] = useState<OtpSession | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // getSession() restores any persisted session into auth.currentUser; we only
    // read the result from currentUser afterward, not from getSession()'s own payload.
    auth
      .getSession()
      .catch(() => null)
      .finally(() => {
        if (cancelled) return;
        setUser(currentCloudUser());
        setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sendCode = useCallback(async (phone: string) => {
    setSendError(null);
    setSending(true);
    try {
      const { data, error } = await auth.signInWithOtp({ phone });
      if (error) {
        setSendError(error.message);
        return false;
      }
      setOtpSession(data as OtpSession);
      return true;
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "验证码发送失败");
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  const verifyCode = useCallback(
    async (code: string) => {
      if (!otpSession) {
        setVerifyError("请先获取验证码");
        return false;
      }
      setVerifyError(null);
      setVerifying(true);
      try {
        const { error } = await otpSession.verifyOtp({ token: code });
        const found = currentCloudUser();
        if (found) {
          setUser(found);
          setOtpSession(null);
          return true;
        }
        setVerifyError(error?.message ?? "登录失败，请重试");
        return false;
      } catch (err) {
        setVerifyError(err instanceof Error ? err.message : "验证码校验失败");
        return false;
      } finally {
        setVerifying(false);
      }
    },
    [otpSession]
  );

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setOtpSession(null);
  }, []);

  return {
    user,
    authChecked,
    sendCode,
    verifyCode,
    signOut,
    sending,
    verifying,
    sendError,
    verifyError,
    hasSentCode: otpSession !== null,
  };
}
