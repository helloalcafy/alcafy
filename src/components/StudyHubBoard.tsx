"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import EditableCard from "@/components/EditableCard";
import Modal from "@/components/Modal";
import AddButton from "@/components/AddButton";
import { X } from "@phosphor-icons/react/dist/ssr";

type Item = { id: string; kind: string; title: string; due_date: string | null; done: boolean };
type Subject = { id: string; name: string; items: Item[] };
type Cert = { id: string; title: string; provider: string | null; status: string; progress: number };

const EMPTY_CERT: Cert = { id: "", title: "", provider: "", status: "not_started", progress: 0 };

export default function StudyHubBoard({
  initialSubjects,
  initialCerts,
  userId,
}: {
  initialSubjects: Subject[];
  initialCerts: Cert[];
  userId: string;
}) {
  const supabase = createClient();
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [certs, setCerts] = useState<Cert[]>(initialCerts);
  const [editingCert, setEditingCert] = useState<Cert | null>(null);
  const [isNewCert, setIsNewCert] = useState(false);

  async function addSubject() {
    const { data } = await supabase.from("subjects").insert({ user_id: userId, name: "New subject" }).select().single();
    if (data) setSubjects((s) => [...s, { id: data.id, name: data.name, items: [] }]);
  }

  async function renameSubject(id: string, name: string) {
    setSubjects((s) => s.map((subj) => (subj.id === id ? { ...subj, name } : subj)));
    await supabase.from("subjects").update({ name }).eq("id", id);
  }

  async function deleteSubject(id: string) {
    setSubjects((s) => s.filter((subj) => subj.id !== id));
    await supabase.from("subjects").delete().eq("id", id);
  }

  async function addItem(subjectId: string) {
    const { data } = await supabase
      .from("subject_items")
      .insert({ user_id: userId, subject_id: subjectId, kind: "assignment", title: "New item", done: false })
      .select()
      .single();
    if (data) {
      setSubjects((s) =>
        s.map((subj) => (subj.id === subjectId ? { ...subj, items: [...subj.items, data as Item] } : subj))
      );
    }
  }

  async function toggleItem(subjectId: string, item: Item) {
    const updated = { ...item, done: !item.done };
    setSubjects((s) =>
      s.map((subj) =>
        subj.id === subjectId ? { ...subj, items: subj.items.map((i) => (i.id === item.id ? updated : i)) } : subj
      )
    );
    await supabase.from("subject_items").update({ done: updated.done }).eq("id", item.id);
  }

  async function deleteItem(subjectId: string, itemId: string) {
    setSubjects((s) =>
      s.map((subj) => (subj.id === subjectId ? { ...subj, items: subj.items.filter((i) => i.id !== itemId) } : subj))
    );
    await supabase.from("subject_items").delete().eq("id", itemId);
  }

  function openNewCert() {
    setEditingCert({ ...EMPTY_CERT });
    setIsNewCert(true);
  }
  function openEditCert(c: Cert) {
    setEditingCert({ ...c });
    setIsNewCert(false);
  }

  async function saveCert() {
    if (!editingCert) return;
    if (isNewCert) {
      const { data } = await supabase
        .from("certifications")
        .insert({
          user_id: userId,
          title: editingCert.title || "Untitled certification",
          provider: editingCert.provider,
          status: editingCert.status,
          progress: editingCert.progress,
        })
        .select()
        .single();
      if (data) setCerts((c) => [...c, data as Cert]);
    } else {
      await supabase
        .from("certifications")
        .update({
          title: editingCert.title,
          provider: editingCert.provider,
          status: editingCert.status,
          progress: editingCert.progress,
        })
        .eq("id", editingCert.id);
      setCerts((c) => c.map((item) => (item.id === editingCert.id ? editingCert : item)));
    }
    setEditingCert(null);
  }

  async function deleteCert(id: string) {
    setCerts((c) => c.filter((item) => item.id !== id));
    await supabase.from("certifications").delete().eq("id", id);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="glass-card p-5 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Subjects</h2>
          <AddButton label="Add subject" onClick={addSubject} />
        </div>
        <div className="flex flex-col gap-4">
          {subjects.map((s) => (
            <div key={s.id} className="group rounded-glass-sm border border-white/50 bg-white/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <input
                  value={s.name}
                  onChange={(e) => renameSubject(s.id, e.target.value)}
                  className="rounded-glass-sm bg-transparent font-medium text-ink outline-none focus:bg-white/70 focus:px-1"
                />
                <button
                  onClick={() => deleteSubject(s.id)}
                  className="rounded-full p-1 text-muted opacity-0 transition-opacity hover:bg-alc-rose/20 hover:text-alc-rose group-hover:opacity-100"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {s.items.map((i) => (
                  <li key={i.id} className="group/item flex items-center justify-between text-sm">
                    <button
                      onClick={() => toggleItem(s.id, i)}
                      className={`flex-1 text-left ${i.done ? "text-muted line-through" : "text-ink"}`}
                    >
                      {i.kind === "exam" ? "📝 " : "📄 "}
                      {i.title}
                    </button>
                    <div className="flex items-center gap-2">
                      {i.due_date && <span className="text-xs text-muted">{new Date(i.due_date).toLocaleDateString()}</span>}
                      <button
                        onClick={() => deleteItem(s.id, i.id)}
                        className="rounded-full p-1 text-muted opacity-0 transition-opacity hover:bg-alc-rose/20 hover:text-alc-rose group-hover/item:opacity-100"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => addItem(s.id)}
                className="mt-2 text-xs font-medium text-alc-rose hover:underline"
              >
                + Add assignment or exam
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Online certifications</h2>
          <AddButton label="Add" onClick={openNewCert} />
        </div>
        <div className="flex flex-col gap-3">
          {certs.map((c) => (
            <EditableCard key={c.id} onClick={() => openEditCert(c)} onDelete={() => deleteCert(c.id)} className="!shadow-none">
              <div className="p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{c.title}</span>
                  <span className="text-xs capitalize text-muted">{c.status.replace("_", " ")}</span>
                </div>
                {c.provider && <p className="text-xs text-muted">{c.provider}</p>}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-alc-cream">
                  <div className="h-full rounded-full bg-alc-gradient" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            </EditableCard>
          ))}
        </div>
      </div>

      <Modal open={!!editingCert} onClose={() => setEditingCert(null)} title={isNewCert ? "Add certification" : "Edit certification"}>
        {editingCert && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Title</label>
              <input
                value={editingCert.title}
                onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                className="w-full rounded-glass-sm border border-alc-pink/50 bg-white/70 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-alc-rose"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Provider</label>
              <input
                value={editingCert.provider ?? ""}
                onChange={(e) => setEditingCert({ ...editingCert, provider: e.target.value })}
                className="w-full rounded-glass-sm border border-alc-pink/50 bg-white/70 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-alc-rose"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Status</label>
                <select
                  value={editingCert.status}
                  onChange={(e) => setEditingCert({ ...editingCert, status: e.target.value })}
                  className="w-full rounded-glass-sm border border-alc-pink/50 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-alc-rose"
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Progress %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editingCert.progress}
                  onChange={(e) => setEditingCert({ ...editingCert, progress: Number(e.target.value) })}
                  className="w-full rounded-glass-sm border border-alc-pink/50 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-alc-rose"
                />
              </div>
            </div>
            <button onClick={saveCert} className="btn-gradient mt-2 text-sm">
              Save certification
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
