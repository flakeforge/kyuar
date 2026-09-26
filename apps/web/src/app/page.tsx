import { decodeStartParam } from "@kyuar/shared";

import { Editor } from "~/components/editor/editor";

interface PageProps {
  searchParams: Promise<{ data?: string | string[]; tgWebAppStartParam?: string | string[] }>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialData = first(params.data) ?? decodeStartParam(first(params.tgWebAppStartParam));

  return <Editor initialData={initialData ?? ""} />;
}
