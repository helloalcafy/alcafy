"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/Modal";
import EditableCard from "@/components/EditableCard";
import AddButton from "@/components/AddButton";
import { MOODS, moodIcon, moodLabel } from "@/lib/moods";

type Entry = { id: string; mood: string; body: string; entry_date: string };

export default function JournalBoard({ initialEntries, userId }: { initialEntries: Entry[]; userId: string }) {
  const supabase = createClient();
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [mood, setMood] = useState("happy");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);

  async function handleAdd() {
    if (!body.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from("journal_entries")
      .insert({ user_id: userId, mood, body, entry_date: new Date().toISOString().slice(0, 10) })
      .select()
      .single();
    if (data) setEntries((e) => [data as Entry, ...e]);
    setBody("");
    setSaving(false);
  }

  async function handleSaveEdit() {
    if (!editing) return;
    await supabase
      .from("journal_entries")
      .update({ mood: editing.mood, body: editing.body, entry_date: editing.entry_date })
      .eq("id", editing.id);
    setEntries((e) => e.map((item) => (item.id === editing.id ? editing : item)));
    setEditing(null);
  }

  async function handleDelete(id: string) {
    setEntries((e) => e.filter((item) => item.id !== id));
    await supabase.from("journal_entries").delete().eq("id", id);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="glass-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-muted">How are you feeling?</h2>
          <div className="mb-4 flex justify-between">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMood(m.key)}
                className={`flex flex-col items-center gap-1 rounded-glass-sm px-1.5 py-1.5 transition-transform ${
                  mood === m.key ? "scale-110 bg-alc-pink/30" : "opacity-60"
                }`}
                aria-label={m.label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.icon} alt={m.label} className="h-9 w-9 object-contain" />
              </button>
            ))}
          </div>
          <textarea
            id="journal-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write whatever's on your mind…"
            rows={6}
            className="w-full resize-none rounded-glass-sm border border-alc-pink/50 bg-white/70 p-3 text-sm text-ink outline-none focus:border-alc-rose"
          />
          <button onClick={handleAdd} disabled={saving} className="btn-gradient mt-3 w-full text-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save entry"}
          </button>
        </div>
      </div>

      <div className="glass-card p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Past entries</h2>
          <AddButton label="Add entry" onClick={() => document.getElementById("journal-textarea")?.focus()} />
        </div>
        <ul className="flex flex-col gap-3">
          {entries.map((e) => (
            <EditableCard key={e.id} onClick={() => setEditing({ ...e })} onDelete={() => handleDelete(e.id)} className="!shadow-none">
              <div className="flex items-start gap-3 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={moodIcon(e.mood)} alt={moodLabel(e.mood)} className="h-9 w-9 shrink-0 object-contain" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-medium text-alc-rose">{moodLabel(e.mood)}</span>
                    <span>{new Date(e.entry_date).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink">{e.body}</p>
                </div>
              </div>
            </EditableCard>
          ))}
        </ul>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit entry">
        {editing && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setEditing({ ...editing, mood: m.key })}
                  className={`flex flex-col items-center gap-1 rounded-glass-sm px-1.5 py-1.5 transition-transform ${
                    editing.mood === m.key ? "scale-110 bg-alc-pink/30" : "opacity-60"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.icon} alt={m.label} className="h-9 w-9 object-contain" />
                </button>
              ))}
            </div>
            <textarea
              rows={5}
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              className="w-full resize-none rounded-glass-sm border border-alc-pink/50 bg-white/70 p-3 text-sm text-ink outline-none focus:border-alc-rose"
            />
            <button onClick={handleSaveEdit} className="btn-gradient mt-1 text-sm">
              Save changes
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
