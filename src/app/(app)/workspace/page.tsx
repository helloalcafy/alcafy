import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import WorkspaceBoard from "@/components/WorkspaceBoard";

const DEFAULT_STATUSES = [
  { id: "processing", name: "Processing" },
  { id: "revision", name: "Revision" },
  { id: "done", name: "Done" },
];

const FALLBACK_TASKS = [
  { id: "t1", statusId: "processing", title: "Landing page redesign", meta: "Acme Co.", dateLabel: "Jun 30", tag: "High" },
  { id: "t2", statusId: "revision", title: "Logo concepts v2", meta: "Bloom Studio", dateLabel: "Jul 2", tag: "Urgent" },
  { id: "t3", statusId: "done", title: "Social media kit", meta: "Nova Brand", dateLabel: "Jun 20", tag: "Normal" },
];

export default async function WorkspacePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: statusRows } = await supabase
    .from("workspace_statuses")
    .select("*")
    .eq("user_id", user?.id)
    .order("position");
  const { data: taskRows } = await supabase
    .from("workspace_tasks")
    .select("*")
    .eq("user_id", user?.id)
    .order("position");

  const statuses = statusRows?.length ? statusRows.map((s) => ({ id: s.id, name: s.name })) : DEFAULT_STATUSES;
  const cards = taskRows?.length
    ? taskRows.map((t) => ({
        id: t.id,
        statusId: t.status_id,
        title: t.title,
        meta: t.client,
        dateLabel: t.due_date ? new Date(t.due_date).toLocaleDateString() : undefined,
        tag: t.urgency,
        description: t.description,
      }))
    : FALLBACK_TASKS;

  return (
    <div>
      <PageHeader title="Workspace" subtitle="Track every client and project, board-style." />
      <WorkspaceBoard initialStatuses={statuses} initialCards={cards} userId={user?.id ?? ""} />
    </div>
  );
}
