import env from "@kyuar/env";

import { Editor } from "~/components/editor";

export const dynamic = "force-static";

interface PageProps {
  searchParams: Promise<{ data?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { data } = await searchParams;

  return <Editor appUrl={env.NEXT_PUBLIC_APP_URL} initialData={data ?? ""} />;
}
