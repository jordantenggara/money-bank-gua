"use client";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
};

export function Toast({ message, type = "info", onClose }: ToastProps) {
  if (!message) return null;

  const bgColors = {
    success: "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
    error: "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800",
    info: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-md border p-3 text-sm shadow-sm ${bgColors[type]}`}
      role="status"
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-3 font-bold hover:opacity-75 focus-visible:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
      )}
    </div>
  );
}
