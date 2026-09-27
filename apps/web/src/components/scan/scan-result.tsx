"use client";

import { checkLink, type LinkWarning, type ScannedContent } from "@kyuar/shared";
import { Alert, AlertDescription } from "@kyuar/ui/components/alert";
import { Badge } from "@kyuar/ui/components/badge";
import { Button } from "@kyuar/ui/components/button";
import { toast } from "@kyuar/ui/lib/toast";
import {
  CopyIcon,
  ExternalLinkIcon,
  MapPinIcon,
  PaletteIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { useMessages } from "~/i18n";
import type { Messages } from "~/i18n/en";
import { copyText, openExternal } from "~/lib/scanner";
import { haptic } from "~/lib/telegram";

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-base font-medium break-all">{children}</dd>
    </div>
  );
}

function headline(content: ScannedContent) {
  if (content.kind === "url") return content.host;
  if (content.kind === "wifi") return content.ssid;
  if (content.kind === "contact") return content.name;
  if (content.kind === "email") return content.address;
  if (content.kind === "phone" || content.kind === "sms") return content.number;
  if (content.kind === "geo") return `${content.latitude}, ${content.longitude}`;
  return content.text;
}

async function copy(text: string, done: string) {
  try {
    await copyText(text);
    haptic("success");
    toast.add({ title: done, type: "success" });
  } catch {
    haptic("error");
  }
}

function detailRows(content: ScannedContent, t: Messages): [string, string][] {
  switch (content.kind) {
    case "url":
      return [[t.scan.kinds.url, content.href]];
    case "wifi":
      return [
        [t.scan.fields.security, content.security],
        ...(content.password
          ? [[t.scan.fields.password, content.password] as [string, string]]
          : []),
      ];
    case "contact":
      return [
        ...(content.organization
          ? [[t.scan.fields.organization, content.organization] as [string, string]]
          : []),
        ...content.phones.map((phone): [string, string] => [t.scan.fields.phone, phone]),
        ...content.emails.map((email): [string, string] => [t.scan.fields.email, email]),
      ];
    case "email":
      return [
        ...(content.subject ? [[t.scan.fields.subject, content.subject] as [string, string]] : []),
        ...(content.body ? [[t.scan.fields.message, content.body] as [string, string]] : []),
      ];
    case "sms":
      return content.body ? [[t.scan.fields.message, content.body]] : [];
    default:
      return [];
  }
}

function Details({ content }: { content: ScannedContent }) {
  const t = useMessages();
  const rows = detailRows(content, t);
  if (rows.length === 0) return null;
  return (
    <dl className="flex flex-col gap-3">
      {rows.map(([label, value]) => (
        <Detail key={`${label}-${value}`} label={label}>
          {value}
        </Detail>
      ))}
    </dl>
  );
}

function LinkSafety({ warnings }: { warnings: LinkWarning[] }) {
  const t = useMessages();
  if (warnings.length === 0) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <ShieldCheckIcon className="size-4" aria-hidden="true" />
        {t.scan.safe}
      </p>
    );
  }
  return (
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertDescription>
        <ul className="flex flex-col gap-1">
          {warnings.map((warning) => (
            <li key={warning}>{t.scan.warnings[warning]}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function OpenLinkButton({ href, warnings }: { href: string; warnings: LinkWarning[] }) {
  const t = useMessages();
  const [confirmed, setConfirmed] = useState(false);
  const risky = warnings.length > 0;

  if (warnings.includes("unsafe-scheme")) return null;
  return (
    <Button
      size="xl"
      variant={risky && !confirmed ? "outline" : "default"}
      onClick={() => {
        if (risky && !confirmed) {
          setConfirmed(true);
          return;
        }
        openExternal(href);
      }}
    >
      <ExternalLinkIcon data-icon="inline-start" />
      {risky && confirmed ? t.scan.actions.openAnyway : t.scan.actions.open}
    </Button>
  );
}

interface ScanResultProps {
  content: ScannedContent;
  onRestyle: (text: string) => void;
}

export function ScanResult({ content, onRestyle }: ScanResultProps) {
  const t = useMessages();
  const warnings = content.kind === "url" ? checkLink(content.href) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          {t.scan.kinds[content.kind]}
        </Badge>
        <p className="text-lg font-semibold break-all">{headline(content)}</p>
      </div>

      <Details content={content} />
      {content.kind === "url" && <LinkSafety warnings={warnings} />}

      <div className="flex flex-col gap-2">
        {content.kind === "url" && <OpenLinkButton href={content.href} warnings={warnings} />}
        {content.kind === "geo" && (
          <Button
            size="xl"
            onClick={() =>
              openExternal(
                `https://www.openstreetmap.org/?mlat=${content.latitude}&mlon=${content.longitude}#map=17/${content.latitude}/${content.longitude}`,
              )
            }
          >
            <MapPinIcon data-icon="inline-start" />
            {t.scan.actions.map}
          </Button>
        )}
        {content.kind === "wifi" && content.password && (
          <Button
            size="xl"
            onClick={() => void copy(content.password ?? "", t.scan.actions.copied)}
          >
            <CopyIcon data-icon="inline-start" />
            {t.scan.actions.copyPassword}
          </Button>
        )}
        <Button
          size="xl"
          variant="secondary"
          onClick={() => void copy(content.raw, t.scan.actions.copied)}
        >
          <CopyIcon data-icon="inline-start" />
          {t.scan.actions.copy}
        </Button>
        <Button size="xl" variant="ghost" onClick={() => onRestyle(content.raw)}>
          <PaletteIcon data-icon="inline-start" />
          {t.scan.actions.restyle}
        </Button>
      </div>
    </div>
  );
}
