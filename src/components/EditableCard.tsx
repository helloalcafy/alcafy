"use client";

import { X } from "@phosphor-icons/react/dist/ssr";

export default function EditableCard({
  onClick,
  onDelete,
  className = "",
  children,
}: {
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`editable-card glass-card cursor-pointer overflow-hidden ${className}`} onClick={onClick}>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="card-delete-btn"
          aria-label="Remove"
        >
          <X size={13} weight="bold" />
        </button>
      )}
      {children}
    </div>
  );
}
