"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  canDelete?: boolean;
  deleteTitle?: string;
}

/** Compact edit/delete icon buttons for table rows. */
export const RowActions: React.FC<RowActionsProps> = ({
  onEdit,
  onDelete,
  canDelete = true,
  deleteTitle = "Delete",
}) => {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title={deleteTitle}
        disabled={!canDelete}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
