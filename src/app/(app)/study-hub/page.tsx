import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import { GraduationCap } from "@phosphor-icons/react/dist/ssr";
import StudyHubBoard from "@/components/StudyHubBoard";

const FALLBACK_SUBJECTS = [
  {
    id: "s1",
    name: "Data Structures",
    items: [
      { id: "i1", kind: "assignment", title: "Linked list lab", due_date: "2026-07-02", done: false },
      { id: "i2", kind: "exam", title: "Midterm", due_date: "2026-07-10", done: false },
    ],
  },
  {
    id: "s2",
    name: "Marketing 101",
    items: [{ id: "i3", kind: "assignment", title: "Brand audit paper", due_date: "2026-06-29", done: true }],
  },
];

const FALLBACK_CERTS = [
  { id: "c1", title: "Google UX Design", provider: "Coursera", status: "in_progress", progress: 55 },
  { id: "c2", title: "Meta Front-End", provider: "Coursera", status: "not_started", progress: 0 },
];

export default async function StudyHubPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subjects } = await supabase.from("subjects").select("*, subject_items(*)").eq("user_id", user?.id);
  const { data: certs } = await supabase.from("certifications").select("*").eq("user_id", user?.id);

  const subjectList = subjects?.length ? subjects.map((s: any) => ({ ...s, items: s.subject_items })) : FALLBACK_SUBJECTS;
  const certList = certs?.length ? certs : FALLBACK_CERTS;

  const allItems = subjectList.flatMap((s: any) => s.items ?? []);
  const doneCount = allItems.filter((i: any) => i.done).length;
  const gradProgress = allItems.length ? Math.round((doneCount / allItems.length) * 100) : 42;
  const semestersRemaining = subjectList.length ? Math.max(...subjectList.map((s: any) => s.semesters_remaining ?? 2)) : 3;

  return (
    <div>
      <PageHeader title="Study Hub" subtitle="Subjects, assignments, exams, and certifications." />

      <div className="glass-card mb-6 flex items-center gap-5 p-5">
        <GraduationCap size={36} weight="bold" className="text-alc-rose" />
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink dark:text-white">Progress toward graduation</span>
            <span className="text-muted">{gradProgress}% &middot; {semestersRemaining} semesters left</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-alc-cream">
            <div className="h-full rounded-full bg-alc-gradient transition-all" style={{ width: `${gradProgress}%` }} />
          </div>
        </div>
      </div>

      <StudyHubBoard initialSubjects={subjectList as any} initialCerts={certList as any} userId={user?.id ?? ""} />
    </div>
  );
}
