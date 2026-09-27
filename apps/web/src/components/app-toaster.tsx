"use client";

import { Toaster } from "@kyuar/ui/components/toast";
import type { ReactNode } from "react";

import { useMessages } from "~/i18n";

export function AppToaster({ children }: { children: ReactNode }) {
  const t = useMessages();
  return <Toaster closeLabel={t.actions.close}>{children}</Toaster>;
}
