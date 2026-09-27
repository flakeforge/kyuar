import { decodeStartParam, SCAN_START_PARAM } from "@kyuar/shared";

import { Editor } from "~/components/editor/editor";

interface PageProps {
  searchParams: Promise<{
    data?: string | string[];
    mode?: string | string[];
    tgWebAppStartParam?: string | string[];
  }>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const startParam = first(params.tgWebAppStartParam);
  const scanFirst = first(params.mode) === "scan" || startParam === SCAN_START_PARAM;
  const initialData = first(params.data) ?? (scanFirst ? undefined : decodeStartParam(startParam));

  return <Editor initialData={initialData ?? ""} initialMode={scanFirst ? "scan" : "create"} />;
}
