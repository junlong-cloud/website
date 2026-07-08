"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CustomerCode } from "@/types/timerpro-settings";
import {
  downloadDataUrl,
  downloadTextFile,
  generateQrDataUrl,
  generateQrSheetDataUrl,
} from "@/lib/qr-export";

type Mode = "range" | "custom";

interface CustomerCodeModalProps {
  customerUniversalUrl: string;
  customerCodes: CustomerCode[];
  onCustomerCodesChange: (codes: CustomerCode[]) => void;
  onClose: () => void;
}

export function CustomerCodeModal({
  customerUniversalUrl,
  customerCodes,
  onCustomerCodesChange,
  onClose,
}: CustomerCodeModalProps) {
  const [mode, setMode] = useState<Mode>("range");
  const [prefix, setPrefix] = useState("");
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(10);
  const [customText, setCustomText] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const buildUrl = (label: string) => `https://timerpro.top/c/${label}`;

  const appendCodes = (labels: string[]) => {
    const existingLabels = new Set(customerCodes.map((c) => c.label));
    const newCodes: CustomerCode[] = [];
    labels.forEach((label) => {
      const trimmed = label.trim();
      if (!trimmed || existingLabels.has(trimmed)) return;
      existingLabels.add(trimmed);
      newCodes.push({
        code_id: crypto.randomUUID(),
        label: trimmed,
        url: buildUrl(trimmed),
      });
    });
    if (newCodes.length > 0) {
      onCustomerCodesChange([...customerCodes, ...newCodes]);
    }
  };

  const handleGenerate = () => {
    if (mode === "range") {
      const start = Math.max(1, Math.floor(rangeStart));
      const end = Math.max(start, Math.floor(rangeEnd));
      const labels: string[] = [];
      for (let n = start; n <= end; n++) {
        labels.push(`${prefix}${n}`);
      }
      appendCodes(labels);
    } else {
      const labels = customText
        .split(/[\n,，\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      appendCodes(labels);
    }
  };

  const buildNfcText = () => {
    const lines = [
      "# 通用入口",
      customerUniversalUrl || buildUrl("universal"),
      "",
      "# 号牌",
      ...customerCodes.map((c) => `${c.label}: ${c.url}`),
    ];
    return lines.join("\n");
  };

  const handleDownloadQr = async () => {
    if (customerCodes.length === 0) {
      alert("暂无号牌，请先生成号牌");
      return;
    }
    setIsExporting(true);
    try {
      const dataUrl = await generateQrSheetDataUrl(
        customerCodes.map((c) => ({ label: c.label, url: c.url }))
      );
      downloadDataUrl(dataUrl, `号牌二维码_${customerCodes.length}个.png`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadNfc = () => {
    if (customerCodes.length === 0) {
      alert("暂无号牌，请先生成号牌");
      return;
    }
    downloadTextFile(buildNfcText(), "号牌NFC写入清单.txt");
  };

  const handleDownloadAll = async () => {
    if (customerCodes.length === 0) {
      alert("暂无号牌，请先生成号牌");
      return;
    }
    setIsExporting(true);
    try {
      const dataUrl = await generateQrSheetDataUrl(
        customerCodes.map((c) => ({ label: c.label, url: c.url }))
      );
      downloadDataUrl(dataUrl, `号牌二维码_${customerCodes.length}个.png`);
      downloadTextFile(buildNfcText(), "号牌NFC写入清单.txt");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadUniversalQr = async () => {
    const url = customerUniversalUrl || buildUrl("universal");
    const dataUrl = await generateQrDataUrl(url);
    downloadDataUrl(dataUrl, "通用入口二维码.png");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-4 text-primary" />
            顾客号牌码管理
          </DialogTitle>
          <DialogDescription>生成可复用号牌，导出二维码和 NFC 链接清单。</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <div className="font-bold text-primary">本店通用入口二维码内容</div>
            <button
              type="button"
              onClick={handleDownloadUniversalQr}
              className="text-primary hover:text-primary/80 font-medium underline text-xs whitespace-nowrap"
            >
              下载此二维码
            </button>
          </div>
          <div className="text-primary/90 break-all">
            {customerUniversalUrl || "刷新后显示"}
          </div>
        </div>

        <div className="flex gap-2 text-sm">
          <button
            className={`px-3 py-1.5 rounded-lg transition ${
              mode === "range" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setMode("range")}
          >
            连续编号
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg transition ${
              mode === "custom" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setMode("custom")}
          >
            自定义号牌
          </button>
        </div>

        {mode === "range" && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">前缀</label>
              <input
                className="w-full border border-input rounded-lg px-2 py-1"
                placeholder="可空"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">起始</label>
              <input
                type="number"
                min="1"
                className="w-full border border-input rounded-lg px-2 py-1 tabular-nums"
                value={rangeStart}
                onChange={(e) => setRangeStart(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">结束</label>
              <input
                type="number"
                min="1"
                className="w-full border border-input rounded-lg px-2 py-1 tabular-nums"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {mode === "custom" && (
          <div className="text-sm">
            <label className="block text-xs text-muted-foreground mb-1">
              自定义号牌，一行一个，或用逗号/空格分隔
            </label>
            <textarea
              rows={5}
              className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-turquoise focus:outline-none"
              placeholder={"A01\nA02\n小熊\nVIP-1"}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" onClick={handleGenerate}>
            生成/补齐号牌
          </Button>
          <Button type="button" variant="turquoise" onClick={handleDownloadQr} disabled={isExporting}>
            {isExporting ? "生成中..." : "下载号牌二维码"}
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadNfc}>
            下载号牌NFC文件
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadAll} disabled={isExporting}>
            {isExporting ? "生成中..." : "下载全部物料包"}
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
          二维码导出时会询问是否在底部附带号牌标识；NFC 文件会按通用入口/每个号牌分别生成{" "}
          <span className="font-mono">.txt</span>，写入时使用文件内 URL。
        </div>

        {customerCodes.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 border-b border-border text-sm font-semibold text-foreground">
              已有号牌 {customerCodes.length} 个
            </div>
            <div className="max-h-72 overflow-y-auto">
              {customerCodes.map((code) => (
                <div
                  key={code.code_id}
                  className="px-3 py-2 border-b border-border last:border-b-0 text-xs"
                >
                  <div className="font-bold text-foreground">{code.label}</div>
                  <div className="text-muted-foreground break-all">{code.url}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground border border-border rounded-lg">
            暂无号牌，先生成一批或输入自定义号牌。
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
