"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Reusable delete-confirmation dialog. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Delete entry?",
  message,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog isOpen={open} onClose={onCancel} title={title} description="This action cannot be undone.">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
