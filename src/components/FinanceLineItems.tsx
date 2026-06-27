"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/Modal";
import AddButton from "@/components/AddButton";
import { X } from "@phosphor-icons/react/dist/ssr";

type Entry = { id: string; kind: string; label: string; amount: number; target_amount: number | null };
const EMPTY: Entry = { id: "", kind: "saving", label: "", amount: 0, target_amount: null };

export default function FinanceLineItems({ initialItems, userId }: { initialItems: Entry[]; userId: string }) {
  const supabase = createClient();
  const [items, setItems] = useState<Entry[]>(initialItems);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [isNew, setIsNew] = useState(false);

  function openNew() {
    setEditing({ ...EMPTY });
    setIsNew(true);
  }
  function openEdit(item: Entry) {
    setEditing({ ...item });
    setIsNew(false);
  }

  async function handleDelete(id: string) {
    setItems((i) => i.filter((x) => x.id !== id));
    await supabase.from("finance_entries").delete().eq("id", id);
  }

  async function handleSave() {
    if (!editing) return;
    const month = new Date();
    month.setDate(1);
    if (isNew) {
      const { data } = await supabase
        .from("finance_entries")
        .insert({
          user_id: userId,
          kind: editing.kind,
          label: editing.label || "Untitled",
          amount: editing.amount,
          target_amount: editing.target_amount,
          month: month.toISOString().slice(0, 10),
        })
        .select()
        .single();
      if (data) setItems((i) => [...i, data as Entry]);
    } else {
      await supabase
        .from("finance_entries")
        .update({ kind: editing.kind, label: editing.label, amount: editing.amount, target_amount: editing.target_amount })
        .eq("id", editing.id);
      setItems((i) => i.map((x) => (x.id === editing.id ? editing : x)));
    }
    setEditing(null);
  }

  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">Savings, debts, tuition & bills</h2>
        <AddButton label="Add" onClick={openNew} />
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => openEdit(item)}
            className="editable-card relative flex cursor-pointer items-center justify-between rounded-glass-sm bg-white/50 px-3 py-2 text-sm"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
              className="card-delete-btn"
            >
              <X size={13} weight="bold" />
            </button>
            <span className="text-ink">{item.label}</span>
            <span className="font-medium text-alc-rose">
              ₱{Number(item.amount).toLocaleString()}
              {item.target_amount ? ` / ₱${Number(item.target_amount).toLocaleString()}` : ""}
            </span>
          </li>
        ))}
      </ul>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? "Add item" : "Edit item"}>
        {editing && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Type</label>
              <select
                value={editing.kind}
                onChange={(e) => setEditing({ ...editing, kind: e.target.value })}
                className="w-full rounded-glass-sm border border-alc-pink/50 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-alc-rose"
              >
                <option value="saving">Savings</option>
                <option value="debt">Debt</option>
                <option value="tuition">Tuition</option>
                <option value="bill">Bill</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Label</label>
              <input
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                className="w-full rounded-glass-sm border border-alc-pink/50 bg-white/70 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-alc-rose"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Amount</label>
                <input
                  type="number"
                  value={editing.amount}
                  onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })}
                  className="w-full rounded-glass-sm border border-alc-pink/50 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-alc-rose"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Target (optional)</label>
                <input
                  type="number"
                  value={editing.target_amount ?? ""}
                  onChange={(e) => setEditing({ ...editing, target_amount: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-glass-sm border border-alc-pink/50 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-alc-rose"
                />
              </div>
            </div>
            <button onClick={handleSave} className="btn-gradient mt-2 text-sm">
              Save item
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
