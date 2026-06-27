import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import TravelBoard from "@/components/TravelBoard";

const FALLBACK = [
  { id: "p1", name: "Kyoto, Japan", notes: "Cherry blossom season", visited: false, image_url: null },
  { id: "p2", name: "Siargao, Philippines", notes: "Surfing trip with friends", visited: true, image_url: null },
  { id: "p3", name: "Lisbon, Portugal", notes: "Tram rides and pastel de nata", visited: false, image_url: null },
];

export default async function TravelPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: places } = await supabase.from("travel_places").select("*").eq("user_id", user?.id);
  const list = places?.length ? places : FALLBACK;

  return (
    <div>
      <PageHeader title="Travel" subtitle="Where you're dreaming of, and where you've been." />
      <TravelBoard initialPlaces={list as any} userId={user?.id ?? ""} />
    </div>
  );
}
