import { useEffect, useState } from 'react';
import { Award, Sparkles, X } from 'lucide-react';
import type { AppLanguage } from '../types/darija';
import type { AppToast } from '../utils/notifications';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface ToastContainerProps {
  language: AppLanguage;
  toasts: AppToast[];
  onDismiss: (id: string) => void;
  onAction: (toast: AppToast) => void;
}

const AUTO_DISMISS_MS = 6500;

interface ToastCardProps {
  toast: AppToast;
  dismissAria: string;
  onDismiss: (id: string) => void;
  onAction: (toast: AppToast) => void;
}

function ToastCard({
  toast,
  dismissAria,
  onDismiss,
  onAction,
}: ToastCardProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      onDismiss(toast.id);
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [paused, toast.id, onDismiss]);

  const isGoal = toast.kind === 'daily-goal' || toast.kind === 'daily-challenge';

  return (
    <div
      role="status"
      data-testid={`toast-${toast.kind}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="pointer-events-auto animate-toast-enter bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-4 shadow-lg flex items-start gap-3"
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isGoal
            ? 'bg-amber-50 dark:bg-amber-950/60 text-[#C68335] dark:text-amber-400'
            : 'bg-[#E5EBD6] dark:bg-[#273322] text-[#8C2F18] dark:text-[#E8A184]'
        }`}
        aria-hidden="true"
      >
        {isGoal ? (
          <Sparkles className="w-4 h-4" />
        ) : (
          <Award className="w-4 h-4" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-bold text-[#23201C] dark:text-slate-100 leading-snug">
          {toast.title}
        </p>
        <p className="text-xs text-[#686259] dark:text-slate-300 leading-relaxed">
          {toast.description}
        </p>
        {toast.actionLabel && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onAction(toast)}
              className="text-xs font-semibold text-[#8C2F18] dark:text-[#E8A184] hover:underline underline-offset-4 cursor-pointer"
            >
              {toast.actionLabel}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label={dismissAria}
        className="text-slate-400 dark:text-slate-500 hover:text-[#0F2D3A] dark:hover:text-slate-100 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastContainer({
  language,
  toasts,
  onDismiss,
  onAction,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const notifT = UI_TRANSLATIONS[language].notifications;

  return (
    <aside
      aria-label={notifT.regionAria}
      aria-live="polite"
      className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-3 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          dismissAria={notifT.dismissAria}
          onDismiss={onDismiss}
          onAction={onAction}
        />
      ))}
    </aside>
  );
}
