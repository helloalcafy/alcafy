import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import ContentBoard from "@/components/ContentBoard";

const DEFAULT_STATUSES = [
  { id: "to-shoot", name: "To Shoot" },
  { id: "to-edit", name: "To Edit" },
  { id: "to-upload", name: "To Upload" },
  { id: "done", name: "Done" },
];

const FALLBACK_ITEMS = [
  { id: "c1", statusId: "to-shoot", title: "Studio tour reel", meta: "Instagram", dateLabel: "Jul 1" },
  { id: "c2", statusId: "to-edit", title: "Q&A long-form", meta: "YouTube", dateLabel: "Jun 29" },
  { id: "c3", statusId: "done", title: "Behind the scenes", meta: "TikTok", dateLabel: "Jun 22" },
];

export default async function ContentPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: statusRows } = await supabase.from("content_statuses").select("*").eq("user_id", user?.id).order("position");
  const { data: itemRows } = await supabase.from("content_items").select("*").eq("user_id", user?.id).order("position");

  const statuses = statusRows?.length ? statusRows.map((s) => ({ id: s.id, name: s.name })) : DEFAULT_STATUSES;
  const cards = itemRows?.length
    ? itemRows.map((c) => ({
        id: c.id,
        statusId: c.status_id,
        title: c.title,
        meta: c.platform,
        dateLabel: c.post_date ? new Date(c.post_date).toLocaleDateString() : undefined,
        description: c.notes,
        thumbnailUrl: c.thumbnail_url,
      }))
    : FALLBACK_ITEMS;

  return (
    <div>
      <PageHeader title="Content" subtitle="From idea to upload." />
      <ContentBoard initialStatuses={statuses} initialCards={cards} userId={user?.id ?? ""} />
    </div>
  );
}
