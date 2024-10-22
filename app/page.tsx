import { Page as AppPage } from "@/components/app-page"
// import { createClient } from '@/utils/supabase/supabase';

export function Page() {
  return <AppPage />
}

export default async function Notes() {
  const supabase = createClient();
  const { data: notes } = await supabase.from("notes").select();

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
