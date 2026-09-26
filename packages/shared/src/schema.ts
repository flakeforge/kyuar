import * as z from "zod";

export const MAX_QR_DATA_LENGTH = 1200;

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const eccSchema = z.enum(["L", "M", "Q", "H"]);
export const moduleStyleSchema = z.enum(["square", "rounded", "dot", "fluid"]);
export const finderStyleSchema = z.enum(["square", "rounded", "circle", "ring"]);

export const qrRequestSchema = z.object({
  data: z.string().min(1, "Enter something to encode").max(MAX_QR_DATA_LENGTH),
  ecc: eccSchema.default("M"),
  moduleStyle: moduleStyleSchema.default("fluid"),
  finderStyle: finderStyleSchema.default("ring"),
  foreground: z.string().regex(HEX_COLOR, "Expected a #rrggbb color").default("#ffffff"),
  background: z.string().regex(HEX_COLOR, "Expected a #rrggbb color").default("#2547ff"),
  margin: z.coerce.number().int().min(0).max(8).default(3),
  moduleSize: z.coerce.number().int().min(4).max(40).default(16),
  cornerRadius: z.coerce.number().min(0).max(1).default(0.5),
  logoRatio: z.coerce.number().min(0).max(0.3).default(0),
  format: z.enum(["svg", "png"]).default("png"),
});

export type QrRequest = z.infer<typeof qrRequestSchema>;

export const shareRequestSchema = qrRequestSchema.omit({ format: true }).extend({
  title: z.string().max(64).optional(),
});

export type ShareRequest = z.infer<typeof shareRequestSchema>;
