"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/** Gates children behind CloudBase phone-code login; renders a login form until signed in. */
export function LoginGate({ children }: { children: React.ReactNode }) {
  const {
    user,
    authChecked,
    sendCode,
    verifyCode,
    sending,
    verifying,
    sendError,
    verifyError,
    hasSentCode,
  } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  const normalizedPhone = phone.trim().startsWith("+") ? phone.trim() : `+86${phone.trim()}`;

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    await sendCode(normalizedPhone);
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await verifyCode(code.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-foreground mb-1">
          PixTime <span className="font-normal opacity-70">像素时光</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-6">手机号验证码登录</p>

        {!hasSentCode ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">手机号</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="13800138000"
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  autoFocus
                />
              </div>
            </div>
            {sendError && <p className="text-sm text-destructive">{sendError}</p>}
            <Button type="submit" className="w-full" disabled={sending || !phone.trim()}>
              {sending ? <Loader2 className="size-4 animate-spin" /> : "获取验证码"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              验证码已发送至 <span className="font-medium text-foreground">{normalizedPhone}</span>
            </p>
            <div>
              <label className="text-sm font-medium block mb-1.5">验证码</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6位验证码"
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  autoFocus
                />
              </div>
            </div>
            {verifyError && <p className="text-sm text-destructive">{verifyError}</p>}
            <Button type="submit" className="w-full" disabled={verifying || !code.trim()}>
              {verifying ? <Loader2 className="size-4 animate-spin" /> : "登录"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
