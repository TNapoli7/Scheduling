"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm" />
      <div
        className={`relative bg-white shadow-2xl w-full ${sizeStyles[size]} max-h-[92vh] overflow-hidden flex flex-col border-t border-stone-200/70 sm:border sm:border-stone-200/50 rounded-t-2xl sm:rounded-2xl`}
        style={{ animation: "modalIn 0.15s ease-out" }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.97) translateY(4px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-stone-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-stone-400 hover:text-stone-600 transition-colors rounded-lg hover:bg-stone-100 p-2 -m-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto" style={{maxHeight: 'calc(100vh - 200px)'}}>
          {children}
        </div>
      </div>
    </div>
  );
}
