"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface RemarkModalProps {
  initialRemark: string;
  onCancel: () => void;
  onSave: (remark: string) => void;
}

export function RemarkModal({ initialRemark, onCancel, onSave }: RemarkModalProps) {
  const [remark, setRemark] = useState(initialRemark);

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotebookPen className="size-4 text-primary" />
            修改备注
          </DialogTitle>
        </DialogHeader>
        <textarea
          rows={5}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-turquoise focus:border-brand-turquoise resize-none text-sm"
          placeholder="输入备注内容..."
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="button" onClick={() => onSave(remark)}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
