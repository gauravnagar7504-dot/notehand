import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<Toast['type'], React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_VISIBLE = 5;
const DEFAULT_DURATION = 3000;
const EXIT_ANIMATION_MS = 300;

/* ------------------------------------------------------------------ */
/*  ToastProvider                                                      */
/* ------------------------------------------------------------------ */

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  /* ---------- helpers ------------------------------------------------ */

  const removeToast = useCallback((id: string) => {
    // 1. mark as exiting (triggers CSS exit animation)
    setExitingIds((prev) => new Set(prev).add(id));

    // 2. after animation completes, remove from state
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, EXIT_ANIMATION_MS);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: Toast['type'] = 'info',
      duration: number = DEFAULT_DURATION,
    ) => {
      const id = Math.random().toString(36).substring(2, 10);

      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => {
        const updated = [...prev, toast];
        // Keep only the newest MAX_VISIBLE toasts
        return updated.slice(-MAX_VISIBLE);
      });

      // Schedule auto-dismiss
      const timer = setTimeout(() => {
        removeToast(id);
        timersRef.current.delete(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  /* ---------- cleanup on unmount ------------------------------------- */

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  /* ---------- manual dismiss ----------------------------------------- */

  const handleDismiss = useCallback(
    (id: string) => {
      // Clear the auto-dismiss timer so it doesn't fire after manual close
      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
      removeToast(id);
    },
    [removeToast],
  );

  /* ---------- render ------------------------------------------------- */

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="toast-container">
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type];
          const isExiting = exitingIds.has(toast.id);

          return (
            <div
              key={toast.id}
              className={`toast-item ${toast.type}${isExiting ? ' exiting' : ''}`}
            >
              <span className="toast-icon">
                <Icon size={18} />
              </span>

              <span className="toast-message">{toast.message}</span>

              <button
                className="toast-close-btn"
                onClick={() => handleDismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/*  useToast hook                                                      */
/* ------------------------------------------------------------------ */

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
};
