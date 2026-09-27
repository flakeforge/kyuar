"use client";

import {
  canEncode,
  hexToOklch,
  DEFAULT_STYLE,
  DEFAULT_THEME,
  paintColors,
  THEMES,
  withColors,
  type DotShape,
  type FinderInnerShape,
  type FinderOuterShape,
  type GrayImage,
  type QrStyle,
  type QrTheme,
} from "@kyuar/qr";
import { classifyContent, type RenderRequest } from "@kyuar/shared";
import { useCallback, useMemo, useState } from "react";

export interface HalftoneState {
  dataUrl: string;
  image: GrayImage;
  centerRatio: number;
  contrast: number;
}

const SURPRISE_DOTS: DotShape[] = ["fluid", "dot", "classy-rounded", "blobs", "soft", "diamond"];
const SURPRISE_OUTER: FinderOuterShape[] = ["dot", "extra-rounded", "classy", "inpoint", "rounded"];
const SURPRISE_INNER: FinderInnerShape[] = ["dot", "extra-rounded", "classy", "square", "diamond"];

const NEUTRAL_CHROMA = 0.03;

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

export function useEditor(initialData: string) {
  const [value, setValue] = useState(initialData);
  const [style, setStyle] = useState<QrStyle>(() =>
    withColors(DEFAULT_STYLE, DEFAULT_THEME.foreground, DEFAULT_THEME.background),
  );
  const [themeId, setThemeId] = useState<string | null>(DEFAULT_THEME.id);
  const [logo, setLogo] = useState<string | null>(null);
  const [halftone, setHalftone] = useState<HalftoneState | null>(null);

  const isEmpty = value.trim() === "";
  const content = classifyContent(isEmpty ? "kyuar.app" : value);
  const effectiveStyle = useMemo<QrStyle>(
    () =>
      logo
        ? { ...style, logo: { ratio: style.logo.ratio || 0.22 } }
        : { ...style, logo: { ratio: 0 } },
    [logo, style],
  );
  const fits = useMemo(
    () => canEncode(content.value, effectiveStyle),
    [content.value, effectiveStyle],
  );

  const update = useCallback((patch: Partial<QrStyle>, keepTheme = true) => {
    setStyle((current) => ({ ...current, ...patch }));
    if (!keepTheme) setThemeId(null);
  }, []);

  const applyTheme = useCallback((theme: QrTheme) => {
    setStyle((current) => withColors(current, theme.foreground, theme.background));
    setThemeId(theme.id);
  }, []);

  const surprise = useCallback((): (() => void) => {
    const previous = { style, themeId };
    const theme = pick(THEMES.filter((item) => item.id !== themeId));
    setStyle((current) => {
      const colored = withColors(current, theme.foreground, theme.background);
      return {
        ...colored,
        data: { ...colored.data, shape: pick(SURPRISE_DOTS) },
        finderOuter: { ...colored.finderOuter, shape: pick(SURPRISE_OUTER) },
        finderInner: { ...colored.finderInner, shape: pick(SURPRISE_INNER) },
      };
    });
    setThemeId(theme.id);
    return () => {
      setStyle(previous.style);
      setThemeId(previous.themeId);
    };
  }, [style, themeId]);

  const request = useMemo<RenderRequest>(
    () => ({
      data: content.value,
      style: effectiveStyle,
      logo: logo ?? undefined,
      halftone: halftone
        ? {
            image: halftone.dataUrl,
            centerRatio: halftone.centerRatio,
            contrast: halftone.contrast,
          }
        : undefined,
    }),
    [content.value, effectiveStyle, halftone, logo],
  );

  const [background = DEFAULT_THEME.background] = paintColors(style.background);
  const [ink = DEFAULT_THEME.foreground] = paintColors(style.data.paint);
  const neutralBackground = hexToOklch(background).c < NEUTRAL_CHROMA;
  const tintFromInk = neutralBackground && hexToOklch(ink).c > hexToOklch(background).c;
  const themeColor = tintFromInk ? ink : background;
  const inkColor = tintFromInk ? background : ink;

  return {
    value,
    setValue,
    isEmpty,
    content,
    style: effectiveStyle,
    update,
    themeId,
    applyTheme,
    surprise,
    logo,
    setLogo,
    halftone,
    setHalftone,
    fits,
    request,
    themeColor,
    inkColor,
  };
}

export type EditorModel = ReturnType<typeof useEditor>;
