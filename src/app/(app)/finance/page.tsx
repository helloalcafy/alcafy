import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import ProgressRing from "@/components/ProgressRing";
import FinanceTrendChart from "@/components/FinanceTrendChart";
import FinanceLineItems from "@/components/FinanceLineItems";

export default async function FinancePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: entries } = await supabase.from("finance_entries").select("*").eq("user_id", user?.id);

  const hasData = !!entries?.length;

  const income = hasData ? entries!.filter((e) => e.kind === "income").reduce((s, e) => s + Number(e.amount), 0) : 42000;
  const expenses = hasData ? entries!.filter((e) => e.kind === "expense").reduce((s, e) => s + Number(e.amount), 0) : 27500;
  const savingsEntry = entries?.find((e) => e.kind === "saving");
  const savingsPct = savingsEntry?.target_amount ? Math.round((Number(savingsEntry.amount) / Number(savingsEntry.target_amount)) * 100) : 48;
  const budgetUsedPct = income > 0 ? Math.round((expenses / income) * 100) : 65;

  const lineItems = hasData
    ? entries!.filter((e) => ["saving", "debt", "tuition", "bill"].includes(e.kind))
    : [
        { id: "d1", kind: "saving", label: "Emergency fund", amount: 14500, target_amount: 30000 },
        { id: "d2", kind: "debt", label: "Credit card", amount: 8200, target_amount: null },
        { id: "d3", kind: "tuition", label: "Tuition, Term 2", amount: 12000, target_amount: 25000 },
        { id: "d4", kind: "bill", label: "Utilities", amount: 1800, target_amount: null },
      ];

  const trend = hasData
    ? entries!
        .filter((e) => e.kind === "expense" || e.kind === "saving")
        .map((e) => ({ month: new Date(e.month).toLocaleDateString(undefined, { month: "short" }), amount: Number(e.amount) }))
    : [
        { month: "Feb", amount: 18000 },
        { month: "Mar", amount: 21000 },
        { month: "Apr", amount: 19500 },
        { month: "May", amount: 24000 },
        { month: "Jun", amount: 27500 },
      ];

  return (
    <div>
      <PageHeader title="Finance" subtitle="Income, expenses, and where your money's going." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-muted">This month</h2>
          <p className="mt-3 text-2xl font-semibold text-ink dark:text-white">₱{income.toLocaleString()}</p>
          <p className="text-xs text-muted">Income</p>
          <p className="mt-3 text-2xl font-semibold text-alc-rose">₱{expenses.toLocaleString()}</p>
          <p className="text-xs text-muted">Expenses</p>
        </div>

        <div className="glass-card flex items-center justify-around p-5">
          <ProgressRing percent={budgetUsedPct} label="Budget used" gradientId="ringBudget" />
          <ProgressRing percent={savingsPct} label="Savings goal" gradientId="ringSavings" />
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-muted">Weekly budget tracker</h2>
          <div className="mt-3 flex flex-col gap-2">
            {["Week 1", "Week 2", "Week 3", "Week 4"].map((w, i) => (
              <div key={w} className="flex items-center gap-3">
                <span className="w-14 text-xs text-muted">{w}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-alc-cream">
                  <div className="h-full rounded-full bg-alc-gradient" style={{ width: `${[80, 60, 95, 40][i]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-muted">Spending trend</h2>
          <FinanceTrendChart data={trend} />
        </div>

        <FinanceLineItems initialItems={lineItems as any} userId={user?.id ?? ""} />
      </div>
    </div>
  );
}
