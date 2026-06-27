import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import JournalBoard from "@/components/JournalBoard";

const FALLBACK_ENTRIES = [
  { id: "j1", mood: "happy", body: "Finished the client deck early, felt productive today.", entry_date: "2026-06-24" },
  { id: "j2", mood: "sleepy", body: "Slow start but caught up on readings by evening.", entry_date: "2026-06-22" },
];

export default async function JournalPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user?.id)
    .order("entry_date", { ascending: false });

  const list = entries?.length ? entries : FALLBACK_ENTRIES;

  return (
    <div>
      <PageHeader title="Journal" subtitle="A daily place to put your thoughts down." />
      <JournalBoard initialEntries={list as any} userId={user?.id ?? ""} />
    </div>
  );
}
