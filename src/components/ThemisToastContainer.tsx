import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface ThemisToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ThemisToastContainer: React.FC<ThemisToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-3">
      {toasts.map((toast) => {
        const type = toast.type || 'info';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-neutral-800 dark:text-neutral-100 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {type === 'success' && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {type === 'info' && (
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
              )}
              {type === 'warning' && (
                <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {type === 'error' && (
                <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="font-semibold text-neutral-900 dark:text-white text-[12.5px] truncate">
                {toast.title}
              </div>
              {toast.description && (
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {toast.description}
                </div>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 w-5 h-5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
