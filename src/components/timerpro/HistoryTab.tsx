"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadTextFile } from "@/lib/qr-export";
import type { HistoryRecord } from "@/types/timerpro-history";

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface HistoryTabProps {
  records: HistoryRecord[];
  onRecordsChange: (updater: (prev: HistoryRecord[]) => HistoryRecord[]) => void;
}

export function HistoryTab({ records, onRecordsChange: setRecords }: HistoryTabProps) {
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const filteredRecords = useMemo(() => {
    let list = records;

    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (r) =>
          r.seatLabel.toLowerCase().includes(term) ||
          r.mode_text.toLowerCase().includes(term) ||
          r.remark.toLowerCase().includes(term) ||
          r.gb_type.toLowerCase().includes(term)
      );
    }

    if (appliedStartDate) {
      list = list.filter((r) => r.start_time.slice(0, 10) >= appliedStartDate);
    }
    if (appliedEndDate) {
      list = list.filter((r) => r.start_time.slice(0, 10) <= appliedEndDate);
    }

    return list;
  }, [records, search, appliedStartDate, appliedEndDate]);

  const stats = useMemo(() => {
    const count = filteredRecords.length;
    const guests = filteredRecords.reduce((sum, r) => sum + (r.guestCount ?? 1), 0);
    const total = filteredRecords.reduce(
      (sum, r) => sum + parseFloat(r.actual_total || "0"),
      0
    );
    const gbTotal = filteredRecords.reduce(
      (sum, r) => sum + parseFloat(r.gb_voucher || "0"),
      0
    );
    return { count, guests, total, gbTotal };
  }, [filteredRecords]);

  const allSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((r) => selectedHistory.includes(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedHistory((prev) =>
        prev.filter((id) => !filteredRecords.some((r) => r.id === id))
      );
    } else {
      setSelectedHistory((prev) => [
        ...prev,
        ...filteredRecords
          .filter((r) => !prev.includes(r.id))
          .map((r) => r.id),
      ]);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedHistory((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    setRecords((prev) => prev.filter((r) => !selectedHistory.includes(r.id)));
    setSelectedHistory([]);
  };

  const handleDeleteRow = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedHistory((prev) => prev.filter((x) => x !== id));
  };

  const handleSearchQuery = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleShowAll = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  const handleExportCsv = () => {
    const headers = [
      "起始时间",
      "结束时间",
      "座位",
      "模式",
      "在场时长",
      "游玩时长",
      "定额/暂离明细",
      "团购类型",
      "团购核销值",
      "账面总金额",
      "订单总价值",
      "结算实收额",
      "备注",
    ];
    const rows = filteredRecords.map((r) => [
      r.start_time,
      r.end_time,
      r.seatLabel,
      r.mode_text,
      r.total_dur_str,
      r.play_dur_str,
      [r.fixed_str, r.pause_dur_str !== "无" ? `暂离:${r.pause_dur_str}` : ""]
        .filter(Boolean)
        .join(" / "),
      r.gb_type,
      r.gb_voucher,
      r.total_price,
      (parseFloat(r.actual_total) + parseFloat(r.gb_voucher || "0")).toFixed(2),
      r.actual_total,
      r.remark,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");
    // Prepend a UTF-8 BOM so Excel on Windows detects the encoding correctly for Chinese text.
    downloadTextFile("﻿" + csv, `历史账单_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="bg-card rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            历史账单明细流水库
          </h2>
          {selectedHistory.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
              批量删除 ({selectedHistory.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="size-3.5" />
            导出CSV
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border w-full md:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-input rounded-lg px-2 py-1 text-sm text-muted-foreground flex-1 min-w-[110px]"
          />
          <span className="text-muted-foreground text-sm">至</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-input rounded-lg px-2 py-1 text-sm text-muted-foreground flex-1 min-w-[110px]"
          />
          <div className="flex gap-1 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
            <Button variant="outline" size="sm" onClick={handleShowAll}>
              显示全部
            </Button>
            <Button size="sm" onClick={handleSearchQuery}>
              检索查询
            </Button>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索座位/团购类型/备注..."
          className="border border-input rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-brand-turquoise focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-muted-foreground text-xs font-medium">
            订单总数 (单)
          </div>
          <div className="text-xl font-bold tabular-nums text-primary mt-1">
            {stats.count}
          </div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-muted-foreground text-xs font-medium">累计客数</div>
          <div className="text-xl font-bold tabular-nums text-foreground mt-1">
            {stats.guests}
          </div>
        </div>
        <div className="bg-brand-turquoise/10 p-3 rounded-lg">
          <div className="text-brand-turquoise text-xs font-medium">
            营业实收 (单据结算额)
          </div>
          <div className="text-xl font-bold tabular-nums text-brand-turquoise mt-1">
            ¥{stats.total.toFixed(2)}
          </div>
        </div>
        <div className="bg-primary/10 p-3 rounded-lg">
          <div className="text-primary text-xs font-medium">
            已核销团购 (抵扣价值)
          </div>
          <div className="text-xl font-bold tabular-nums text-primary mt-1">
            ¥{stats.gbTotal.toFixed(2)}
          </div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg border border-border">
          <div className="text-muted-foreground text-xs font-medium">
            订单总价值 (实收+核销)
          </div>
          <div className="text-xl font-bold tabular-nums text-foreground mt-1">
            ¥{(stats.total + stats.gbTotal).toFixed(2)}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border pb-2">
        <table className="min-w-full divide-y divide-border text-sm whitespace-nowrap">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground min-w-[110px] uppercase text-xs tracking-wide">
                起止时段
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase text-xs tracking-wide">
                座位
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground min-w-[100px] uppercase text-xs tracking-wide">
                模式与时长
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground max-w-[200px] uppercase text-xs tracking-wide">
                定额与暂离明细
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground min-w-[120px] uppercase text-xs tracking-wide">
                团购类型
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground min-w-[90px] uppercase text-xs tracking-wide">
                团购核销值
              </th>
              <th
                className="px-3 py-2 text-right font-medium text-muted-foreground uppercase text-xs tracking-wide"
                title="对应系统原始计价"
              >
                账面总金额
              </th>
              <th className="px-3 py-2 text-right font-medium text-primary uppercase text-xs tracking-wide">
                订单总价值
              </th>
              <th
                className="px-3 py-2 text-right font-medium text-brand-turquoise uppercase text-xs tracking-wide"
                title="当次收款(未核销亦计入)"
              >
                结算实收额
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground max-w-[200px] uppercase text-xs tracking-wide">
                其它详情/备注记录
              </th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground uppercase text-xs tracking-wide">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">
                  未查询到相关记录
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedHistory.includes(record.id)}
                      onChange={() => toggleSelectRow(record.id)}
                    />
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground leading-tight tabular-nums">
                    {record.start_time.substring(5, 16)} ~<br />
                    {record.end_time.substring(5, 16)}
                  </td>
                  <td className="px-3 py-2 font-medium">{record.seatLabel}</td>
                  <td className="px-3 py-2">
                    <div className="text-foreground mb-1 font-medium">
                      {record.mode_text}
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                      在场: {record.total_dur_str}
                    </div>
                    <div className="text-brand-turquoise text-[10px]">
                      游玩: {record.play_dur_str}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] whitespace-normal">
                    {record.fixed_str && (
                      <div className="mb-1 rounded-lg p-1.5 bg-warning/15 text-amber-800">
                        {record.fixed_str}
                      </div>
                    )}
                    {record.pause_dur_str && record.pause_dur_str !== "无" && (
                      <div className="bg-primary/5 p-1.5 text-primary rounded-lg break-words">
                        暂离: {record.pause_dur_str}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[10px] sm:text-xs">
                    {record.gb_type ? (
                      <div className="text-foreground flex items-center gap-1">
                        <Ticket className="size-3" />
                        {record.gb_type}
                      </div>
                    ) : (
                      <div className="text-muted-foreground/50">-</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {record.gb_voucher ? (
                      <span className="text-brand-turquoise font-medium font-mono text-xs">
                        ¥{parseFloat(record.gb_voucher).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground line-through tabular-nums">
                    ¥{record.total_price}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-primary text-[13px] tabular-nums">
                    ¥
                    {(
                      parseFloat(record.actual_total) +
                      parseFloat(record.gb_voucher || "0")
                    ).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-brand-turquoise text-[15px] tabular-nums">
                    ¥{record.actual_total}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground whitespace-pre-wrap break-words max-w-[200px] leading-tight">
                    {record.remark}
                  </td>
                  <td className="px-3 py-2 text-center align-middle">
                    <button
                      onClick={() => handleDeleteRow(record.id)}
                      className="text-xs text-destructive hover:underline px-2 py-1 rounded-lg hover:bg-destructive/10"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
