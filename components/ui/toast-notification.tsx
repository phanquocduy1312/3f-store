import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "warning" | "error";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />,
  error: <XCircle className="h-5 w-5 shrink-0 text-red-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50",
  warning: "border-amber-200 bg-amber-50",
  error: "border-red-200 bg-red-50",
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg: string) => addToast("success", msg),
    warning: (msg: string) => addToast("warning", msg),
    error: (msg: string) => addToast("error", msg),
  };

  return { toasts, toast, removeToast };
}

function SingleToast({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(item.id), 300);
    }, 4500);
    return () => clearTimeout(timer);
  }, [item.id, onRemove]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg transition-all duration-300",
        bgColors[item.type],
        visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0",
      )}
    >
      {icons[item.type]}
      <p className="flex-1 text-[14px] font-semibold text-[#0B1F3A]">{item.message}</p>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(item.id), 300);
        }}
        className="shrink-0 rounded-lg p-1 text-[#64748B] transition hover:bg-white/60"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((item) => (
        <SingleToast key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}
