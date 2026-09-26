"use client";

import { Badge } from "@kyuar/ui/components/badge";
import { Field, FieldLabel } from "@kyuar/ui/components/field";
import { Input } from "@kyuar/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kyuar/ui/components/tabs";
import { useEffect, useId } from "react";

import { useMessages } from "~/i18n";
import { setHeaderColor } from "~/lib/telegram";
import { useTelegram } from "~/lib/use-telegram";

import { ActionBar } from "./action-bar";
import { ColorPanel } from "./color-panel";
import { ImagePanel } from "./image-panel";
import { LayoutPanel } from "./layout-panel";
import { Preview } from "./preview";
import { ShapePanel } from "./shape-panel";
import { useEditor } from "./use-editor";

export function Editor({ initialData }: { initialData: string }) {
  const t = useMessages();
  const isTelegram = useTelegram();
  const editor = useEditor(initialData);
  const inputId = useId();
  const { themeColor, inkColor } = editor;

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--theme", themeColor);
    root.setProperty("--theme-ink", inkColor);
    setHeaderColor(themeColor);
  }, [themeColor, inkColor]);

  return (
    <>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pt-[calc(var(--tg-viewport-safe-area-inset-top,0px)+var(--tg-viewport-content-safe-area-inset-top,0px)+1rem)] pb-32">
        <Preview editor={editor} />

        <Field>
          <FieldLabel htmlFor={inputId}>
            {t.input.label}
            <Badge variant="secondary" className="ml-auto">
              {t.input.kind[editor.content.kind]}
            </Badge>
          </FieldLabel>
          <Input
            id={inputId}
            value={editor.value}
            onChange={(event) => editor.setValue(event.target.value)}
            placeholder={t.input.placeholder}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="h-12 text-base"
          />
        </Field>

        <Tabs defaultValue="shape">
          <TabsList className="w-full">
            <TabsTrigger value="shape">{t.tabs.shape}</TabsTrigger>
            <TabsTrigger value="color">{t.tabs.color}</TabsTrigger>
            <TabsTrigger value="layout">{t.tabs.layout}</TabsTrigger>
            <TabsTrigger value="image">{t.tabs.image}</TabsTrigger>
          </TabsList>
          <TabsContent value="shape" className="pt-4">
            <ShapePanel editor={editor} />
          </TabsContent>
          <TabsContent value="color" className="pt-4">
            <ColorPanel editor={editor} />
          </TabsContent>
          <TabsContent value="layout" className="pt-4">
            <LayoutPanel editor={editor} />
          </TabsContent>
          <TabsContent value="image" className="pt-4">
            <ImagePanel editor={editor} />
          </TabsContent>
        </Tabs>
      </main>

      <ActionBar editor={editor} isTelegram={isTelegram} />
    </>
  );
}
