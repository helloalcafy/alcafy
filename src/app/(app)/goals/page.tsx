import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import GoalsBoard from "@/components/GoalsBoard";

const FALLBACK_GOALS = [
  { id: "demo-1", title: "Dream house", note: "A quiet place with a garden, by 2029", target_date: "2029-01-01", progress: 35, image_url: null },
  { id: "demo-2", title: "Dream car", note: "Something reliable for long drives", target_date: "2027-06-01", progress: 60, image_url: null },
  { id: "demo-3", title: "Dream phone", note: "Next upgrade, no rush", target_date: null, progress: 10, image_url: null },
];

export default async function GoalsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user?.id).order("created_at");
  const items = goals && goals.length ? goals : FALLBACK_GOALS;

  return (
    <div>
      <PageHeader title="Goals" subtitle="The things you're working toward." />
      <GoalsBoard initialGoals={items as any} userId={user?.id ?? ""} />
    </div>
  );
}
