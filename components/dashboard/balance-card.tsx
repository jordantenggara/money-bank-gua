type BalanceCardProps = {
  balance: number;
  hidden: boolean;
  onToggleHide: () => void;
};

export function BalanceCard({ balance, hidden, onToggleHide }: BalanceCardProps) {
  const formattedBalance = hidden
    ? "Rp ••••••••"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(balance);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm relative">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Current Balance</h2>
        <button
          type="button"
          onClick={onToggleHide}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title={hidden ? "Show balance" : "Hide balance"}
        >
          {hidden ? "👁️ Show" : "👁️‍🗨️ Hide"}
        </button>
      </div>
      <p className={`mt-2 text-3xl font-bold ${balance >= 0 ? "text-zinc-900 dark:text-zinc-100" : "text-red-600 dark:text-red-400"}`}>
        {formattedBalance}
      </p>
    </div>
  );
}
