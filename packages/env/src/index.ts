import { defineEnv } from "envin";
import * as z from "zod";

const env = defineEnv({
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },

  server: {
    BOT_TOKEN: z.string().min(1, "BOT_TOKEN is required, get one from @BotFather"),
    BOT_WEBHOOK_SECRET: z
      .string()
      .min(16, "BOT_WEBHOOK_SECRET must be at least 16 characters, run: just secret"),
    BOT_USERNAME: z
      .string()
      .min(1)
      .regex(/^[A-Za-z0-9_]+$/, "BOT_USERNAME must not include the leading @"),
    APP_URL: z
      .url("APP_URL must be an absolute URL")
      .transform((value) => value.replace(/\/$/, ""))
      .refine(
        (value) => process.env.NODE_ENV !== "production" || value.startsWith("https://"),
        "APP_URL must use https in production, Telegram rejects other Mini App URLs",
      ),
    CLOUDFLARE_TUNNEL_TOKEN: z.string().optional(),
  },

  env: process.env,

  isServer: !("window" in globalThis),

  skip: process.env.SKIP_ENV_VALIDATION === "true",

  onError: (issues) => {
    console.error("Invalid environment variables:");
    for (const issue of issues) {
      console.error(`  ${issue.path?.join(".") ?? "(root)"}: ${issue.message}`);
    }
    throw new Error("Environment validation failed");
  },

  onInvalidAccess: (variable) => {
    throw new Error(`Attempted to access server variable "${variable}" on the client`);
  },
});

export default env;
