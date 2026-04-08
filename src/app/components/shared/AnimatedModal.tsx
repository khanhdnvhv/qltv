import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  headerExtra?: ReactNode;
}

export function AnimatedModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-2xl",
  headerExtra,
}: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className={`relative bg-white rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-hidden shadow-2xl flex flex-col`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-[#0d3b66]">{title}</h3>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                  )}
                </div>
                {headerExtra}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#f0f4f8] transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-border flex justify-end gap-2 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple confirm dialog
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Xac nhan",
  confirmColor = "#0d3b66",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-[#f8fafc]">Huy</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: confirmColor }}
          >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </AnimatedModal>
  );
}
