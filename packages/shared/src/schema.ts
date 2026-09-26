import {
  DEFAULT_STYLE,
  DOT_FIGURES,
  FINDER_INNER_FIGURES,
  FINDER_OUTER_FIGURES,
  type DotShape,
  type FinderInnerShape,
  type FinderOuterShape,
  type Paint,
  type QrStyle,
} from "@kyuar/qr";
import * as z from "zod";

export const MAX_QR_DATA_LENGTH = 2953;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function keysOf<Key extends string>(record: Record<Key, unknown>) {
  return Object.keys(record) as [Key, ...Key[]];
}

const colorSchema = z.string().regex(HEX_COLOR, "Expected a #rrggbb color").toLowerCase();

const stopSchema = z.object({
  offset: z.number().min(0).max(1),
  color: colorSchema,
});

const stopsSchema = z.array(stopSchema).min(2).max(4);

export const paintSchema: z.ZodType<Paint> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid"), color: colorSchema }),
  z.object({ type: z.literal("linear"), angle: z.number().min(0).max(360), stops: stopsSchema }),
  z.object({ type: z.literal("radial"), stops: stopsSchema }),
]);

export const eccSchema = z.enum(["L", "M", "Q", "H"]);
export const dotShapeSchema = z.enum(keysOf<DotShape>(DOT_FIGURES));
export const finderOuterShapeSchema = z.enum(keysOf<FinderOuterShape>(FINDER_OUTER_FIGURES));
export const finderInnerShapeSchema = z.enum(keysOf<FinderInnerShape>(FINDER_INNER_FIGURES));

const D = DEFAULT_STYLE;

export const qrStyleSchema: z.ZodType<QrStyle, unknown> = z.object({
  ecc: eccSchema.default(D.ecc),
  boostEcc: z.boolean().default(D.boostEcc),
  minVersion: z.number().int().min(1).max(40).default(D.minVersion),
  mask: z.number().int().min(0).max(7).nullable().default(D.mask),
  margin: z.number().int().min(0).max(8).default(D.margin),
  background: paintSchema.default(D.background),
  backgroundRadius: z.number().min(0).max(1).default(D.backgroundRadius),
  data: z
    .object({
      shape: dotShapeSchema.default(D.data.shape),
      paint: paintSchema.default(D.data.paint),
    })
    .default(D.data),
  finderOuter: z
    .object({
      shape: finderOuterShapeSchema.default(D.finderOuter.shape),
      paint: paintSchema.default(D.finderOuter.paint),
    })
    .default(D.finderOuter),
  finderInner: z
    .object({
      shape: finderInnerShapeSchema.default(D.finderInner.shape),
      paint: paintSchema.default(D.finderInner.paint),
    })
    .default(D.finderInner),
  alignment: z
    .object({
      mode: z.enum(["data", "finder"]).default(D.alignment.mode),
      paint: paintSchema.default(D.alignment.paint),
    })
    .default(D.alignment),
  timing: z.object({ paint: paintSchema.default(D.timing.paint) }).default(D.timing),
  logo: z.object({ ratio: z.number().min(0).max(0.3).default(D.logo.ratio) }).default(D.logo),
});

export const formatSchema = z.enum(["svg", "png", "jpg"]);

export const qrRequestSchema = z.object({
  data: z.string().min(1, "Enter something to encode").max(MAX_QR_DATA_LENGTH),
  format: formatSchema.default("png"),
  style: qrStyleSchema.default(D),
});

export type QrRequest = z.infer<typeof qrRequestSchema>;
export type QrFormat = z.infer<typeof formatSchema>;

export const shareRequestSchema = qrRequestSchema.omit({ format: true }).extend({
  title: z.string().max(64).optional(),
});

export type ShareRequest = z.infer<typeof shareRequestSchema>;
